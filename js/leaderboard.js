import { getDatabase, ref, set, get, child, onValue } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';
import { app, auth } from './firebase-config.js';

const db = getDatabase(app);

// 🔐 Nettoyage du pseudo
function sanitizeKey(name) {
  return name.replace(/[.#$/[\]]/g, "_");
}

// 💾 Sauvegarder le score
export async function saveScore(score) {
  const user = auth.currentUser;
  if (!user) return;

  const pseudo = user.displayName || user.email.split('@')[0];
  const safePseudo = sanitizeKey(pseudo);
  const refPath = ref(db, 'leaderboard/' + safePseudo);

  try {
    const snapshot = await get(refPath);
    const existing = snapshot.val();

    if (!existing || score > (existing.score || 0)) {
      await set(refPath, {
        pseudo,
        score: Number(score),
        timestamp: Date.now()
      });
    }
  } catch (err) {
    console.error("Erreur sauvegarde score RTDB:", err);
  }
}

// 📊 Charger le classement
export async function loadLeaderboard() {
  const boardEl = document.getElementById("leaderboardList");
  if (!boardEl) return;

  boardEl.innerHTML = "Chargement...";

  try {
    const snapshot = await get(ref(db, 'leaderboard'));
    const data = snapshot.val();

    if (!data) {
      boardEl.innerHTML = "<p>Aucun score enregistré.</p>";
      return;
    }

    const entries = Object.values(data)
      .filter(e => e && typeof e.score === 'number')
      .sort((a, b) => b.score - a.score || b.timestamp - a.timestamp)
      .slice(0, 10);

    let html = "<ol>";
    const current = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0];

    entries.forEach(entry => {
      const isCurrent = current && sanitizeKey(current) === sanitizeKey(entry.pseudo);
      html += `<li${isCurrent ? ' style="color:#0f0;font-weight:bold;"' : ''}>
        ${entry.pseudo} — <b>${entry.score}</b> pts
      </li>`;
    });

    html += "</ol>";
    boardEl.innerHTML = html;
  } catch (err) {
    boardEl.innerHTML = `<span style="color:red">Erreur chargement classement</span>`;
    console.error("Erreur leaderboard RTDB:", err);
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
