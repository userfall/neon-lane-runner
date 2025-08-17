// 🔹 auth.js – gestion de l'authentification pour Neon Lane Runner
import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Récupération des éléments
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const messageEl = document.getElementById("authMessage");

// 🔹 Connexion
loginBtn?.addEventListener("click", async () => {
  const email = document.getElementById("loginEmail")?.value;
  const pass = document.getElementById("loginPassword")?.value;

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    messageEl.innerText = "Connexion réussie ! Redirection...";
    setTimeout(() => window.location.href = "game.html", 500);
  } catch (err) {
    messageEl.innerText = "Erreur connexion : " + err.message;
  }
});

// 🔹 Inscription
registerBtn?.addEventListener("click", async () => {
  const email = document.getElementById("registerEmail")?.value;
  const pass = document.getElementById("registerPassword")?.value;
  const pseudo = document.getElementById("registerPseudo")?.value || "Joueur";

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCred.user, { displayName: pseudo });
    messageEl.innerText = "Compte créé ! Vous pouvez jouer 🚀";
  } catch (err) {
    messageEl.innerText = "Erreur inscription : " + err.message;
  }
});

// 🔹 Vérification état de connexion pour rester connecté
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Utilisateur connecté :", user.displayName);
    // Tu peux afficher le pseudo dans le HUD ou leaderboard
    const playerNameEl = document.getElementById("playerName");
    if (playerNameEl) playerNameEl.textContent = user.displayName;
  } else {
    console.log("Aucun utilisateur connecté");
  }
});
