(function () {
  var config = {apiKey:'AIzaSyDtxYw55qR1wO3fw3EBivVhz4XI_H7GzvQ',authDomain:'dynaduck-19dbb.firebaseapp.com',databaseURL:'https://dynaduck-19dbb-default-rtdb.europe-west1.firebasedatabase.app',projectId:'dynaduck-19dbb',storageBucket:'dynaduck-19dbb.firebasestorage.app',messagingSenderId:'777148453502',appId:'1:777148453502:web:2f67ac439ec29dc4fc3e2f'};
  if (!firebase.apps.length) firebase.initializeApp(config);
  var db=firebase.database(), username=localStorage.getItem('loggedInUser'), items={}, filter=null, currentUser={};
  var defaults={head:'#ffcd3a',torso:'#e3242b','l-arm':'#ffcd3a','r-arm':'#ffcd3a','l-leg':'#ffcd3a','r-leg':'#ffcd3a'};

  function esc(v){var d=document.createElement('div');d.textContent=String(v==null?'':v);return d.innerHTML;}

  function header(){
    var el=document.getElementById('authButtons');
    if(!el)return;
    if(!username){
      el.innerHTML='<a href="signup.html"><button class="header-btn">Sign Up</button></a><a href="login.html"><button class="header-btn">Log In</button></a>';
      return;
    }
    /* Create UGC and Review UGC are placed once below the category list. */
    el.innerHTML='<span style="color:white;font-weight:bold">Welcome, '+esc(username)+'!</span><a href="settings.html"><button class="header-btn">Settings</button></a><button class="header-btn" id="catalogLogout">Logout</button>';
    document.getElementById('catalogLogout').onclick=function(){
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem('isAdmin');
      location.href='login.html';
    };
  }

  function moveCategoryLinks(){
    var panel=document.querySelector('.right-section');
    if(!panel)return;
    var hats=panel.querySelector('[data-slot="head"]');
    if(!hats)return;
    var create=document.getElementById('categoryCreateUgc');
    if(!create){
      create=document.createElement('a');
      create.id='categoryCreateUgc';
      create.className='green-btn';
      create.href='ugc-create.html';
      create.textContent='Create UGC';
      create.style.display='block';
      create.style.marginTop='10px';
    }
    hats.insertAdjacentElement('afterend',create);
    var review=document.getElementById('categoryReviewUgc');
    if(username==='Admin'){
      if(!review){
        review=document.createElement('a');
        review.id='categoryReviewUgc';
        review.className='green-btn';
        review.href='admin-ugc.html';
        review.textContent='Review UGC';
        review.style.display='block';
        review.style.marginTop='10px';
      }
      create.insertAdjacentElement('afterend',review);
    }else if(review){
      review.remove();
    }
  }

  function shirtOverlay(){
    var torso=document.getElementById('part-torso');
    if(!torso)return null;
    var image=document.getElementById('equipped-shirt-image');
    if(!image){
      image=document.createElement('img');
      image.id='equipped-shirt-image';
      image.alt='Equipped T-shirt';
      image.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:fill;pointer-events:none;z-index:6;';
      torso.style.overflow='hidden';
      torso.appendChild(image);
    }
    return image;
  }

  function loadColors(colors){
    Object.keys(defaults).forEach(function(part){
      var el=document.getElementById('part-'+part);
      if(el)el.style.backgroundColor=(colors&&colors[part])||defaults[part];
    });
    var equipped=currentUser.equipped||{},inv=currentUser.inventory||{},shirt=inv[equipped.torso],image=shirtOverlay();
    if(image){image.src=shirt&&shirt.image||'';image.style.display=shirt&&shirt.image?'block':'none';}
  }

  function render(){
    var grid=document.querySelector('.center-section');
    if(!grid)return;
    grid.innerHTML='';
    var entries=Object.entries(items).filter(function(e){
      var item=e[1]||{},slot=item.slot;
      return(!filter||(filter==='legs'?(slot==='l-leg'||slot==='r-leg'):slot===filter))&&item.status!=='rejected';
    });
    if(!entries.length){
      var empty=document.createElement('div');
      empty.className='empty-msg';
      empty.textContent=filter?'No items in this category yet.':'The catalog is empty right now.';
      grid.appendChild(empty);
      return;
    }
    entries.forEach(function(e){
      var id=e[0],item=e[1]||{},card=document.createElement('div');
      card.className='item-card';
      var visual=item.image?'<img src="'+esc(item.image)+'" alt="'+esc(item.name||id)+'" style="width:100%;height:100%;object-fit:contain">':'<h4>'+esc(item.name||id).replace(/ /g,'<br>')+'</h4>';
      card.innerHTML='<div class="item-box">'+visual+'</div><div class="item-name">'+esc(item.name||id)+'</div><button class="item-btn"><span class="btn-text-buy">Buy</span><span class="btn-text-price">'+Math.max(0,Math.min(100,Number(item.price)||0)).toLocaleString()+' Dynamites</span></button>';
      card.querySelector('.item-btn').onclick=function(){buy(item);};
      grid.appendChild(card);
    });
  }

  function loadInventory(user){
    currentUser=user||{};
    var grid=document.querySelector('.inventory-grid');
    if(!grid)return;
    grid.innerHTML='';
    var inv=currentUser.inventory||{},eq=currentUser.equipped||{},names=Object.keys(inv).filter(function(n){return n!=='Starter Pack';});
    if(!names.length){var empty=document.createElement('div');empty.className='inventory-item';empty.textContent='Empty';grid.appendChild(empty);return;}
    names.forEach(function(name){
      var data=inv[name]||{},div=document.createElement('div');
      div.className='inventory-item';div.textContent=name;
      if(data.slot&&eq[data.slot]===name){div.style.background='#d4f8d4';div.style.borderColor='#11AD36';}
      div.onclick=function(){toggleEquip(name,data,eq[data.slot]===name);};
      grid.appendChild(div);
    });
  }

  function loadProfile(){
    if(!username){currentUser={};return Promise.resolve({});}
    return db.ref('users/'+username).once('value').then(function(s){
      var u=s.val()||{},updates={};
      if(u.Dynamites===undefined)updates.Dynamites=1000;
      if(!u.inventory)updates.inventory={'Starter Pack':true};
      if(!u.colors)updates.colors=defaults;
      if(!u.equipped)updates.equipped={};
      return Object.keys(updates).length?db.ref('users/'+username).update(updates).then(function(){return Object.assign({},u,updates);}):u;
    });
  }

  function buy(item){
    if(!username){alert('Please log in first.');return;}
    db.ref('users/'+username).once('value').then(function(s){
      var u=s.val()||{},price=Math.max(0,Math.min(100,Number(item.price)||0));
      if((u.inventory||{})[item.name])return alert('You already own this item.');
      if(Number(u.Dynamites||0)<price)return alert('Not enough Dynamites!');
      var updates={};
      updates['users/'+username+'/Dynamites']=Number(u.Dynamites||0)-price;
      updates['users/'+username+'/inventory/'+item.name]={slot:item.slot,color:item.color||defaults[item.slot]||defaults.torso,image:item.image||''};
      return db.ref().update(updates).then(loadProfile).then(function(u2){
        currentUser=u2;loadColors(u2.colors||defaults);loadInventory(u2);
        alert(price===0?'You got '+item.name+' for free!':'Purchased '+item.name+'!');
      });
    });
  }

  function toggleEquip(name,data,isEquipped){
    if(!username||!data.slot)return;
    var updates={};
    updates['users/'+username+'/equipped/'+data.slot]=isEquipped?null:name;
    if(data.slot!=='torso'||isEquipped)updates['users/'+username+'/colors/'+data.slot]=isEquipped?defaults[data.slot]:(data.color||defaults[data.slot]);
    db.ref().update(updates).then(loadProfile).then(function(u){currentUser=u;loadColors(u.colors||defaults);loadInventory(u);});
  }

  window.applyColor=function(hex){
    if(!username){alert('Please log in first.');return;}
    var part=(document.getElementById('bodyPartSelect')||{}).value;
    if(!part)return;
    var shirt=(currentUser.inventory||{})[(currentUser.equipped||{}).torso];
    if(part==='torso'&&shirt&&shirt.image){alert('Unequip your T-shirt before changing the torso color.');return;}
    var el=document.getElementById('part-'+part);if(el)el.style.backgroundColor=hex;
    var updates={};updates['users/'+username+'/colors/'+part]=hex;
    db.ref().update(updates).then(function(){currentUser.colors=currentUser.colors||{};currentUser.colors[part]=hex;});
  };

  window.filterCategory=function(slot,button){
    filter=filter===slot?null:slot;
    document.querySelectorAll('.cat-button').forEach(function(b){b.classList.remove('active');});
    if(filter&&button)button.classList.add('active');
    render();
  };

  header();
  moveCategoryLinks();
  loadProfile().then(function(u){
    currentUser=u;loadColors(u.colors||defaults);loadInventory(u);moveCategoryLinks();
    return db.ref('catalog').once('value');
  }).then(function(s){
    items=s.val()||{};
    render();
  }).catch(function(e){console.error('Catalog initialization failed:',e);});
}());
