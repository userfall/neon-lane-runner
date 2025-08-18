// 🔹 auth.js – gestion de l'authentification pour Neon Lane Runner
import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  ref, set
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

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
    messageEl.innerText = "✅ Connexion réussie ! Redirection...";
    setTimeout(() => window.location.href = "game.html", 500);
  } catch (err) {
    messageEl.innerText = "❌ Erreur connexion : " + err.message;
  } finally {
    loginBtn.disabled = false;
  }
});

// 🔹 Inscription
registerBtn?.addEventListener("click", async () => {
  const email = document.getElementById("registerEmail")?.value;
  const pass = document.getElementById("registerPassword")?.value;
  const pseudo = document.getElementById("registerPseudo")?.value || "Joueur";

  // 🔍 Validation rapide
  if (!email.includes("@") || !email.includes(".")) {
    messageEl.innerText = "❌ Adresse email invalide.";
    return;
  }
  if (pass.length < 6) {
    messageEl.innerText = "❌ Mot de passe trop court (min. 6 caractères).";
    return;
  }
  if (!navigator.onLine) {
    messageEl.innerText = "❌ Pas de connexion Internet.";
    return;
  }

  try {
    registerBtn.disabled = true;
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCred.user, { displayName: pseudo });

    const uid = userCred.user.uid;
    await set(ref(db, 'scores/' + uid), {
      score: 0,
      timestamp: Date.now(),
      username: pseudo
    });

    messageEl.innerText = "✅ Compte créé ! Vous pouvez jouer 🚀";
  } catch (err) {
    switch (err.code) {
      case "auth/email-already-in-use":
        messageEl.innerText = "❌ Cet email est déjà utilisé.";
        break;
      case "auth/invalid-email":
        messageEl.innerText = "❌ Adresse email invalide.";
        break;
      case "auth/weak-password":
        messageEl.innerText = "❌ Mot de passe trop court (min. 6 caractères).";
        break;
      case "auth/network-request-failed":
        messageEl.innerText = "❌ Pas de connexion Internet.";
        break;
      case "auth/too-many-requests":
        messageEl.innerText = "❌ Trop de tentatives. Réessayez plus tard.";
        break;
      default:
        messageEl.innerText = "❌ Erreur : " + err.message;
    }
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
