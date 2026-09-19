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
    if (document.querySelector('.center-section') && !document.getElementById('catalogFixScript')) {
      var fix = document.createElement('script');
      fix.id = 'catalogFixScript';
      fix.src = 'catalog-fix.js?v=6';
      document.body.appendChild(fix);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSearch);
  else initSearch();
}());
