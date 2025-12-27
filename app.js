// Shared dispatcher for Scholar's Compass
// Loads the page-specific script based on <body data-page="...">.
// This preserves the existing behavior (hamburger, theme toggle, icons, etc.)
// while letting chapters reference a single app.js.
(function () {
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
    document.addEventListener('DOMContentLoaded', loadPageScript);
  } else {
    loadPageScript();
  }
})();
