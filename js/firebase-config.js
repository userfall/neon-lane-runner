// firebase-config.js
// Importation des fonctions nécessaires depuis le SDK Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// Configuration Firebase
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

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);       // Pour l'authentification
export const db = getDatabase(app);     // Pour Realtime Database
