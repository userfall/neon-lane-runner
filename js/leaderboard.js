// leaderboard.js
import { db } from './firebase-config.js';
import { ref, set, get, child, onValue, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { auth } from './firebase-config.js';

// 🔹 Sauvegarder le score dans Firebase
export async function saveScore(score) {
  if (!auth.currentUser) return;

  const userId = auth.currentUser.uid;
  const userRef = ref(db, `leaderboard/${userId}`);

  // On vérifie le meilleur score existant
  const snapshot = await get(userRef);
  if (!snapshot.exists() || score > snapshot.val().score) {
    await set(userRef, {
      name: auth.currentUser.displayName || "Joueur",
      score: score
    });
    console.log(`✅ Score ${score} sauvegardé pour ${userId}`);
  }
}

// 🔹 Charger le leaderboard
export function loadLeaderboard() {
  const leaderboardDiv = document.getElementById("leaderboardDiv");
  leaderboardDiv.innerHTML = "<h2>Classement</h2>";

  const lbRef = ref(db, "leaderboard");
  // Lecture continue pour mise à jour automatique
  onValue(lbRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    // On trie par score décroissant
    const sorted = Object.values(data).sort((a, b) => b.score - a.score);

    let html = "<ol>";
    sorted.forEach(user => {
      html += `<li>${user.name}: ${user.score} pts</li>`;
    });
    html += "</ol>";
    leaderboardDiv.innerHTML = "<h2>Classement</h2>" + html;
  });
}

// 🔹 Fermer le leaderboard
export function setupLeaderboardClose() {
  const closeBtn = document.getElementById("closeLeaderboard");
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById("leaderboardDiv").style.display = "none";
    });
  }
}
