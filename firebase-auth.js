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
    var config = window.__FIREBASE_CONFIG__ || fallbackConfig;

    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }

    window.firebaseAuth = firebase.auth();
    window.firebaseDb = firebase.database();

    firebaseAuth.onAuthStateChanged(function (user) {
      if (!user) {
        clearLocalSession();
        return;
      }

      firebaseDb.ref('users/' + user.uid).once('value').then(function (snap) {
        var profile = snap.val() || {};
        var username = profile.username || (user.email ? user.email.split('@')[0] : 'User');

        setLocalSession(user, username);

        user.getIdTokenResult(true).then(function (result) {
          localStorage.setItem('isAdmin', result && result.claims && result.claims.admin === true ? 'true' : 'false');
        }).catch(function () {
          localStorage.setItem('isAdmin', 'false');
        });
      }).catch(function () {
        setLocalSession(user, user.email ? user.email.split('@')[0] : 'User');
        localStorage.setItem('isAdmin', 'false');
      });
    });

    window.logoutCurrentUser = function () {
      clearLocalSession();
      return firebaseAuth.signOut();
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
