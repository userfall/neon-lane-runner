// Firebase v9 modular
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCbNweC0aD8f_OGvbvmBVNSKbaMP_A4khI",
  authDomain: "neonlanerunner.firebaseapp.com",
  projectId: "neonlanerunner",
  storageBucket: "neonlanerunner.appspot.com",
  messagingSenderId: "916907926117",
  appId: "1:916907926117:web:43f1d08ed90b864a985c8c"
};

// Initialisation
const app = initializeApp(firebaseConfig);

// Services Firebase
const auth = getAuth(app);
const db = getFirestore(app);

// Export
export { app, auth, db };
