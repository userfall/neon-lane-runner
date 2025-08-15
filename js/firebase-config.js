// Firebase v9 modular
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCbNweC0aD8f_OGvbvmBVNSKbaMP_A4khI",
  authDomain: "neonlanerunner.firebaseapp.com",
  projectId: "neonlanerunner",
  storageBucket: "neonlanerunner.appspot.com",
  messagingSenderId: "916907926117",
  appId: "1:916907926117:web:43f1d08ed90b864a985c8c"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
