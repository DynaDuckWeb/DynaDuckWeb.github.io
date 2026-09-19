(function () {
  function goToSearch(input) {
    var query = (input.value || '').trim();
    if (query) window.location.href = 'search.html?q=' + encodeURIComponent(query);
  }

  function addUgcButton() {
    var category = document.querySelector('.right-section');
    if (!category || document.getElementById('createUgcButton')) return;
    var button = document.createElement('a');
    button.id = 'createUgcButton';
    button.className = 'green-btn';
    button.href = 'ugc-create.html';
    button.textContent = 'Create UGC';
    button.style.display = 'block';
    button.style.marginTop = '18px';
    category.appendChild(button);
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
    addUgcButton();
    setTimeout(addUgcButton, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSearch);
  else initSearch();
}());
