// js/leaderboard.js
import { auth, db } from './firebase-config.js';
import { ref, set, push, get, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// DOM
const leaderboardDiv = document.getElementById("leaderboardDiv");
const rankingBoard = document.getElementById("rankingBoard");
const myRankEl = document.getElementById("myRank");
const closeBtn = document.getElementById("closeLeaderboardBtn");

// 🔹 Fermer le leaderboard
export function setupLeaderboardClose() {
  closeBtn.addEventListener("click", () => {
    leaderboardDiv.style.display = "none";
  });
}

// 🔹 Sauvegarder un score
export async function saveScore(score) {
  if (!auth.currentUser) return;

  const userId = auth.currentUser.uid;
  const username = auth.currentUser.displayName || "Anonyme";

  try {
    const scoreRef = ref(db, 'scores/' + userId);
    await set(scoreRef, {
      username,
      score,
      timestamp: Date.now()
    });
    console.log("Score sauvegardé :", score);
  } catch (err) {
    console.error("Erreur sauvegarde score :", err);
  }
}

// 🔹 Charger et afficher le leaderboard
export async function loadLeaderboard() {
  rankingBoard.innerHTML = "Chargement...";

  try {
    const scoresRef = ref(db, 'scores');
    const scoresSnap = await get(scoresRef);

    if (!scoresSnap.exists()) {
      rankingBoard.innerHTML = "Aucun score pour l'instant.";
      return;
    }

    const scoresObj = scoresSnap.val();
    const scoresArray = Object.values(scoresObj);

    // Trier du meilleur au moins bon
    scoresArray.sort((a, b) => b.score - a.score);

    // Afficher les 10 meilleurs
    rankingBoard.innerHTML = "";
    scoresArray.slice(0, 10).forEach((entry, index) => {
      const div = document.createElement("div");
      div.textContent = `${index + 1}. ${entry.username} - ${entry.score} pts`;
      rankingBoard.appendChild(div);
    });

    // Afficher le rang du joueur connecté
    if (auth.currentUser) {
      const myScore = scoresObj[auth.currentUser.uid];
      if (myScore) {
        const rank = scoresArray.findIndex(s => s.username === myScore.username && s.score === myScore.score) + 1;
        myRankEl.textContent = `Ton rang : ${rank} / ${scoresArray.length}`;
      } else {
        myRankEl.textContent = "Ton score n'est pas encore enregistré.";
      }
    }
  } catch (err) {
    console.error("Erreur chargement leaderboard :", err);
    rankingBoard.innerHTML = "Erreur lors du chargement du classement.";
  }
}
