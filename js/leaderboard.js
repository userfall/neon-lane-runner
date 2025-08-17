import { auth, db } from './firebase-config.js';
import { isMobile, sanitizeKey } from './utils.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";


export async function saveScore(score) {
  const user = auth.currentUser;
  if (!user) return;

  const pseudo = user.displayName || user.email.split('@')[0];
  const key = sanitizeKey(pseudo);
  const safeScore = Number(score) || 0;

  const ref = doc(db, "leaderboard", key);
  const snap = await getDoc(ref);

  const existing = snap.exists() ? snap.data() : null;
  if (!existing || safeScore > (Number(existing.score) || 0)) {
    await setDoc(ref, {
      pseudo,
      score: safeScore,
      timestamp: Date.now()
    }).catch(e => console.warn("Erreur saveScore", e));
  }
}

export async function loadLeaderboard() {
  const boardEl = document.getElementById("rankingBoard");
  const myRankEl = document.getElementById("myRank");
  boardEl.innerHTML = "Chargement...";

  try {
    const ref = collection(db, "leaderboard");
    const q = query(ref, orderBy("score", "desc"), limit(50));
    const snapshot = await getDocs(q);

    const entries = [];
    snapshot.forEach(doc => {
      const val = doc.data();
      if (val && val.pseudo && val.score != null) {
        entries.push({
          pseudo: val.pseudo,
          score: Number(val.score) || 0,
          timestamp: val.timestamp || 0
        });
      }
    });

    entries.sort((a, b) => b.score - a.score || b.timestamp - a.timestamp);
    let html = "<ol>";
    const current = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0];

    entries.forEach((e, i) => {
      const isCurrent = current && sanitizeKey(current) === sanitizeKey(e.pseudo);
      html += `<li${isCurrent ? ' style="color:#0f0;font-weight:bold;"' : ''}>
        <b>#${i + 1}</b> ${e.pseudo} — <b>${e.score}</b> pts
      </li>`;
    });

    html += "</ol>";
    boardEl.innerHTML = html;

    const idx = entries.findIndex(e => sanitizeKey(e.pseudo) === sanitizeKey(current));
    if (idx >= 0) {
      myRankEl.innerHTML = `Ton rang : <b>#${idx + 1}</b> — score : <b>${entries[idx].score}</b>`;
    } else {
      myRankEl.innerText = "Tu n'as pas encore de score enregistré.";
    }
  } catch (err) {
    boardEl.innerHTML = `<span style="color:red">Erreur chargement classement</span>`;
    console.error("fetchLeaderboard err", err);
  }
}

window.loadLeaderboard = loadLeaderboard;

export function setupLeaderboardClose() {
  const closeBtn = document.getElementById("closeLeaderboardBtn");
  const overlay = document.getElementById("leaderboardDiv");
  if (closeBtn && overlay) {
    closeBtn.addEventListener("click", () => {
      overlay.style.display = "none";
      const gameDiv = document.getElementById("gameDiv");
      if (gameDiv) {
        gameDiv.style.display = "flex";
      }
    });
  }
}
