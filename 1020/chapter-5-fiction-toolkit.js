/* Chapter 5 Fiction Toolkit: Hybrid "mini-page" focus mode.
   - Clicking a card jumps to #section and hides all other sections.
   - Back to cards: #toolkit-cards shows the card dashboard.
   - Show all sections: disables focus mode but keeps your position.
*/
(() => {
  const body = document.body;
  const cardsAnchorId = "toolkit-cards";
  const sections = [...document.querySelectorAll(".tk-section")];

  function clearFocus() {
    body.classList.remove("tk-focus");
    sections.forEach(s => s.classList.remove("tk-active"));
  }

  function focusSection(id) {
    const target = document.getElementById(id);
    if (!target || !target.classList.contains("tk-section")) return false;
    body.classList.add("tk-focus");
    sections.forEach(s => s.classList.toggle("tk-active", s.id === id));
    return true;
  }

  function applyFromHash() {
    const raw = (location.hash || "").replace("#", "");
    if (!raw || raw === cardsAnchorId) {
      clearFocus();
      return;
    }
    const ok = focusSection(raw);
    if (!ok) clearFocus();
  }

  // Back to cards links: set hash to toolkit-cards for clarity.
  document.addEventListener("click", (e) => {
    const back = e.target.closest("[data-back-to-cards]");
    if (!back) return;
    // Allow default anchor behavior, but ensure focus clears.
    // Clearing happens on hashchange.
  });

  // Show all sections buttons
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-show-all]");
    if (!btn) return;
    e.preventDefault();
    clearFocus();
  });

  window.addEventListener("hashchange", applyFromHash);
  window.addEventListener("load", applyFromHash);
})();