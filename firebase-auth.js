(function () {
  'use strict';

  function boot() {
    if (!window.__FIREBASE_CONFIG__) {
      document.body.innerHTML = '<div style="padding:20px;background:#ffcccc;color:#a00;">Security Error: configuration missing.</div>';
      return;
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(window.__FIREBASE_CONFIG__);
    }

    window.firebaseAuth = firebase.auth();
    window.firebaseDb = firebase.database();
    window.firebaseStorage = firebase.storage();

    firebaseAuth.onAuthStateChanged(function (user) {
      if (!user) {
        if (window.SecurityTokenHandler) {
          window.SecurityTokenHandler.clearSessionToken();
        }
        return;
      }

      firebaseDb.ref('users/' + user.uid).once('value').then(function (snap) {
        var profile = snap.val() || {};
        var username = profile.username || (user.email ? user.email.split('@')[0] : 'User');

        if (window.SecurityTokenHandler) {
          window.SecurityTokenHandler.setSessionToken(user.uid, user.email, username);
        }

        user.getIdTokenResult(true).then(function (result) {
          sessionStorage.setItem('isAdmin', result && result.claims && result.claims.admin === true ? 'true' : 'false');
        }).catch(function () {
          sessionStorage.setItem('isAdmin', 'false');
        });
      });
    });

    window.logoutCurrentUser = function () {
      if (window.SecurityTokenHandler) {
        window.SecurityTokenHandler.clearSessionToken();
      }
      return firebaseAuth.signOut();
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
