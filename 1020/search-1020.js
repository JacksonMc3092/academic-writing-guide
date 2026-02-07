(function(){
  'use strict';
  if (!document.body || document.body.getAttribute('data-course') !== '1020') return;
  var INDEX_URL = 'search-index-1020.json';
  var MAX_RESULTS = 12;
  function normalize(s){ return (s||'').toLowerCase().trim(); }
  function buildUI(){
    var overlay = document.createElement('div');
    overlay.className = 'sc-search-overlay';
    overlay.setAttribute('aria-hidden','true');
    var modal = document.createElement('div');
    modal.className = 'sc-search-modal';
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.setAttribute('aria-label','Search ENG 1020');
    modal.innerHTML =
      '<div class="sc-search-header">' +
        '<input class="sc-search-input" type="search" placeholder="Search: plot, theme, symbolism, thesis…" aria-label="Search query" />' +
        '<button class="sc-search-close" type="button" aria-label="Close search"><i class="fas fa-times"></i></button>' +
      '</div>' +
      '<div class="sc-search-results" role="list"></div>' +
      '<div class="sc-search-muted" style="margin-top:10px;">Tip: press <kbd>/</kbd> to search, <kbd>Esc</kbd> to close.</div>';
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
    return { overlay: overlay, modal: modal, input: modal.querySelector('.sc-search-input'), closeBtn: modal.querySelector('.sc-search-close'), results: modal.querySelector('.sc-search-results') };
  }
  function scoreEntry(q, entry){
    var hay = normalize(entry.title + ' ' + (entry.keywords || []).join(' '));
    if (!hay) return 0;
    if (hay === q) return 1000;
    if (hay.indexOf(q) === 0) return 900;
    if (hay.indexOf(q) >= 0) return 600;
    var toks = q.split(/\s+/).filter(Boolean);
    var score = 0;
    for (var i=0;i<toks.length;i++){
      var t = toks[i];
      if (t.length < 2) continue;
      if (hay.indexOf(t) >= 0) score += 150;
    }
    return score;
  }
  function render(resultsEl, q, list){
    resultsEl.innerHTML = '';
    if (!q){
      var d = document.createElement('div');
      d.className = 'sc-search-muted';
      d.textContent = 'Start typing to search ENG 1020.';
      resultsEl.appendChild(d);
      return;
    }
    if (!list.length){
      var d2 = document.createElement('div');
      d2.className = 'sc-search-muted';
      d2.textContent = 'No matches. Try a broader term (e.g., “plot”, “theme”, “symbolism”).';
      resultsEl.appendChild(d2);
      return;
    }
    for (var j=0;j<Math.min(MAX_RESULTS, list.length);j++){
      var e = list[j];
      var a = document.createElement('a');
      a.className = 'sc-search-item';
      a.href = e.url;
      a.setAttribute('role','listitem');
      a.innerHTML = '<strong>' + e.title + '</strong>' + '<div class="sc-search-muted">' + e.url.replace('/1020/','') + '</div>';
      resultsEl.appendChild(a);
    }
  }
  function trapFocus(modal, onClose){
    function focusables(){ return modal.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])'); }
    function handler(e){
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab') return;
      var els = Array.prototype.slice.call(focusables()).filter(function(el){ return !el.disabled; });
      if (!els.length) return;
      var first = els[0], last = els[els.length-1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
    modal.addEventListener('keydown', handler);
    return function(){ modal.removeEventListener('keydown', handler); };
  }
  function fetchIndex(cb){
    fetch(INDEX_URL, { cache: 'force-cache' })
      .then(function(r){ return r.ok ? r.json() : []; })
      .then(function(data){ cb(data || []); })
      .catch(function(){ cb([]); });
  }
  var btn = document.getElementById('searchMenu');
  if (!btn) return;
  var ui = buildUI();
  var index = [];
  var lastFocus = null;
  var untrap = null;
  function open(){
    lastFocus = document.activeElement;
    ui.overlay.style.display = 'block';
    ui.modal.style.display = 'block';
    ui.overlay.setAttribute('aria-hidden','false');
    ui.input.value = '';
    render(ui.results, '', []);
    ui.input.focus();
    if (untrap) untrap();
    untrap = trapFocus(ui.modal, close);
  }
  function close(){
    ui.overlay.style.display = 'none';
    ui.modal.style.display = 'none';
    ui.overlay.setAttribute('aria-hidden','true');
    if (untrap) untrap();
    untrap = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  btn.addEventListener('click', open);
  ui.closeBtn.addEventListener('click', close);
  ui.overlay.addEventListener('click', close);
  ui.input.addEventListener('input', function(){
    var q = normalize(ui.input.value);
    var ranked = index.map(function(e){ return { e:e, s: scoreEntry(q, e) }; })
      .filter(function(x){ return x.s > 0; })
      .sort(function(a,b){ return b.s - a.s; })
      .map(function(x){ return x.e; });
    render(ui.results, q, ranked);
  });
  document.addEventListener('keydown', function(e){
    if (e.key !== '/') return;
    var tag = document.activeElement && document.activeElement.tagName ? document.activeElement.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea') return;
    e.preventDefault();
    open();
  });
  fetchIndex(function(data){ index = data; });
})();