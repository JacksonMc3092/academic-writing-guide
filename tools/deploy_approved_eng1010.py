#!/usr/bin/env python3
"""Deploy the approved ENG 1010 preview package into the canonical repository.

This script copies only the approved ENG 1010 pages and the shared assets they
reference. The course hub and ENG 1020 tree remain untouched.
"""

from __future__ import annotations

import subprocess
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from urllib.error import HTTPError, URLError
from urllib.parse import unquote, urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
PREVIEW_BASE = (
    "https://raw.githubusercontent.com/JacksonMc3092/"
    "ScholarsCompassPreviews/main/release-candidate-v2"
)

DESTINATIONS = [
    "1010/index.html",
    "1010/introduction.html",
    *[f"1010/chapter-{number}.html" for number in range(1, 15)],
]

SHARED_ASSETS = {
    "app.js",
    "interactive-tools.js",
    "styles.css",
    "stabilization-0.2.css",
    "revision-round-2.css",
    "revision-round-2.js",
    "favicon.svg",
    "assets/revision-companion.pdf",
    "assets/revision-companion.txt",
    "1010/chapter-12.css",
    "1010/chapter-12-tools.js",
}

APPROVED_ROOT_FILES = {
    "app.js",
    "interactive-tools.js",
    "styles.css",
    "stabilization-0.2.css",
    "revision-round-2.css",
    "revision-round-2.js",
    "favicon.svg",
}

STAGING_PHRASES = (
    "The current chapter includes the video",
    "The video will be included only after it is verified",
    "The revised HTML chapter will use a responsive embed",
    "The site-wide video audit will also confirm",
)


class ReferenceParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.references: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for name, value in attrs:
            if name in {"href", "src"} and value:
                self.references.append(value)


def run(*args: str) -> str:
    return subprocess.check_output(args, cwd=ROOT, text=True).strip()


def download(relative_path: str) -> None:
    url = f"{PREVIEW_BASE}/{relative_path}"
    request = Request(url, headers={"User-Agent": "Scholar's Compass deployment"})
    try:
        with urlopen(request, timeout=45) as response:
            payload = response.read()
    except (HTTPError, URLError) as error:
        raise RuntimeError(f"Could not download approved file {relative_path}: {error}") from error
    destination = ROOT / relative_path
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(payload)
    print(f"Downloaded {relative_path} ({len(payload):,} bytes)", flush=True)


def resolve_local_reference(page_path: str, reference: str) -> str | None:
    parsed = urlsplit(reference)
    if parsed.scheme or parsed.netloc or reference.startswith(("#", "mailto:", "tel:", "data:")):
        return None
    raw_path = unquote(parsed.path)
    if not raw_path:
        return None
    resolved = PurePosixPath(page_path).parent.joinpath(raw_path)
    normalized: list[str] = []
    for part in resolved.parts:
        if part in {"", "."}:
            continue
        if part == "..":
            if normalized:
                normalized.pop()
            continue
        normalized.append(part)
    return "/".join(normalized)


def collect_references(page_path: str) -> set[str]:
    parser = ReferenceParser()
    parser.feed((ROOT / page_path).read_text(encoding="utf-8"))
    return {
        resolved
        for reference in parser.references
        if (resolved := resolve_local_reference(page_path, reference)) is not None
    }


def is_approved_path(path: str) -> bool:
    return (
        path.startswith("1010/")
        or path in APPROVED_ROOT_FILES
        or path.startswith("assets/revision-companion.")
    )


def deploy() -> None:
    for path in [*DESTINATIONS, *sorted(SHARED_ASSETS)]:
        download(path)

    # Fetch any additional local file referenced by the approved pages. Every
    # discovered ENG 1010 asset is refreshed from the same approved package.
    queue = list(DESTINATIONS)
    seen = set(DESTINATIONS) | set(SHARED_ASSETS)
    while queue:
        page = queue.pop()
        for referenced in collect_references(page):
            if not is_approved_path(referenced) or referenced in seen:
                continue
            seen.add(referenced)
            download(referenced)
            if referenced.endswith(".html"):
                queue.append(referenced)


def validate() -> None:
    expected = [ROOT / path for path in DESTINATIONS]
    missing = [str(path.relative_to(ROOT)) for path in expected if not path.exists()]
    if missing:
        raise SystemExit(f"Missing ENG 1010 destinations: {missing}")

    combined = "\n".join(path.read_text(encoding="utf-8") for path in expected)
    for phrase in STAGING_PHRASES:
        if phrase in combined:
            raise SystemExit(f"Production staging language remains: {phrase}")

    chapter2 = (ROOT / "1010/chapter-2.html").read_text(encoding="utf-8")
    assert "View the Detailed Annotation Example on LibreTexts" in chapter2
    assert "gXRwTI7Dv3s" in chapter2

    chapter3 = (ROOT / "1010/chapter-3.html").read_text(encoding="utf-8")
    assert "Mollie Chambers and her coauthors" not in chapter3
    assert "fictional practice article by Jordan Lee" in chapter3

    chapter4 = (ROOT / "1010/chapter-4.html").read_text(encoding="utf-8")
    assert "Here is a practice sentence." in chapter4
    assert "Original Scholar’s Compass practice passage" not in chapter4

    chapter7 = (ROOT / "1010/chapter-7.html").read_text(encoding="utf-8")
    assert "https://openoregon.pressbooks.pub/wrd/chapter/strategies-for-getting-started/" in chapter7

    chapter9 = (ROOT / "1010/chapter-9.html").read_text(encoding="utf-8")
    assert "https://openoregon.pressbooks.pub/wrd/chapter/writing-paragraphs/" in chapter9

    chapter10 = (ROOT / "1010/chapter-10.html").read_text(encoding="utf-8")
    assert "Bloom's Taxonomy Visualizer" in chapter10
    assert "blooms-container" in chapter10

    chapter11 = (ROOT / "1010/chapter-11.html").read_text(encoding="utf-8")
    assert chapter11.count("Adaptation and Attribution") == 1
    assert "Materials adapted from:" not in chapter11

    index = (ROOT / "1010/index.html").read_text(encoding="utf-8")
    assert "Introduction: Writing as Conversation" in index
    assert "Active Reading Strategies" in index
    assert "Synthesis: Putting Sources into Conversation" in index

    for path in DESTINATIONS:
        text = (ROOT / path).read_text(encoding="utf-8")
        if path != "1010/index.html":
            assert "sc-reading-progress" in text, path
            assert "chapter-sequence-nav" in text, path
        for referenced in collect_references(path):
            target = ROOT / referenced
            if referenced.endswith("/"):
                continue
            if not target.exists():
                raise SystemExit(f"Broken local destination from {path}: {referenced}")

    changed = set(run("git", "diff", "--name-only").splitlines())
    unexpected = sorted(path for path in changed if path and not is_approved_path(path))
    if unexpected:
        raise SystemExit(f"Deployment touched unapproved paths: {unexpected}")

    if any(path.startswith("1020/") or path == "index.html" for path in changed):
        raise SystemExit("Course hub or ENG 1020 changed unexpectedly")

    run("git", "diff", "--check")
    print(f"Validated {len(DESTINATIONS)} ENG 1010 destinations and shared assets.")


def main() -> None:
    deploy()
    validate()


if __name__ == "__main__":
    main()

# Diagnostic rerun marker.
