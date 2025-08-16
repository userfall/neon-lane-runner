import { db, auth } from './firebase-config.js';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// 🔐 Sanitize pseudo
function sanitizeKey(name) {
  return name.replace(/[.#$/[\]]/g, "_");
}

// 💾 Sauvegarder le score
export async function saveScore(score) {
  const user = auth.currentUser;
  if (!user) return;

  const pseudo = user.displayName || user.email.split('@')[0];
  const safePseudo = sanitizeKey(pseudo);
  const ref = doc(db, "leaderboard", safePseudo);

  try {
    await setDoc(ref, {
      pseudo,
      score: Number(score),
      timestamp: Date.now()
    }, { merge: true });
  } catch (err) {
    console.error("Erreur sauvegarde score :", err);
  }
}

// 📊 Charger le classement
export async function loadLeaderboard() {
  const boardEl = document.getElementById("leaderboardList");
  if (!boardEl) return;

  boardEl.innerHTML = "Chargement...";

  try {
    const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(10));
    const snapshot = await getDocs(q);

    let html = "<ol>";
    snapshot.forEach(doc => {
      const data = doc.data();
      const isCurrent = auth.currentUser &&
        (auth.currentUser.displayName === data.pseudo ||
         auth.currentUser.email.split('@')[0] === data.pseudo);

      html += `<li${isCurrent ? ' style="color:#0f0;font-weight:bold;"' : ''}>
        ${data.pseudo} — <b>${data.score}</b> pts
      </li>`;
    });
    html += "</ol>";
    boardEl.innerHTML = html;
  } catch (err) {
    boardEl.innerHTML = `<span style="color:red">Erreur chargement classement</span>`;
    console.error("Erreur leaderboard :", err);
  }
}

// 🔙 Fermer le panneau
export function setupLeaderboardClose() {
  const closeBtn = document.getElementById("closeLeaderboardBtn");
  const overlay = document.getElementById("leaderboardOverlay");
  if (closeBtn && overlay) {
    closeBtn.addEventListener("click", () => {
      overlay.style.display = "none";
    });
  }
}
