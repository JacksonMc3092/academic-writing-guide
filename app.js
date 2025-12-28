// Shared dispatcher for Scholar's Compass
// Loads the page-specific script based on <body data-page="...">.
// This preserves the existing behavior (hamburger, theme toggle, icons, etc.)
// while letting chapters reference a single app.js.
(function () {
  
  // Single source of truth for chapter order + labels (edit here to reorder/add chapters)
  var SCHOLARS_COMPASS_CHAPTERS = [
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

  function buildChaptersNav() {
    var container = document.getElementById('chaptersList');
    if (!container) return;

    // Clear anything that might already be there
    container.innerHTML = '';

    var currentFile = ((window.location.pathname || '').split('/').pop()) || 'index.html';

    SCHOLARS_COMPASS_CHAPTERS.forEach(function (ch) {
      var a = document.createElement('a');
      a.href = ch.href;
      a.className = 'sidebar-link';

      if (currentFile.toLowerCase() === String(ch.href).toLowerCase()) {
        a.className += ' current';
        a.setAttribute('aria-current', 'page');
      }

      var icon = document.createElement('i');
      icon.className = ch.icon || 'fas fa-book';
      a.appendChild(icon);

      // Add a small space between icon and text to mimic existing HTML
      a.appendChild(document.createTextNode('' + ch.title));

      var rt = document.createElement('span');
      rt.className = 'reading-time';
      rt.textContent = ch.readingTime || '';
      a.appendChild(rt);

      container.appendChild(a);
    });
  }
    var src = page + '.js';
    // Avoid double-loading if the page already includes its own script.
    var existing = document.querySelector('script[src="' + src + '"]');
    if (existing) return;

    var s = document.createElement('script');
    s.src = src;
    s.defer = true;
    document.head.appendChild(s);
  }

  function initCommon() {
    // Sidebar / hamburger
    var hamburger = document.getElementById('hamburgerMenu');
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');
    var closeBtn = document.getElementById('sidebarClose');

    function openSidebar() {
      if (sidebar) sidebar.classList.add('active');
      if (overlay) overlay.classList.add('active');
      document.body.classList.add('sidebar-open');
    }
    function closeSidebar() {
      if (sidebar) sidebar.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      document.body.classList.remove('sidebar-open');
    }

    if (hamburger) hamburger.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Dark mode toggle
    var toggleBtn = document.getElementById('darkModeToggle');
    function applyDarkMode(isDark) {
      if (isDark) document.body.classList.add('dark-mode');
      else document.body.classList.remove('dark-mode');

      // Swap icon if present
      if (toggleBtn) {
        var icon = toggleBtn.querySelector('i');
        if (icon) {
          icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
      }
    }
    var saved = null;
    try { saved = localStorage.getItem('scholarsCompassDarkMode'); } catch(e) {}
    var isDark = saved === 'true';
    applyDarkMode(isDark);

    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        isDark = !document.body.classList.contains('dark-mode');
        applyDarkMode(isDark);
        try { localStorage.setItem('scholarsCompassDarkMode', String(isDark)); } catch(e) {}
      });
    }

    // Back to top button
    var backToTop = document.getElementById('backToTop');
    function updateBackToTop() {
      if (!backToTop) return;
      if (window.scrollY > 300) backToTop.classList.add('visible');
      else backToTop.classList.remove('visible');
    }
    if (backToTop) {
      backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      window.addEventListener('scroll', updateBackToTop, { passive: true });
      updateBackToTop();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { buildChaptersNav(); initCommon(); });
  } else {
    buildChaptersNav();
    initCommon();
  }
})();
