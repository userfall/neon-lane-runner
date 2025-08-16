// game.js
import { saveScore, loadLeaderboard, setupLeaderboardClose } from './leaderboard.js';
import { gameSettings, loadSettings } from './settings.js';

// 🎵 SONS
const sounds = {
  hit: new Audio('./assets/sounds/hit.wav'),
  music: new Audio('./assets/sounds/music.mp3'),
  gameover: new Audio('./assets/sounds/gameover.wav'),
  levelup: new Audio('./assets/sounds/levelup.wav')
};
sounds.music.loop = true;
sounds.music.volume = 0.5;

// 🎮 CANVAS
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
resizeCanvas();

// 📸 FOND
const backgroundImg = new Image();
backgroundImg.src = './assets/images/background.png';
let bgY = 0;

// 🧠 Éléments HUD
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const startBtn = document.getElementById('startBtn');
const musicToggle = document.getElementById('musicToggle');
const fxToggle = document.getElementById('fxToggle');
const showLeaderboardBtn = document.getElementById('showLeaderboardBtn');
const leaderboardOverlay = document.getElementById('leaderboardOverlay');
const paramPanel = document.getElementById('paramPanel');
const victoryOverlay = document.getElementById('victoryOverlay');
const replayBtn = document.getElementById('replayBtn');
const fireworksCanvas = document.getElementById('fireworksCanvas');

// 🧩 Variables de jeu
let player, obstacles, boss;
let score = 0, lives = 3, level = 1;
let keys = {};
let gameStarted = false;

// 🎮 Contrôles clavier
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// 📱 Contrôles tactiles
canvas.addEventListener('touchstart', e => {
  const touchX = e.touches[0].clientX;
  if (touchX < canvas.width / 2) keys['ArrowLeft'] = true;
  else keys['ArrowRight'] = true;
});
canvas.addEventListener('touchend', () => {
  keys['ArrowLeft'] = false;
  keys['ArrowRight'] = false;
});

// 🎮 Boutons HUD
startBtn.addEventListener('click', startGame);
musicToggle.addEventListener('click', () => {
  gameSettings.musicOn = !gameSettings.musicOn;
  musicToggle.textContent = gameSettings.musicOn ? "Musique ON" : "Musique OFF";
  gameSettings.musicOn ? fadeInMusic() : fadeOutMusic();
});
fxToggle.addEventListener('click', () => {
  gameSettings.fxOn = !gameSettings.fxOn;
  fxToggle.textContent = gameSettings.fxOn ? "FX ON" : "FX OFF";
});
showLeaderboardBtn.addEventListener('click', async () => await loadLeaderboard());
setupLeaderboardClose();
replayBtn.addEventListener('click', () => {
  victoryOverlay.style.display = 'none';
  startGame();
});

// 🧠 Initialisation
window.addEventListener('load', async () => {
  await loadSettings();
  lives = gameSettings.lives;
  drawBackground();
  if (gameSettings.musicOn) fadeInMusic();
});
window.addEventListener('resize', resizeCanvas);

// 📐 Resize canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// 🔊 Fonctions musique
function fadeInMusic() {
  if (sounds.music.paused) sounds.music.play();
  let vol = 0;
  const fade = setInterval(() => {
    vol += 0.05;
    sounds.music.volume = Math.min(vol, 0.5);
    if (vol >= 0.5) clearInterval(fade);
  }, 100);
}
function fadeOutMusic() {
  let vol = sounds.music.volume;
  const fade = setInterval(() => {
    vol -= 0.05;
    sounds.music.volume = Math.max(vol, 0);
    if (vol <= 0) {
      sounds.music.pause();
      sounds.music.volume = 0.5;
      clearInterval(fade);
    }
  }, 100);
}

// 🚀 Démarrer le jeu
function startGame() {
  gameStarted = true;
  score = 0;
  level = 1;
  lives = gameSettings.lives;
  obstacles = [];
  player = { x: canvas.width / 2 - 25, y: canvas.height - 100, width: 50, height: 50 };
  boss = { x: Math.random() * canvas.width, y: -100, width: 60, height: 60 };
  bgY = 0;
  paramPanel.style.display = 'none';
  animateCountdown(3, () => requestAnimationFrame(gameLoop));
}

// ⏳ Compte à rebours
function animateCountdown(num, callback) {
  const overlay = document.createElement('div');
  overlay.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);color:#0ff;font-size:100px;display:flex;align-items:center;justify-content:center;z-index:1000;";
  document.body.appendChild(overlay);
  let count = num;
  overlay.textContent = count;
  const interval = setInterval(() => {
    count--;
    overlay.textContent = count > 0 ? count : '';
    if (count <= 0) {
      clearInterval(interval);
      overlay.remove();
      callback();
    }
  }, 1000);
}

