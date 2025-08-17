// 🔹 auth.js – gestion de l'authentification pour Neon Lane Runner
import { auth, firestore } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// 🔹 Éléments DOM
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const messageEl = document.getElementById("authMessage");

// 🔹 Connexion
loginBtn?.addEventListener("click", async () => {
  const email = document.getElementById("loginEmail")?.value;
  const pass = document.getElementById("loginPassword")?.value;

  try {
    loginBtn.disabled = true;
    await signInWithEmailAndPassword(auth, email, pass);
    messageEl.innerText = "Connexion réussie ! Redirection...";
    setTimeout(() => window.location.href = "game.html", 500);
  } catch (err) {
    messageEl.innerText = "Erreur connexion : " + err.message;
  } finally {
    loginBtn.disabled = false;
  }
});

// 🔹 Inscription
registerBtn?.addEventListener("click", async () => {
  const email = document.getElementById("registerEmail")?.value;
  const pass = document.getElementById("registerPassword")?.value;
  const pseudo = document.getElementById("registerPseudo")?.value || "Joueur";

  try {
    registerBtn.disabled = true;
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCred.user, { displayName: pseudo });

    // 🔹 Sauvegarde du pseudo dans Firestore
    const uid = userCred.user.uid;
    await setDoc(doc(firestore, "users", uid), {
      displayName: pseudo,
      bestScore: 0
    }, { merge: true });

    messageEl.innerText = "Compte créé ! Vous pouvez jouer 🚀";
  } catch (err) {
    messageEl.innerText = "Erreur inscription : " + err.message;
  } finally {
    registerBtn.disabled = false;
  }
});

// 🔹 État de connexion
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Utilisateur connecté :", user.displayName);
    const playerNameEl = document.getElementById("playerName");
    if (playerNameEl) playerNameEl.textContent = user.displayName;
  } else {
    console.log("Aucun utilisateur connecté");
  }
});
