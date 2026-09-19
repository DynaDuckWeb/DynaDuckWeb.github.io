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
  var db = firebase.database();
  var username = localStorage.getItem('loggedInUser');
  var items = {};
  var filter = null;
  var defaults = {head:'#ffcd3a', torso:'#e3242b', 'l-arm':'#ffcd3a', 'r-arm':'#ffcd3a', 'l-leg':'#ffcd3a', 'r-leg':'#ffcd3a'};

  function esc(value) { var div = document.createElement('div'); div.textContent = String(value == null ? '' : value); return div.innerHTML; }
  function header() {
    var el = document.getElementById('authButtons');
    if (!el) return;
    if (!username) {
      el.innerHTML = '<a href="signup.html"><button class="header-btn">Sign Up</button></a><a href="login.html"><button class="header-btn">Log In</button></a>';
      return;
    }
    el.innerHTML = '<span style="color:white;font-weight:bold;">Welcome, ' + esc(username) + '!</span>' +
      '<a href="settings.html"><button class="header-btn">Settings</button></a>' +
      '<a href="ugc-create.html"><button class="header-btn">Create UGC</button></a>' +
      '<button class="header-btn" id="catalogLogout">Logout</button>';
    if (username === 'Admin') {
      addCategoryLink('adminReviewCategoryButton', 'admin-ugc.html', 'Review UGC');
    }
    document.getElementById('catalogLogout').onclick = function () {
      localStorage.removeItem('loggedInUser'); localStorage.removeItem('isAdmin'); location.href = 'login.html';
    };
  }
  function addCategoryLink(id, href, text) {
    var panel = document.querySelector('.right-section');
    if (!panel || document.getElementById(id)) return;
    var link = document.createElement('a'); link.id = id; link.href = href; link.className = 'green-btn';
    link.textContent = text; link.style.display = 'block'; link.style.marginTop = '10px'; panel.appendChild(link);
  }
  function render() {
    var grid = document.querySelector('.center-section'); if (!grid) return;
    grid.innerHTML = '';
    var entries = Object.entries(items).filter(function (entry) {
      var item = entry[1] || {}, slot = item.slot;
      return (!filter || (filter === 'legs' ? slot === 'l-leg' || slot === 'r-leg' : slot === filter)) && item.status !== 'rejected';
    });
    if (!entries.length) { var empty = document.createElement('div'); empty.className = 'empty-msg'; empty.textContent = filter ? 'No items in this category yet.' : 'The catalog is empty right now.'; grid.appendChild(empty); return; }
    entries.forEach(function (entry) {
      var id = entry[0], item = entry[1] || {}, card = document.createElement('div'); card.className = 'item-card';
      var visual = item.image ? '<img src="' + esc(item.image) + '" alt="' + esc(item.name || id) + '" style="width:100%;height:100%;object-fit:contain;">' : '<h4>' + esc(item.name || id).replace(/ /g, '<br>') + '</h4>';
      card.innerHTML = '<div class="item-box">' + visual + '</div><button class="item-btn"><span class="btn-text-buy">Buy</span><span class="btn-text-price">' + Number(item.price || 0).toLocaleString() + ' Dynamites</span></button>';
      card.querySelector('.item-btn').onclick = function () { buy(item); }; grid.appendChild(card);
    });
  }
  function loadProfile() {
    if (!username) return Promise.resolve({});
    return db.ref('users/' + username).once('value').then(function (snap) {
      var user = snap.val() || {}, updates = {};
      if (user.Dynamites === undefined) updates.Dynamites = 1000;
      if (!user.inventory) updates.inventory = {'Starter Pack': true};
      if (!user.colors) updates.colors = defaults;
      if (!user.equipped) updates.equipped = {};
      if (!Object.keys(updates).length) return user;
      return db.ref('users/' + username).update(updates).then(function () { return Object.assign({}, user, updates); });
    });
  }
  function loadColors(colors) { Object.keys(colors || {}).forEach(function (part) { var el = document.getElementById('part-' + part); if (el) el.style.backgroundColor = colors[part]; }); }
  function loadInventory(user) {
    var grid = document.querySelector('.inventory-grid'); if (!grid) return; grid.innerHTML = '';
    var inventory = user.inventory || {}, equipped = user.equipped || {}, names = Object.keys(inventory).filter(function (n) { return n !== 'Starter Pack'; });
    if (!names.length) { var empty = document.createElement('div'); empty.className = 'inventory-item'; empty.textContent = 'Empty'; grid.appendChild(empty); return; }
    names.forEach(function (name) { var data = inventory[name] || {}, div = document.createElement('div'); div.className = 'inventory-item'; div.textContent = name; if (data.slot && equipped[data.slot] === name) { div.style.background = '#d4f8d4'; div.style.borderColor = '#11AD36'; } div.onclick = function () { toggleEquip(name, data, equipped[data.slot] === name); }; grid.appendChild(div); });
  }
  function buy(item) {
    if (!username) { alert('Please log in first.'); return; }
    db.ref('users/' + username).once('value').then(function (snap) {
      var user = snap.val() || {}, balance = Number(user.Dynamites || 0), price = Math.max(0, Math.min(100, Number(item.price || 0)));
      if ((user.inventory || {})[item.name]) return alert('You already own this item.');
      if (balance < price) return alert('Not enough Dynamites!');
      var updates = {}; updates['users/' + username + '/Dynamites'] = balance - price; updates['users/' + username + '/inventory/' + item.name] = {slot:item.slot, color:item.color, image:item.image || ''};
      return db.ref().update(updates).then(function () { alert('Purchased ' + item.name + '!'); return loadProfile(); }).then(loadInventory);
    });
  }
  function toggleEquip(name, data, equipped) {
    if (!username || !data.slot) return;
    var updates = {}; updates['users/' + username + '/equipped/' + data.slot] = equipped ? null : name; updates['users/' + username + '/colors/' + data.slot] = equipped ? defaults[data.slot] : data.color;
    db.ref().update(updates).then(function () { return loadProfile(); }).then(function (user) { loadColors(user.colors || defaults); loadInventory(user); });
  }
  window.filterCategory = function (slot, button) { filter = filter === slot ? null : slot; document.querySelectorAll('.cat-button').forEach(function (e) { e.classList.remove('active'); }); if (filter && button) button.classList.add('active'); render(); };
  header();
  loadProfile().then(function (user) { loadColors(user.colors || defaults); loadInventory(user); return db.ref('catalog').once('value'); }).then(function (snap) { items = snap.val() || {}; render(); }).catch(function (e) { console.error('Catalog initialization failed:', e); });
}());
