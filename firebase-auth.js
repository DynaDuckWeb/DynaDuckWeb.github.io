(function () {
  'use strict';

  var fallbackConfig = {
    apiKey: 'AIzaSyDtxYw55qR1wO3fw3EBivVhz4XI_H7GzvQ',
    authDomain: 'dynaduck-19dbb.firebaseapp.com',
    databaseURL: 'https://dynaduck-19dbb-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'dynaduck-19dbb',
    storageBucket: 'dynaduck-19dbb.firebasestorage.app',
    messagingSenderId: '777148453502',
    appId: '1:777148453502:web:2f67ac439ec29dc4fc3e2f'
  };

  function setLocalSession(user, username) {
    localStorage.setItem('loggedInUser', username || 'User');
    localStorage.setItem('firebaseUid', user.uid);
    localStorage.setItem('firebaseEmail', user.email || '');
  }

  function clearLocalSession() {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('firebaseUid');
    localStorage.removeItem('firebaseEmail');
    localStorage.removeItem('isAdmin');
  }

  function init() {
    if (typeof firebase === 'undefined' || !firebase.auth) return;
    var config = window.__FIREBASE_CONFIG__ || fallbackConfig;

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }
    } catch (e) { /* already initialized with same/other config */ }

    window.firebaseAuth = firebase.auth();
    try { window.firebaseDb = firebase.database(); } catch (e) { return; }
    window.firebaseAuthReady = false;

    firebaseAuth.onAuthStateChanged(function (user) {
      window.firebaseAuthReady = true;
      if (!user) {
        clearLocalSession();
        return;
      }

      firebaseDb.ref('users/' + user.uid).once('value').then(function (snap) {
        var profile = (snap && snap.val()) || {};
        var username = profile.username || (user.email ? user.email.split('@')[0] : 'User');

        setLocalSession(user, username);

        user.getIdTokenResult(false).then(function (result) {
          try { localStorage.setItem('isAdmin', result && result.claims && result.claims.admin === true ? 'true' : 'false'); } catch (e) {}
        }).catch(function () {
          try { localStorage.setItem('isAdmin', 'false'); } catch (e) {}
        });
      }).catch(function () {
        setLocalSession(user, user.email ? user.email.split('@')[0] : 'User');
        try { localStorage.setItem('isAdmin', 'false'); } catch (e) {}
      });
    });

    window.logoutCurrentUser = function () {
      clearLocalSession();
      try { return firebaseAuth.signOut(); } catch (e) { return Promise.resolve(); }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
