// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyDtxYw55qR1wO3fw3EBivVhz4XI_H7GzvQ",
  authDomain: "dynaduck-19dbb.firebaseapp.com",
  databaseURL: "https://dynaduck-19dbb-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dynaduck-19dbb",
  storageBucket: "dynaduck-19dbb.firebasestorage.app",
  messagingSenderId: "777148453502",
  appId: "1:777148453502:web:2f67ac439ec29dc4fc3e2f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
