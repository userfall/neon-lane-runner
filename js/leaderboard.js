<script>
function saveScore(pseudo, score) {
  if (!pseudo) return;
  const key = sanitizeKey(pseudo);
  const ref = db.ref("leaderboard/" + key);
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

function fetchLeaderboard() {
  const boardEl = document.getElementById("rankingBoard");
  boardEl.innerHTML = "Chargement...";
  db.ref("leaderboard").once("value")
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
      for (let i = 0; i < 10; i++) {
        if (entries[i]) {
          const e = entries[i];
          const rankClass = (window.currentPseudo && sanitizeKey(window.currentPseudo).toLowerCase() === sanitizeKey(e.pseudo).toLowerCase()) ? 'rank-current' : '';
          html += `<li class="${rankClass}"><b>#${i + 1}</b> ${e.pseudo} : <b>${e.score}</b> pts</li>`;
        } else {
          html += `<li style="color:#999">Vide</li>`;
        }
      }
      html += "</ol>";
      boardEl.innerHTML = html;

      // Ton rang personnel
      const myRankEl = document.getElementById("myRank");
      if (window.currentPseudo) {
        const myKey = sanitizeKey(window.currentPseudo).toLowerCase();
        const idx = entries.findIndex(e => sanitizeKey(e.pseudo).toLowerCase() === myKey);
        if (idx >= 0) {
          myRankEl.innerHTML = `Ton rang : <b>#${idx + 1}</b> — score : <b>${entries[idx].score}</b>`;
        } else {
          myRankEl.innerText = "Tu n'as pas encore de score enregistré.";
        }
      } else {
        myRankEl.innerText = "Connecte-toi pour voir ton rang.";
      }
    })
    .catch(err => {
      boardEl.innerHTML = `<span style="color:red">Erreur chargement classement</span>`;
      console.error("fetchLeaderboard err", err);
    });
}

function showLeaderboard() {
  document.getElementById("gameDiv").style.display = "none";
  document.getElementById("leaderboardDiv").style.display = "flex";
  fetchLeaderboard();
}

function backToGame() {
  document.getElementById("leaderboardDiv").style.display = "none";
  document.getElementById("gameDiv").style.display = "flex";
}
</script>
