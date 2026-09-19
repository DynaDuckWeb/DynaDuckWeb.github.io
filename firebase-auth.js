/* Firebase Authentication bridge for the static site. */
(function () {
  var config = {
    apiKey: 'AIzaSyDtxYw55qR1wO3fw3EBivVhz4XI_H7GzvQ',
    authDomain: 'dynaduck-19dbb.firebaseapp.com',
    databaseURL: 'https://dynaduck-19dbb-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'dynaduck-19dbb',
    storageBucket: 'dynaduck-19dbb.firebasestorage.app',
    messagingSenderId: '777148453502',
    appId: '1:777148453502:web:2f67ac439ec29dc4fc3e2f'
  };
  if (!firebase.apps.length) firebase.initializeApp(config);
  window.firebaseAuth = firebase.auth();
  window.firebaseDb = firebase.database();
  window.firebaseAdmin = false;
  firebaseAuth.onAuthStateChanged(function (user) {
    if (!user) { window.firebaseAdmin = false; return; }
    user.getIdTokenResult(true).then(function (result) {
      window.firebaseAdmin = result.claims.admin === true;
      localStorage.setItem('firebaseUid', user.uid);
      localStorage.setItem('firebaseEmail', user.email || '');
      if (window.firebaseAdmin) localStorage.setItem('isAdmin', 'true');
      else localStorage.removeItem('isAdmin');
    });
  });
  window.firebaseLogout = function () {
    return firebaseAuth.signOut().then(function () {
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('firebaseUid');
      localStorage.removeItem('firebaseEmail');
    });
  };
}());
