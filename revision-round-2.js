(function () {
  'use strict';
  function qs(selector) { return document.querySelector(selector); }
  function value(id) { var node = qs('#' + id); return node ? node.value.trim() : ''; }
  function setValue(id, text) { var node = qs('#' + id); if (node) node.value = text || ''; }
  function status(id, text) { var node = qs('#' + id); if (node) node.textContent = text; }
  function save(key, object) { try { localStorage.setItem(key, JSON.stringify(object)); return true; } catch (err) { return false; } }
  function load(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (err) { return null; } }
  function remove(key) { try { localStorage.removeItem(key); } catch (err) {} }

  function updateReadingUI() {
    var scrollRoot = document.scrollingElement || document.documentElement;
    var top = scrollRoot.scrollTop || window.pageYOffset || 0;
    var height = Math.max(1, scrollRoot.scrollHeight - scrollRoot.clientHeight);
    var percent = Math.max(0, Math.min(100, top / height * 100));
    var progress = qs('.sc-reading-progress');
    var bar = qs('.sc-reading-progress-bar');
    if (bar) {
      bar.style.width = '100%';
      bar.style.transform = 'scaleX(' + (percent / 100) + ')';
    }
    if (progress) progress.setAttribute('aria-valuenow', String(Math.round(percent)));
    document.documentElement.style.setProperty('--sc-progress-hue', String(Math.round(210 - percent * .9)));
    var header = qs('.header');
    var sticky = qs('.sc-sticky-chapter');
    if (header && sticky) {
      sticky.classList.toggle('is-visible', header.getBoundingClientRect().bottom < 58 && top < height - 40);
    }
  }

  function initQuoteTool() {
    var button = qs('#scBuildQuote');
    if (!button) return;
    var key = 'scholarsCompass:chapter-4:prepare-present-explain';
    function data() { return { point:value('scQuotePoint'), context:value('scQuoteContext'), evidence:value('scQuoteEvidence'), explanation:value('scQuoteExplanation') }; }
    function render() { var d=data(); status('scQuoteOutput', [d.point,d.context,d.evidence,d.explanation].filter(Boolean).join(' ')); }
    button.addEventListener('click', render);
    qs('#scSaveQuote').addEventListener('click', function(){ save(key,data()); status('scQuoteOutput','Saved in this browser.'); });
    qs('#scClearQuote').addEventListener('click', function(){ ['scQuotePoint','scQuoteContext','scQuoteEvidence','scQuoteExplanation'].forEach(function(id){setValue(id,'');}); remove(key); status('scQuoteOutput','Cleared.'); });
    var stored=load(key); if(stored){ Object.keys(stored).forEach(function(name){ var ids={point:'scQuotePoint',context:'scQuoteContext',evidence:'scQuoteEvidence',explanation:'scQuoteExplanation'}; setValue(ids[name],stored[name]); }); }
  }

  function initRhetoricTool() {
    var button=qs('#scBuildRhetoric'); if(!button) return;
    button.addEventListener('click', function(){
      var parts=[['Choice',value('scRhetChoice')],['Effect',value('scRhetEffect')],['Audience',value('scRhetAudience')],['Purpose',value('scRhetPurpose')]];
      status('scRhetoricOutput',parts.filter(function(p){return p[1];}).map(function(p){return p[0]+': '+p[1];}).join('\n'));
    });
    qs('#scClearRhetoric').addEventListener('click',function(){['scRhetChoice','scRhetEffect','scRhetAudience','scRhetPurpose'].forEach(function(id){setValue(id,'');}); status('scRhetoricOutput','Cleared.');});
  }

  function initAnalysisTool() {
    var button=qs('#scBuildAnalysis'); if(!button) return;
    var key='scholarsCompass:chapter-10:observation-interpretation-significance';
    function data(){return {observation:value('scAnalysisObservation'),interpretation:value('scAnalysisInterpretation'),significance:value('scAnalysisSignificance')};}
    function render(){var d=data();status('scAnalysisOutput',['Observation: '+d.observation,'Interpretation: '+d.interpretation,'Significance: '+d.significance].join('\n'));}
    button.addEventListener('click',render);
    qs('#scSaveAnalysis').addEventListener('click',function(){save(key,data());status('scAnalysisOutput','Saved in this browser.');});
    qs('#scClearAnalysis').addEventListener('click',function(){['scAnalysisObservation','scAnalysisInterpretation','scAnalysisSignificance'].forEach(function(id){setValue(id,'');});remove(key);status('scAnalysisOutput','Cleared.');});
    var d=load(key); if(d){setValue('scAnalysisObservation',d.observation);setValue('scAnalysisInterpretation',d.interpretation);setValue('scAnalysisSignificance',d.significance);}
  }

  function initSynthesisTool() {
    var saveButton=qs('#scSaveSynthesis'); if(!saveButton) return;
    var key='scholarsCompass:chapter-13:synthesis-planner';
    var fields=['scSynthClaim','scSynthA','scSynthB','scSynthRelationship','scSynthConclusion','scSynthMissing'];
    function data(){var d={};fields.forEach(function(id){d[id]=value(id);});return d;}
    function restore(d){if(!d)return;fields.forEach(function(id){setValue(id,d[id]);});}
    saveButton.addEventListener('click',function(){status('scSynthesisStatus',save(key,data())?'Synthesis notes saved in this browser.':'The notes could not be saved in this browser.');});
    qs('#scLoadSynthesis').addEventListener('click',function(){var d=load(key);restore(d);status('scSynthesisStatus',d?'Saved notes loaded.':'No saved synthesis notes were found.');});
    qs('#scClearSynthesis').addEventListener('click',function(){fields.forEach(function(id){setValue(id,'');});remove(key);status('scSynthesisStatus','Synthesis notes cleared.');});
    restore(load(key));
  }

  function ready() {
    updateReadingUI();
    var ticking=false;
    window.addEventListener('scroll',function(){if(ticking)return;ticking=true;requestAnimationFrame(function(){updateReadingUI();ticking=false;});},{passive:true});
    window.addEventListener('resize',updateReadingUI,{passive:true});
    window.addEventListener('load',updateReadingUI,{once:true});
    window.addEventListener('pageshow',updateReadingUI);
    setTimeout(updateReadingUI, 100);
    initQuoteTool(); initRhetoricTool(); initAnalysisTool(); initSynthesisTool();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();

/* Scholar's Compass ENG 1010 chapter completion progress */
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
