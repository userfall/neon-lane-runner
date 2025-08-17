import { saveScore, loadLeaderboard, setupLeaderboardClose } from "./leaderboard.js";
import { auth } from "./firebase-config.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let lives = 3;
let level = 1;
let running = true;

// 🔄 Boucle du jeu
function loop() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Exemple affichage joueur
  ctx.fillStyle = "#0ff";
  ctx.fillRect(canvas.width/2 - 25, canvas.height - 100, 50, 50);

  // Incrémentation score
  score++;
  document.getElementById("score").innerText = "Score: " + score;

  requestAnimationFrame(loop);
}

// 🎮 Démarrer le jeu
loop();

// 💾 Sauvegarde du score quand on quitte
window.addEventListener("beforeunload", () => {
  saveScore(score);
});

// 📊 Leaderboard
loadLeaderboard();
setupLeaderboardClose();
