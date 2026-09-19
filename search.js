(function () {
  function addAdminReviewButton() {
    if (localStorage.getItem('loggedInUser') !== 'Admin') return;
    var auth = document.getElementById('authButtons');
    if (!auth || document.getElementById('adminReviewButton')) return;
    var btn = document.createElement('a');
    btn.id = 'adminReviewButton';
    btn.href = 'admin-ugc.html';
    btn.className = 'header-btn';
    btn.textContent = 'Review UGC';
    auth.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addAdminReviewButton);
  } else {
    addAdminReviewButton();
  }
}());
