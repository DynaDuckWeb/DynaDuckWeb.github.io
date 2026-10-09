/**
 * Firebase Authentication Bridge
 * Uses server-injected config and session tokens for security
 * 
 * Firebase config MUST be injected by backend, not hardcoded
 */

(function () {
  'use strict';

  // Wait for server to inject Firebase config
  var maxWaitTime = 5000; // 5 seconds
  var waitInterval = 100;
  var elapsedTime = 0;

  function initializeAuth() {
    if (!window.__FIREBASE_CONFIG__) {
      elapsedTime += waitInterval;
      if (elapsedTime >= maxWaitTime) {
        console.error('FATAL: Firebase config not injected by backend after 5 seconds.');
        console.error('Ensure your backend service is injecting configuration at request time.');
        document.body.innerHTML = '<div style="padding:20px;background:#ffcccc;color:#cc0000;">Security Error: Server configuration failed. Please refresh the page.</div>';
        return;
      }
      setTimeout(initializeAuth, waitInterval);
      return;
    }

    try {
      var config = window.__FIREBASE_CONFIG__;
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }

      window.firebaseAuth = firebase.auth();
      window.firebaseDb = firebase.database();
      window.firebaseStorage = firebase.storage();

      // Sync auth state with secure session tokens
      firebaseAuth.onAuthStateChanged(function (user) {
        if (!user) {
          SecurityTokenHandler.clearSessionToken();
          return;
        }

        // User authenticated - create secure session token
        firebaseDb.ref('users/' + user.uid).once('value').then(function (snap) {
          var profile = snap.val() || {};
          var username = profile.username || user.email.split('@')[0];

          // Use session token instead of storing credentials
          SecurityTokenHandler.setSessionToken(user.uid, user.email, username);

          // Get admin status from token claims
          user.getIdTokenResult(true).then(function (result) {
            var isAdmin = result && result.claims && result.claims.admin === true;
            sessionStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
          }).catch(function () {
            sessionStorage.setItem('isAdmin', 'false');
          });
        });
      });

      // Setup auto-logout on inactivity
      if (SecurityTokenHandler.isSessionValid()) {
        SecurityTokenHandler.setupInactivityLogout(60 * 60 * 1000); // 1 hour
      }

      window.firebaseAuthReady = true;
    } catch (err) {
      console.error('Firebase initialization failed:', err);
      throw err;
    }
  }

  // Define logout function
  window.logoutCurrentUser = function () {
    SecurityTokenHandler.clearSessionToken();
    return firebaseAuth.signOut().catch(function (err) {
      console.error('Logout error:', err);
    });
  };

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
  } else {
    initializeAuth();
  }
})();
