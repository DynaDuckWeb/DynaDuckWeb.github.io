/* Exposes the current Auth UID for catalog/profile reads (UID-keyed, per database rules). */
(function () {
  function publish(user) {
    window.catalogAuthUid = user ? user.uid : null;
    window.catalogAuthReady = true;
  }
  function init() {
    if (typeof firebase === 'undefined' || !firebase.auth) { window.catalogAuthReady = false; return; }
    try {
      var auth = window.firebaseAuth || firebase.auth();
      if (auth.currentUser) { publish(auth.currentUser); return; }
      auth.onAuthStateChanged(publish);
    } catch (e) { window.catalogAuthReady = false; }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
