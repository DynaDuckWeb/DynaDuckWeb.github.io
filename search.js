/* Shared search behavior for every page. Results are rendered by search.html. */
(function () {
  function goToSearch(input) {
    var query = (input.value || '').trim();
    if (query) window.location.href = 'search.html?q=' + encodeURIComponent(query);
  }

  function initSearch() {
    document.querySelectorAll('.search-bar').forEach(function (input) {
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          goToSearch(input);
        }
      });
      input.setAttribute('aria-label', 'Search games and people');
    });

    if (location.pathname.endsWith('/catalog.html') || location.pathname === 'catalog.html') {
      var fix = document.createElement('script');
      fix.src = 'catalog-fix.js';
      document.body.appendChild(fix);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSearch);
  else initSearch();
}());
