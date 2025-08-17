// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// ==========================
// CONFIG FIREBASE
// ==========================
const firebaseConfig = {
  apiKey: "AIzaSyDsoPkvefltYiKhHdlrGpd4GXbr8CEorcE",
  authDomain: "kabir123-3b13b.firebaseapp.com",
  databaseURL: "https://kabir123-3b13b-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "kabir123-3b13b",
  storageBucket: "kabir123-3b13b.appspot.com",
  messagingSenderId: "311432929296",
  appId: "1:311432929296:web:9e648489cd02a6bc7aea95",
  measurementId: "G-V14E5S3QXC"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
