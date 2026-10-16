// Friend requests via Firebase Realtime Database (no custom /api backend on static hosting).
// Expects firebase-auth.js (window.firebaseAuth / window.firebaseDb) or compat firebase global.
(function () {
  function getDb() {
    if (window.firebaseDb) return window.firebaseDb;
    if (typeof firebase !== 'undefined' && firebase.database) {
      try {
        if (!firebase.apps.length && window.__FIREBASE_CONFIG__) firebase.initializeApp(window.__FIREBASE_CONFIG__);
        return firebase.database();
      } catch (e) { return null; }
    }
    return null;
  }
  function curUid() {
    try { if (window.firebaseAuth && firebaseAuth.currentUser) return firebaseAuth.currentUser.uid; } catch (e) {}
    return localStorage.getItem('firebaseUid');
  }
  function curName() { return localStorage.getItem('loggedInUser') || ''; }

  document.querySelectorAll('.friend-form').forEach(function (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var input = form.elements['userId'] || form.elements['username'];
      var targetName = input ? String(input.value || '').trim() : '';
      if (!targetName) return;
      if (/[.#$[\]/]/.test(targetName)) { alert('That name contains invalid characters.'); return; }
      var uid = curUid(), uname = curName();
      if (!uid || !uname) { alert('Please log in first.'); return; }
      if (targetName === uname) { alert('You cannot add yourself.'); return; }
      var db = getDb();
      if (!db) { alert('Database not ready.'); return; }
      var btn = form.querySelector('button[type="submit"]');
      try {
        if (btn) btn.disabled = true;
        var targetUidSnap = await db.ref('usernames/' + targetName).once('value');
        if (!targetUidSnap.exists()) throw new Error('That user does not exist.');
        var targetUid = targetUidSnap.val();
        var existing = await db.ref('users/' + uid + '/friends/' + targetName).once('value');
        if (existing.val()) { if (btn) btn.textContent = 'Friends'; return; }
        var ts = Date.now();
        await db.ref('users/' + uid + '/outgoingRequests/' + targetName).set(ts);
        try {
          await db.ref('users/' + targetUid + '/friendRequests/' + uname).set(ts);
        } catch (innerErr) {
          await db.ref('users/' + uid + '/outgoingRequests/' + targetName).remove();
          throw innerErr;
        }
        if (btn) btn.textContent = 'Requested';
      } catch (err) {
        console.error('Friend request failed', err);
        alert('Friend request failed: ' + (err.message || err));
        if (btn) btn.disabled = false;
      }
    });
  });
})();
