// Publish ideas directly to Firebase RTDB (static hosting has no /api/ideas backend).
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
  function esc(s) { var d = document.createElement('div'); d.textContent = String(s == null ? '' : s); return d.innerHTML; }

  var ideaForm = document.getElementById('idea-form');
  if (!ideaForm) return;
  ideaForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    var title = String((ideaForm.elements['title'] || {}).value || '').trim().slice(0, 80);
    var body = String((ideaForm.elements['body'] || {}).value || '').trim().slice(0, 1000);
    if (!title || !body) { alert('Fill in title and body.'); return; }
    var uid = curUid();
    var uname = localStorage.getItem('loggedInUser') || 'Anonymous';
    if (!uid) { alert('Please log in first.'); return; }
    var db = getDb();
    if (!db) { alert('Database not ready.'); return; }
    try {
      var ref = db.ref('posts').push();
      await ref.set({ title: title, text: body, user: uname, creator: uname, creatorUid: uid, timestamp: Date.now() });
      var feed = document.getElementById('ideas-feed');
      if (feed) {
        var el = document.createElement('article');
        var h = document.createElement('h3'); h.textContent = title;
        var p = document.createElement('p'); p.textContent = body;
        el.appendChild(h); el.appendChild(p);
        feed.prepend(el);
      }
      ideaForm.reset();
    } catch (err) {
      console.error('Publish idea failed', err);
      alert('Publish failed: ' + (err.message || err));
    }
  });
})();
