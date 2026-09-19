(function () {
  function goToSearch(input) {
    var query = (input.value || '').trim();
    if (query) window.location.href = 'search.html?q=' + encodeURIComponent(query);
  }

  function addLink(id, href, text, className) {
    if (document.getElementById(id)) return;
    var auth = document.getElementById('authButtons');
    if (!auth) return;
    var link = document.createElement('a');
    link.id = id;
    link.href = href;
    link.className = className || 'header-btn';
    link.textContent = text;
    auth.appendChild(link);
  }

  function initPage() {
    document.querySelectorAll('.search-bar').forEach(function (input) {
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          goToSearch(input);
        }
      });
      input.setAttribute('aria-label', 'Search games and people');
    });

    if (document.querySelector('.center-section')) {
      addLink('createUgcHeaderButton', 'ugc-create.html', 'Create UGC', 'header-btn');
      var fix = document.createElement('script');
      fix.src = 'catalog-fix.js?v=5';
      document.body.appendChild(fix);
    }

    if (localStorage.getItem('loggedInUser') === 'Admin') {
      addLink('adminReviewButton', 'admin-ugc.html', 'Review UGC', 'header-btn');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPage);
  else initPage();
}());
