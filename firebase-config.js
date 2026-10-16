// Shared Firebase config. Prefer firebase-auth.js (it guards double-init and wires Auth).
// This file is kept for pages that load it directly.
(function () {
  var firebaseConfig = {
    apiKey: "AIzaSyDtxYw55qR1wO3fw3EBivVhz4XI_H7GzvQ",
    authDomain: "dynaduck-19dbb.firebaseapp.com",
    databaseURL: "https://dynaduck-19dbb-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "dynaduck-19dbb",
    storageBucket: "dynaduck-19dbb.firebasestorage.app",
    messagingSenderId: "777148453502",
    appId: "1:777148453502:web:2f67ac439ec29dc4fc3e2f"
  };
  window.__FIREBASE_CONFIG__ = window.__FIREBASE_CONFIG__ || firebaseConfig;
  try {
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
      firebase.initializeApp(window.__FIREBASE_CONFIG__);
    }
    if (typeof firebase !== 'undefined' && !window.firebaseDb) {
      try { window.firebaseDb = firebase.database(); } catch (e) {}
    }
  } catch (e) { /* initialized elsewhere */ }
})();
