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

function loadPageScript() {
    var body = document.body;
    if (!body) return;
    var page = body.getAttribute('data-page') || '';
    // Fall back to filename if data-page is missing
    if (!page) {
      var path = (window.location.pathname || '').split('/').pop() || 'index.html';
      page = path.replace(/\.html$/i, '');
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { buildChaptersNav(); loadPageScript(); });
  } else {
    buildChaptersNav();
    loadPageScript();
  }
})();
