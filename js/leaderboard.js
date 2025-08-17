// ========================
// LEADERBOARD.JS
// By Kabir
// ========================

import { auth, firestore } from './firebase-config.js'; // ✅ Firestore séparé
import {
  doc, setDoc, getDoc,
  collection, query, orderBy, getDocs, limit
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// 🔹 Sauvegarde du score
export async function saveScore(score) {
  if (!auth.currentUser) return;
  const uid = auth.currentUser.uid;
  const userDocRef = doc(firestore, 'users', uid); // ✅ Firestore utilisé

  const docSnap = await getDoc(userDocRef);
  if (!docSnap.exists() || score > docSnap.data().bestScore) {
    await setDoc(userDocRef, {
      bestScore: score,
      displayName: auth.currentUser.displayName || "Player"
    }, { merge: true });
  }
}

// 🔹 Récupère le meilleur score d’un joueur
export async function loadPlayerBestScore(uid) {
  const userDoc = doc(firestore, 'users', uid); // ✅ Firestore utilisé
  const docSnap = await getDoc(userDoc);
  if (docSnap.exists()) return docSnap.data().bestScore || 0;
  return 0;
}

// 🔹 Charge le classement
export async function loadLeaderboard(topOnly = true) {
  const rankingBoard = document.getElementById('rankingBoard');
  rankingBoard.innerHTML = "Chargement...";

  const usersCol = collection(firestore, 'users'); // ✅ Firestore utilisé
  const q = query(usersCol, orderBy('bestScore', 'desc'), limit(50));
  const querySnapshot = await getDocs(q);

  rankingBoard.innerHTML = '';
  let rank = 1;
  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const div = document.createElement('div');

    // 🥇 Médailles
    let medal = '';
    if (rank === 1) medal = '🥇 ';
    else if (rank === 2) medal = '🥈 ';
    else if (rank === 3) medal = '🥉 ';

    div.textContent = `${medal}${rank}. ${data.displayName || 'Player'} - ${data.bestScore || 0}`;
    rankingBoard.appendChild(div);
    rank++;
  });

  // 🔹 Rang du joueur connecté
  if (auth.currentUser) {
    const uid = auth.currentUser.uid;
    const playerScore = await loadPlayerBestScore(uid);
    const myRank = querySnapshot.docs.findIndex(d => d.id === uid) + 1;
    const myRankDiv = document.getElementById('myRank');
    myRankDiv.textContent = myRank > 0
      ? `Ton rang: ${myRank} (Score: ${playerScore})`
      : `Ton meilleur score: ${playerScore}`;
  }
}

// 🔹 Fermeture du leaderboard
export function setupLeaderboardClose() {
  const closeBtn = document.getElementById('closeLeaderboardBtn');
  closeBtn.addEventListener('click', () => {
    document.getElementById('leaderboardDiv').style.display = "none";
  });
}
