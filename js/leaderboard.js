// leaderboard.js
import { db, auth } from './firebase-config.js';
import { ref, push, set, get } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// Sauvegarder le score de l'utilisateur
export function saveScore(score) {
  if (!auth.currentUser) return; // Si pas connecté, ne rien faire
  const userId = auth.currentUser.uid;
  const userName = auth.currentUser.displayName || "Anonyme";

  const scoresRef = ref(db, 'scores/');
  const newScoreRef = push(scoresRef); // Crée un nouvel identifiant unique
  set(newScoreRef, {
    userId,
    userName,
    score,
    timestamp: Date.now()
  });
}

// Charger et afficher le classement
export async function loadLeaderboard() {
  const scoresRef = ref(db, 'scores/');
  const snapshot = await get(scoresRef);
  const rankingBoard = document.getElementById('rankingBoard');
  if (!snapshot.exists()) {
    rankingBoard.innerHTML = "Aucun score pour le moment.";
    return;
  }

  const scores = Object.values(snapshot.val());
  // Trier du plus grand au plus petit
  scores.sort((a, b) => b.score - a.score);

  rankingBoard.innerHTML = "";
  scores.slice(0, 10).forEach((s, index) => {
    const div = document.createElement('div');
    div.textContent = `${index + 1}. ${s.userName} - ${s.score} pts`;
    rankingBoard.appendChild(div);
  });

  // Afficher le rang de l'utilisateur connecté
  if (auth.currentUser) {
    const myScoreIndex = scores.findIndex(s => s.userId === auth.currentUser.uid);
    const myRankDiv = document.getElementById('myRank');
    if (myScoreIndex !== -1) {
      myRankDiv.textContent = `Ton rang : ${myScoreIndex + 1} / ${scores.length}`;
    } else {
      myRankDiv.textContent = "";
    }
  }
}

// Fermer le panneau du classement
export function setupLeaderboardClose() {
  const closeBtn = document.getElementById("closeLeaderboardBtn");
  closeBtn.addEventListener('click', () => {
    document.getElementById("leaderboardDiv").style.display = "none";
  });
}
