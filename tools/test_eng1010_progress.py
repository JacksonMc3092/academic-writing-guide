#!/usr/bin/env python3
"""Browser regression for ENG 1010 chapter-completion progress."""

from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8000/1010/"
KEY = "scholarsCompass:1010:completedChapters"


def main() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        page.goto(BASE + "index.html", wait_until="networkidle")
        page.evaluate("localStorage.clear()")
        page.reload(wait_until="networkidle")
        assert page.locator("#progressText").inner_text() == "0 of 14 chapters completed"
        assert page.locator("#overallProgress").get_attribute("aria-valuenow") == "0"

        page.goto(BASE + "chapter-1.html", wait_until="networkidle")
        page.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)")
        page.wait_for_timeout(700)
        completed = page.evaluate(f"JSON.parse(localStorage.getItem('{KEY}') || '[]')")
        assert 1 in completed, completed

        page.goto(BASE + "index.html", wait_until="networkidle")
        assert page.locator("#progressText").inner_text() == "1 of 14 chapters completed"
        assert float(page.locator("#overallProgress").get_attribute("aria-valuenow")) > 7
        assert page.locator('.chapter-link[data-chapter="1"] .completed-badge').is_visible()
        assert not page.locator('.chapter-link[data-chapter="1"] .available-badge').is_visible()

        page.locator("#resetProgress").click()
        assert page.locator("#progressText").inner_text() == "0 of 14 chapters completed"
        assert page.locator("#overallProgress").get_attribute("aria-valuenow") == "0"
        assert page.evaluate(f"localStorage.getItem('{KEY}')") is None

        browser.close()

    print("ENG 1010 progress browser regression passed")


if __name__ == "__main__":
    main()
