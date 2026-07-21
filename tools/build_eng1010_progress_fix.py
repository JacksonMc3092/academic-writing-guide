#!/usr/bin/env python3
"""Build the isolated ENG 1010 chapter-completion progress module."""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / "eng1010-progress.js"
SCRIPT_TAG = '<script data-sc-progress="1" src="../eng1010-progress.js?v=1"></script>'

JAVASCRIPT = r'''/* Scholar's Compass ENG 1010 chapter completion progress */
(function () {
  'use strict';

  var TOTAL_CHAPTERS = 14;
  var COMPLETED_KEY = 'scholarsCompass:1010:completedChapters';
  var CURRENT_KEY = 'scholarsCompass:1010:currentChapter';

  function is1010() {
    var course = document.body && document.body.getAttribute('data-course');
    return course === '1010' || (window.location.pathname || '').indexOf('/1010/') !== -1;
  }

  function chapterNumberFromPage() {
    var page = document.body && document.body.getAttribute('data-page');
    var match = String(page || window.location.pathname || '').match(/chapter-(\d+)/i);
    if (!match) return null;
    var number = parseInt(match[1], 10);
    return number >= 1 && number <= TOTAL_CHAPTERS ? number : null;
  }

  function normalizeCompleted(value) {
    var numbers = [];
    if (Array.isArray(value)) {
      value.forEach(function (item) {
        var number = parseInt(item, 10);
        if (number >= 1 && number <= TOTAL_CHAPTERS && numbers.indexOf(number) === -1) numbers.push(number);
      });
    } else if (value && typeof value === 'object') {
      Object.keys(value).forEach(function (key) {
        if (!value[key]) return;
        var number = parseInt(key, 10);
        if (number >= 1 && number <= TOTAL_CHAPTERS && numbers.indexOf(number) === -1) numbers.push(number);
      });
    }
    return numbers.sort(function (a, b) { return a - b; });
  }

  function readJSON(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw === null ? null : JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function writeCompleted(completed) {
    try { localStorage.setItem(COMPLETED_KEY, JSON.stringify(normalizeCompleted(completed))); }
    catch (error) {}
  }

  function readCompleted() {
    var completed = normalizeCompleted(readJSON(COMPLETED_KEY));
    if (completed.length) return completed;

    var legacyKeys = ['completedChapters', 'scholarsCompassCompletedChapters'];
    for (var index = 0; index < legacyKeys.length; index += 1) {
      completed = normalizeCompleted(readJSON(legacyKeys[index]));
      if (completed.length) {
        writeCompleted(completed);
        return completed;
      }
    }
    return [];
  }

  function readCurrent() {
    try {
      var number = parseInt(localStorage.getItem(CURRENT_KEY), 10);
      return number >= 1 && number <= TOTAL_CHAPTERS ? number : null;
    } catch (error) {
      return null;
    }
  }

  function writeCurrent(number) {
    try { localStorage.setItem(CURRENT_KEY, String(number)); }
    catch (error) {}
  }

  function markComplete(number) {
    var completed = readCompleted();
    if (completed.indexOf(number) !== -1) return;
    completed.push(number);
    writeCompleted(completed);
  }

  function setVisible(element, visible) {
    if (!element) return;
    element.style.display = visible ? 'inline-flex' : 'none';
  }

  function renderIndexProgress() {
    var progressBar = document.getElementById('overallProgress');
    var progressText = document.getElementById('progressText');
    if (!progressBar || !progressText) return;

    var completed = readCompleted();
    var current = readCurrent();
    var percent = Math.round((completed.length / TOTAL_CHAPTERS) * 1000) / 10;

    progressBar.style.width = percent + '%';
    progressBar.setAttribute('aria-valuenow', String(percent));
    progressBar.setAttribute('aria-label', completed.length + ' of ' + TOTAL_CHAPTERS + ' chapters completed');
    progressText.textContent = completed.length + ' of ' + TOTAL_CHAPTERS + ' chapters completed';

    Array.prototype.slice.call(document.querySelectorAll('.chapter-link[data-chapter]')).forEach(function (link) {
      var number = parseInt(link.getAttribute('data-chapter'), 10);
      var isCompleted = completed.indexOf(number) !== -1;
      var isCurrent = !isCompleted && current === number;
      var card = link.querySelector('.guide-card');
      if (card) {
        card.classList.toggle('chapter-completed', isCompleted);
        card.classList.toggle('chapter-current', isCurrent);
      }
      setVisible(link.querySelector('.completed-badge'), isCompleted);
      setVisible(link.querySelector('.current-badge'), isCurrent);
      setVisible(link.querySelector('.available-badge'), !isCompleted && !isCurrent);
    });
  }

  function initIndex() {
    if (!document.getElementById('overallProgress')) return;
    renderIndexProgress();

    Array.prototype.slice.call(document.querySelectorAll('.chapter-link[data-chapter]')).forEach(function (link) {
      link.addEventListener('click', function () {
        var number = parseInt(link.getAttribute('data-chapter'), 10);
        if (number >= 1 && number <= TOTAL_CHAPTERS) writeCurrent(number);
      });
    });

    var reset = document.getElementById('resetProgress');
    if (reset && reset.getAttribute('data-progress-ready') !== 'true') {
      reset.setAttribute('data-progress-ready', 'true');
      reset.setAttribute('role', 'button');
      reset.setAttribute('tabindex', '0');
      reset.setAttribute('aria-label', 'Reset ENG 1010 chapter progress');

      var clearProgress = function () {
        try {
          localStorage.removeItem(COMPLETED_KEY);
          localStorage.removeItem(CURRENT_KEY);
          localStorage.removeItem('completedChapters');
          localStorage.removeItem('scholarsCompassCompletedChapters');
        } catch (error) {}
        renderIndexProgress();
      };

      reset.addEventListener('click', clearProgress);
      reset.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          clearProgress();
        }
      });
    }

    window.addEventListener('pageshow', renderIndexProgress);
    window.addEventListener('storage', renderIndexProgress);
  }

  function initChapter() {
    var number = chapterNumberFromPage();
    if (!number) return;
    writeCurrent(number);

    var recorded = readCompleted().indexOf(number) !== -1;
    var complete = function () {
      if (recorded) return;
      recorded = true;
      markComplete(number);
    };

    var closingNavigation = document.querySelector('.chapter-sequence-nav');
    if (closingNavigation && 'IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
            complete();
            observer.disconnect();
          }
        });
      }, { threshold: [0.2, 0.5] });
      observer.observe(closingNavigation);
    }

    var nearBottom = function () {
      var root = document.scrollingElement || document.documentElement;
      var top = root.scrollTop || window.pageYOffset || 0;
      if (top + window.innerHeight >= root.scrollHeight - 140) complete();
    };

    window.addEventListener('scroll', nearBottom, { passive: true });
    window.addEventListener('pageshow', nearBottom);
    setTimeout(nearBottom, 120);

    var next = document.querySelector('.chapter-sequence-next');
    if (next) next.addEventListener('click', complete);
  }

  function init() {
    if (!is1010()) return;
    initIndex();
    initChapter();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
'''


def update_page(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    text = re.sub(r'<script[^>]*data-sc-progress="1"[^>]*></script>', '', text)
    if '</body>' not in text:
        raise RuntimeError(f"Missing body close in {path}")
    text = text.replace('</body>', SCRIPT_TAG + '</body>')
    path.write_text(text, encoding="utf-8")


def main() -> None:
    MODULE.write_text(JAVASCRIPT, encoding="utf-8")
    pages = sorted((ROOT / "1010").glob("*.html"))
    if len(pages) != 16:
        raise RuntimeError(f"Expected 16 ENG 1010 HTML files, found {len(pages)}")
    for page in pages:
        update_page(page)
    print(f"Built progress module and updated {len(pages)} ENG 1010 pages")


if __name__ == "__main__":
    main()
