// ========================
// LEADERBOARD.JS
// By Kabir
// ========================

import { auth, db } from './firebase-config.js';
import { doc, setDoc, getDoc, collection, query, orderBy, getDocs, limit } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// 🔹 Sauvegarde du score
export async function saveScore(score) {
  if (!auth.currentUser) return;
  const uid = auth.currentUser.uid;
  const userDocRef = doc(db, 'users', uid);

  const docSnap = await getDoc(userDocRef);
  if (!docSnap.exists() || score > docSnap.data().bestScore) {
    await setDoc(userDocRef, { bestScore: score, displayName: auth.currentUser.displayName || "Player" }, { merge: true });
  }
}

// 🔹 Récupère le meilleur score d’un joueur
export async function loadPlayerBestScore(uid) {
  const userDoc = doc(db, 'users', uid);
  const docSnap = await getDoc(userDoc);
  if (docSnap.exists()) return docSnap.data().bestScore || 0;
  return 0;
}

// 🔹 Charge le classement (ne prend que le meilleur score de chaque joueur)
export async function loadLeaderboard(topOnly = true) {
  const rankingBoard = document.getElementById('rankingBoard');
  rankingBoard.innerHTML = "Chargement...";

  const usersCol = collection(db, 'users');
  const q = query(usersCol, orderBy('bestScore', 'desc'), limit(50));
  const querySnapshot = await getDocs(q);

  rankingBoard.innerHTML = '';
  let rank = 1;
  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const div = document.createElement('div');
    div.textContent = `${rank}. ${data.displayName || 'Player'} - ${data.bestScore || 0}`;
    rankingBoard.appendChild(div);
    rank++;
  });

  // Affiche le rang du joueur connecté
  if (auth.currentUser) {
    const uid = auth.currentUser.uid;
    const playerScore = await loadPlayerBestScore(uid);
    const myRank = Array.from(querySnapshot.docs).findIndex(d => d.id === uid) + 1;
    const myRankDiv = document.getElementById('myRank');
    myRankDiv.textContent = myRank > 0 ? `Ton rang: ${myRank} (Score: ${playerScore})` : `Ton meilleur score: ${playerScore}`;
  }
}

// 🔹 Fermeture du leaderboard
export function setupLeaderboardClose() {
  const closeBtn = document.getElementById('closeLeaderboardBtn');
  closeBtn.addEventListener('click', () => {
    document.getElementById('leaderboardDiv').style.display = "none";
  });
}
