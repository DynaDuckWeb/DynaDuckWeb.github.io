(function () {
  var firebaseConfig = {
    apiKey: 'AIzaSyDtxYw55qR1wO3fw3EBivVhz4XI_H7GzvQ',
    authDomain: 'dynaduck-19dbb.firebaseapp.com',
    databaseURL: 'https://dynaduck-19dbb-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'dynaduck-19dbb',
    storageBucket: 'dynaduck-19dbb.firebasestorage.app',
    messagingSenderId: '777148453502',
    appId: '1:777148453502:web:2f67ac439ec29dc4fc3e2f'
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  window.firebaseAuth = firebase.auth();
  window.firebaseDb = firebase.database();

  function syncLocalAuthState(user) {
    if (!user) {
      localStorage.removeItem('firebaseUid');
      localStorage.removeItem('firebaseEmail');
      localStorage.removeItem('isAdmin');
      return;
    }

    localStorage.setItem('firebaseUid', user.uid);
    localStorage.setItem('firebaseEmail', user.email || '');

    user.getIdTokenResult(true).then(function (result) {
      var isAdmin = result && result.claims && result.claims.admin === true;
      localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
    }).catch(function () {
      localStorage.setItem('isAdmin', 'false');
    });
  }

  firebaseAuth.onAuthStateChanged(syncLocalAuthState);

  window.logoutCurrentUser = function () {
    return firebaseAuth.signOut().then(function () {
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem('firebaseUid');
      localStorage.removeItem('firebaseEmail');
      localStorage.removeItem('isAdmin');
    });
  };
}());
