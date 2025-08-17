// ========================
// LEADERBOARD.JS (Realtime DB)
// By Kabir
// ========================

import { auth, db } from './firebase-config.js';
import {
  ref, set, get
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// 🔹 Sauvegarde du score
export async function saveScore(score) {
  if (!auth.currentUser) return;
  const uid = auth.currentUser.uid;
  const username = auth.currentUser.displayName || "Player";

  const userRef = ref(db, 'scores/' + uid);
  const snapshot = await get(userRef);

  const previous = snapshot.exists() ? snapshot.val().score : 0;
  if (score > previous) {
    await set(userRef, {
      score,
      timestamp: Date.now(),
      username
    });
  }
}

// 🔹 Charge le classement
export async function loadLeaderboard() {
  const rankingBoard = document.getElementById('rankingBoard');
  rankingBoard.innerHTML = "Chargement...";

  const scoresRef = ref(db, 'scores');
  const snapshot = await get(scoresRef);

  if (!snapshot.exists()) {
    rankingBoard.innerHTML = "Aucun score trouvé.";
    return;
  }

  const scores = Object.entries(snapshot.val())
    .map(([uid, data]) => ({ uid, ...data }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);

  rankingBoard.innerHTML = '';
  let rank = 1;
  scores.forEach(player => {
    const div = document.createElement('div');
    let medal = '';
    if (rank === 1) medal = '🥇 ';
    else if (rank === 2) medal = '🥈 ';
    else if (rank === 3) medal = '🥉 ';
    div.textContent = `${medal}${rank}. ${player.username} - ${player.score}`;
    rankingBoard.appendChild(div);
    rank++;
  });

  // 🔹 Rang du joueur connecté
  if (auth.currentUser) {
    const uid = auth.currentUser.uid;
    const myData = scores.find(p => p.uid === uid);
    const myRank = scores.findIndex(p => p.uid === uid) + 1;
    const myRankDiv = document.getElementById('myRank');
    if (myData) {
      myRankDiv.textContent = `Ton rang: ${myRank} (Score: ${myData.score})`;
    } else {
      myRankDiv.textContent = `Tu n'es pas encore classé.`;
    }
  }
}

// 🔹 Fermeture du leaderboard
export function setupLeaderboardClose() {
  const closeBtn = document.getElementById('closeLeaderboardBtn');
  closeBtn.addEventListener('click', () => {
    document.getElementById('leaderboardDiv').style.display = "none";
  });
}
