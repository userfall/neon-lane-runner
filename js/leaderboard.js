// leaderboard.js — Firebase compat
function sanitizeKey(s) {
  if (!s) return "anon";
  return String(s).replace(/[.#$\[\]\/]/g, "_");
}

// 💾 Sauvegarder le score
export function saveScore(score) {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const pseudo = user.displayName || user.email.split('@')[0];
  const key = sanitizeKey(pseudo);
  const ref = firebase.database().ref("leaderboard/" + key);
  const safeScore = Number(score) || 0;

  ref.once("value").then(snap => {
    const v = snap.val();
    if (!v || safeScore > (Number(v.score) || 0)) {
      ref.set({
        pseudo: pseudo,
        score: safeScore,
        timestamp: Date.now()
      }).catch(e => console.warn("Erreur saveScore", e));
    }
  }).catch(e => console.warn("Erreur lecture score", e));
}

// 📊 Charger le classement
export function loadLeaderboard() {
  const boardEl = document.getElementById("rankingBoard");
  const myRankEl = document.getElementById("myRank");
  boardEl.innerHTML = "Chargement...";

  firebase.database().ref("leaderboard").once("value")
    .then(snapshot => {
      const entries = [];
      snapshot.forEach(child => {
        const val = child.val();
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
      const current = firebase.auth().currentUser?.displayName || firebase.auth().currentUser?.email?.split('@')[0];

      entries.forEach((e, i) => {
        const isCurrent = current && sanitizeKey(current) === sanitizeKey(e.pseudo);
        html += `<li${isCurrent ? ' class="rank-current"' : ''}>
          <b>#${i + 1}</b> ${e.pseudo} : <b>${e.score}</b> pts
        </li>`;
      });

      html += "</ol>";
      boardEl.innerHTML = html;

      // Rang personnel
      const idx = entries.findIndex(e => sanitizeKey(e.pseudo) === sanitizeKey(current));
      if (idx >= 0) {
        myRankEl.innerHTML = `Ton rang : <b>#${idx + 1}</b> — score : <b>${entries[idx].score}</b>`;
      } else {
        myRankEl.innerText = "Tu n'as pas encore de score enregistré.";
      }
    })
    .catch(err => {
      boardEl.innerHTML = `<span style="color:red">Erreur chargement classement</span>`;
      console.error("fetchLeaderboard err", err);
    });
}

// 🔙 Fermer le panneau
export function setupLeaderboardClose() {
  const closeBtn = document.getElementById("closeLeaderboardBtn");
  const overlay = document.getElementById("leaderboardDiv");
  if (closeBtn && overlay) {
    closeBtn.addEventListener("click", () => {
      overlay.style.display = "none";
      document.getElementById("gameDiv").style.display = "flex";
    });
  }
}
