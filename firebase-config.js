// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyDM3_vpaeh6e8ODIQGAwM1nmg3xsI6wPvI",
    authDomain: "dynaduck-305ae.firebaseapp.com",
    projectId: "dynaduck-305ae",
    databaseURL: "https://dynaduck-305ae-default-rtdb.firebaseio.com/",
    storageBucket: "dynaduck-305ae.firebasestorage.app",
    messagingSenderId: "1095752853036",
    appId: "1:1095752853036:web:bd47e8e3858417a0429389"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
