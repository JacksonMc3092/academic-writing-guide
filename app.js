/* Scholar's Compass — global behavior (GitHub Pages static site)
   Phase A stabilization:
   - Theme toggle (persistent)
   - Back-to-top
   - Sidebar / hamburger
   - Scroll progress
   - Chapters list (single array)
   - Quick-nav active highlight
*/

(function () {
  'use strict';

  var CHAPTERS = [
  {
    "href": "chapter-1.html",
    "icon": "fas fa-highlighter",
    "title": "1. Annotating Your Way to Greatness",
    "readingTime": "15 min"
  },
  {
    "href": "chapter-2.html",
    "icon": "fas fa-book-reader",
    "title": "2. Active Reading Strategies",
    "readingTime": "12 min"
  },
  {
    "href": "chapter-3.html",
    "icon": "fas fa-clipboard-list",
    "title": "3. Summarizing Your Way to Synthesis",
    "readingTime": "10 min"
  },
  {
    "href": "chapter-4.html",
    "icon": "fas fa-comments",
    "title": "4. Argumentation: Joining the Academic Conversation",
    "readingTime": "18 min"
  },
  {
    "href": "chapter-5.html",
    "icon": "fas fa-link",
    "title": "5. Source Integration for Success!",
    "readingTime": "14 min"
  },
  {
    "href": "chapter-6.html",
    "icon": "fas fa-project-diagram",
    "title": "6. Analysis and Synthesis",
    "readingTime": "16 min"
  },
  {
    "href": "chapter-7.html",
    "icon": "fas fa-bullseye",
    "title": "7. Crafting Powerful Thesis Statements",
    "readingTime": "11 min"
  },
  {
    "href": "chapter-8.html",
    "icon": "fas fa-align-left",
    "title": "8. Designing Effective Paragraphs",
    "readingTime": "13 min"
  },
  {
    "href": "chapter-9.html",
    "icon": "fas fa-pen-fancy",
    "title": "9. Strategies for Getting Started",
    "readingTime": "9 min"
  }
];

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function currentFile() {
    var f = (window.location.pathname || '').split('/').pop();
    return (f && f.trim()) ? f : 'index.html';
  }

  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  // ---- Theme
  function isDarkPreferred() {
    var v = localStorage.getItem('darkMode');
    if (v === 'true') return true;
    if (v === 'false') return false;
    var theme = localStorage.getItem('theme');
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return false;
  }

  function setTheme(isDark) {
    if (isDark) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');

    // Persist in both keys to stay compatible with earlier versions
    localStorage.setItem('darkMode', isDark ? 'true' : 'false');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    var toggle = qs('#darkModeToggle');
    if (toggle) {
      var icon = toggle.querySelector('i');
      if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
      toggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    }
  }

  function initThemeToggle() {
    setTheme(isDarkPreferred());
    var toggle = qs('#darkModeToggle');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      setTheme(!document.body.classList.contains('dark-mode'));
    });
  }

  // ---- Back-to-top
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function initBackToTop() {
    var btn = qs('#backToTop');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      scrollToTop();
    });
  }

  // ---- Sidebar
  function initSidebar() {
    var hamburger = qs('#hamburgerMenu');
    var sidebar = qs('#sidebar');
    var overlay = qs('#sidebarOverlay');
    var closeBtn = qs('#sidebarClose');

    if (!hamburger || !sidebar || !overlay) return;

    function openSidebar() {
      sidebar.classList.add('active');
      overlay.classList.add('active');
      hamburger.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);

    // Auto-close on mobile when selecting a chapter
    qsa('.sidebar-link[href*="chapter"]').forEach(function (a) {
      a.addEventListener('click', function () {
        if (window.innerWidth <= 768) closeSidebar();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sidebar.classList.contains('active')) closeSidebar();
    });

    // Touch swipe (open from left edge; close when open)
    var touchStartX = 0;
    var touchEndX = 0;

    document.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var swipeThreshold = 100;
      var swipeDistance = touchEndX - touchStartX;
      if (Math.abs(swipeDistance) <= swipeThreshold) return;

      if (swipeDistance > 0 && touchStartX < 50) openSidebar();
      else if (swipeDistance < 0 && sidebar.classList.contains('active')) closeSidebar();
    }, { passive: true });
  }

  // ---- Chapters nav (single source of truth)
  function buildChaptersNav() {
    var container = qs('#chaptersList');
    if (!container) return;

    container.innerHTML = '';
    var here = currentFile().toLowerCase();

    CHAPTERS.forEach(function (ch) {
      var a = document.createElement('a');
      a.href = ch.href;
      a.className = 'sidebar-link';

      if (here === String(ch.href).toLowerCase()) {
        a.className += ' current';
        a.setAttribute('aria-current', 'page');
      }

      var icon = document.createElement('i');
      icon.className = ch.icon || 'fas fa-book';
      a.appendChild(icon);
      a.appendChild(document.createTextNode(ch.title));

      if (ch.readingTime) {
        var rt = document.createElement('span');
        rt.className = 'reading-time';
        rt.textContent = ch.readingTime;
        a.appendChild(rt);
      }

      container.appendChild(a);
    });
  }

  // ---- Scroll progress + quick nav
  function updateQuickNav() {
    var links = qsa('.quick-nav a[data-section]');
    if (!links.length) return;

    var markerY = 120;
    var activeId = null;

    qsa('.section[id]').forEach(function (sec) {
      var r = sec.getBoundingClientRect();
      if (r.top <= markerY && r.bottom >= markerY) activeId = sec.id;
    });

    if (!activeId) return;
    links.forEach(function (a) {
      if (a.getAttribute('data-section') === activeId) a.classList.add('active');
      else a.classList.remove('active');
    });
  }

  function updateScrollUI() {
    var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var scrolled = height > 0 ? (winScroll / height) * 100 : 0;

    var bar1 = qs('#progressBar');
    if (bar1) bar1.style.width = scrolled + '%';

    var bar2 = qs('#scrollProgress');
    if (bar2) bar2.style.width = scrolled + '%';

    var back = qs('#backToTop');
    if (back) {
      if (winScroll > 300) back.classList.add('visible');
      else back.classList.remove('visible');
    }

    updateQuickNav();
  }

  function initScrollHandlers() {
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        updateScrollUI();
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    updateScrollUI();
  }

  // ---- Smooth anchors (quick-nav, in-page links)
  function initSmoothAnchors() {
    qsa('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href');
        if (!href || href.length < 2) return;
        var target = qs(href);
        if (!target) return;

        e.preventDefault();
        var yOffset = -80;
        var y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
    });
  }

  // ---- Init
  ready(function () {
    buildChaptersNav();
    initSidebar();
    initThemeToggle();
    initBackToTop();
    initScrollHandlers();
    initSmoothAnchors();
  });

})();
