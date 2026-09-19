/* Forces the catalog to use Firebase Auth UID for private profile reads. */
(function () {
  if (typeof firebase === 'undefined' || !firebase.auth) return;
  var original = window.firebaseDb;
  var auth = firebase.auth();
  auth.onAuthStateChanged(function (user) {
    if (user) {
      window.catalogAuthUid = user.uid;
      window.catalogAuthReady = true;
    } else {
      window.catalogAuthUid = null;
      window.catalogAuthReady = true;
    }
  });
}());
