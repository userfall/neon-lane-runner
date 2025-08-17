import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const messageEl = document.getElementById("authMessage");

loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    window.location.href = "game.html";
  } catch (err) {
    messageEl.innerText = "Erreur connexion : " + err.message;
  }
});

registerBtn.addEventListener("click", async () => {
  const email = document.getElementById("registerEmail").value;
  const pass = document.getElementById("registerPassword").value;
  const pseudo = document.getElementById("registerPseudo").value;

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCred.user, { displayName: pseudo });
    messageEl.innerText = "Compte créé ! Vous pouvez jouer 🚀";
  } catch (err) {
    messageEl.innerText = "Erreur inscription : " + err.message;
  }
});
