(function () {
  function goToSearch(input) {
    var query = (input.value || '').trim();
    if (query) window.location.href = 'search.html?q=' + encodeURIComponent(query);
  }

  function escapeHtml(value) {
    var div = document.createElement('div');
    div.textContent = String(value == null ? '' : value);
    return div.innerHTML;
  }

  function updateCatalogAuth() {
    var auth = document.getElementById('authButtons');
    if (!auth || !document.querySelector('.center-section')) return;
    var username = localStorage.getItem('loggedInUser');
    if (username) {
      auth.innerHTML = '<span style="color:white;font-weight:bold;">Welcome, ' + escapeHtml(username) + '!</span>' +
        '<a href="settings.html"><button class="header-btn">Settings</button></a>' +
        '<button class="header-btn" id="searchCatalogLogout">Logout</button>';
      var logout = document.getElementById('searchCatalogLogout');
      if (logout) logout.onclick = function () {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('isAdmin');
        window.location.href = 'login.html';
      };
    } else {
      auth.innerHTML = '<a href="signup.html"><button class="header-btn">Sign Up</button></a>' +
        '<a href="login.html"><button class="header-btn">Log In</button></a>';
    }
  }

  function loadCatalogFix() {
    if (!document.querySelector('.center-section') || document.getElementById('catalogFixScript')) return;
    updateCatalogAuth();
    var fix = document.createElement('script');
    fix.id = 'catalogFixScript';
    fix.src = 'catalog-fix.js?v=3';
    document.body.appendChild(fix);
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
    loadCatalogFix();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSearch);
  else initSearch();
}());