// 🎮 Boucle de jeu
function gameLoop() {
  if (!gameStarted) return;

  bgY += gameSettings.gameSpeed / 2;
  if (bgY >= canvas.height) bgY = 0;
  drawBackground();

  if (keys['ArrowLeft'] && player.x > 0) player.x -= gameSettings.gameSpeed;
  if (keys['ArrowRight'] && player.x + player.width < canvas.width) player.x += gameSettings.gameSpeed;

  ctx.fillStyle = "#0ff";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  moveBoss();

  if (Math.random() * 100 < gameSettings.spawnRate / 10) {
    obstacles.push({ x: Math.random() * (canvas.width - 30), y: -30, width: 30, height: 30 });
  }

  obstacles.forEach((o, i) => {
    o.y += gameSettings.gameSpeed;
    ctx.fillStyle = "#f00";
    ctx.fillRect(o.x, o.y, o.width, o.height);

    if (player.x < o.x + o.width && player.x + player.width > o.x &&
        player.y < o.y + o.height && player.y + player.height > o.y) {
      obstacles.splice(i, 1);
      lives--;
      if (gameSettings.fxOn) sounds.hit.play();
    }

    if (o.y > canvas.height) obstacles.splice(i, 1);
  });

  score++;
  scoreEl.textContent = "Score: " + score;
  livesEl.textContent = "Vies: " + lives;

  updateLevel();

  if (lives <= 0) endGame();
  else requestAnimationFrame(gameLoop);
}

// 🎨 Fond défilant
function drawBackground() {
  ctx.drawImage(backgroundImg, 0, bgY - canvas.height, canvas.width, canvas.height);
  ctx.drawImage(backgroundImg, 0, bgY, canvas.width, canvas.height);
}

// 👾 Boss IA
function moveBoss() {
  if (player.x < boss.x) boss.x -= 2;
  if (player.x > boss.x) boss.x += 2;
  boss.y += 1;
  ctx.fillStyle = "#ff0";
  ctx.fillRect(boss.x, boss.y, boss.width, boss.height);

  if (player.x < boss.x + boss.width && player.x + player.width > boss.x &&
      player.y < boss.y + boss.height && player.y + player.height > boss.y) {
    lives--;
    boss.y = -100;
  }

  if (boss.y > canvas.height) boss.y = -100;
}

// 🆙 Niveau
function updateLevel() {
  if (score % 500 === 0 && score !== 0) {
    level++;
    gameSettings.gameSpeed += 1;
    gameSettings.spawnRate += 10;
    if (gameSettings.fxOn) sounds.levelup.play();
    showLevelUp(level);
  }
}

function showLevelUp(level) {
  // Injecte l'animation CSS une seule fois
  if (!document.getElementById('levelUpStyle')) {
    const style = document.createElement('style');
    style.id = 'levelUpStyle';
    style.textContent = `
      @keyframes fadeOutLevel {
        0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
      }
    `;
    document.head.appendChild(style);
  }

  // Crée l'élément visuel
  const overlay = document.createElement('div');
  overlay.textContent = "Niveau " + level;
  overlay.style.position = "absolute";
  overlay.style.top = "40%";
  overlay.style.left = "50%";
  overlay.style.transform = "translate(-50%, -50%)";
  overlay.style.color = "#0f0";
  overlay.style.fontSize = "60px";
  overlay.style.fontWeight = "bold";
  overlay.style.textShadow = "0 0 20px #0f0, 0 0 40px #0f0";
  overlay.style.zIndex = "1000";
  overlay.style.pointerEvents = "none";
  overlay.style.animation = "fadeOutLevel 1.5s ease forwards";

  document.body.appendChild(overlay);

  // Supprime après animation
  setTimeout(() => overlay.remove(), 1500);
}

// 🧨 Fin du jeu
function endGame() {
  gameStarted = false;
  paramPanel.style.display = 'flex';
  if (gameSettings.musicOn) fadeInMusic();
  if (gameSettings.fxOn) sounds.gameover.play();

  alert("Game Over ! Score: " + score);

  if (score >= 2000) {
    victoryOverlay.style.display = 'flex';
    launchFireworks();
  }

  saveScore(score);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
}

// 🎆 Feux d’artifice
function launchFireworks() {
  const ctxF = fireworksCanvas.getContext('2d');
  fireworksCanvas.width = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;

  const particles = [];
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: fireworksCanvas.width / 2,
      y: fireworksCanvas.height / 2,
      dx: (Math.random() - 0.5) * 6,
      dy: (Math.random() - 0.5) * 6,
      radius: Math.random() * 3 + 2,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      life: 100
    });
  }

  function animate() {
    ctxF.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
    particles.forEach(p => {
      ctxF.beginPath();
      ctxF.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctxF.fillStyle = p.color;
      ctxF.fill();
      p.x += p.dx;
      p.y += p.dy;
      p.life--;
    });

    for (let i = particles.length - 1; i >= 0; i--) {
      if (particles[i].life <= 0) particles.splice(i, 1);
    }

    if (particles.length > 0) requestAnimationFrame(animate);
  }

  animate();
}

   
