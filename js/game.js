// ========================
// NEON LANE RUNNER - GAME.JS
// By Kabir - Neon Games Corporation
// ========================

import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { saveScore, loadLeaderboard, setupLeaderboardClose } from './leaderboard.js';

// 🎮 Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 🧠 DOM Elements
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const startBtn = document.getElementById('startBtn');
const musicToggle = document.getElementById('musicToggle');
const fxToggle = document.getElementById('fxToggle');
const statsBtn = document.getElementById('statsBtn');
const closeStatsBtn = document.getElementById('closeStatsBtn');
const statsPanel = document.getElementById('statsPanel');
const statsContent = document.getElementById('statsContent');
const paramPanel = document.getElementById('paramPanel');
const pauseBtn = document.getElementById('pauseBtn');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const leaderboardDiv = document.getElementById('leaderboardDiv');
const myRankDiv = document.createElement('div');
myRankDiv.id = "myRank";
leaderboardDiv.appendChild(myRankDiv);

// 🎵 Sounds
const sounds = {
  music: new Audio('./assets/sounds/music.mp3'),
  hit: new Audio('./assets/sounds/hit.wav'),
  levelup: new Audio('./assets/sounds/levelup.wav'),
  gameover: new Audio('./assets/sounds/gameover.wav')
};
sounds.music.loop = true;
sounds.music.volume = 0.5;

// 🖼️ Background
const backgroundImg = new Image();
backgroundImg.src = './assets/images/background.png';
let bgY = 0;
let menuMode = true;

// 🔹 Game Variables
let player, obstacles, boss;
let score = 0, lives = 3, level = 1;
let gameStarted = false;
let gamePaused = false;
let keys = {};
let gameSettings = {
  gameSpeed: 2.5,
  spawnRate: 25,
  musicOn: true,
  fxOn: true,
  lives: 5
};

// 🔐 Auth Check
onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Vous devez être connecté pour jouer !");
    window.location.href = "index.html";
  }
});

// 🧠 Resize
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 🎮 Controls
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);
canvas.addEventListener('touchstart', e => {
  if (!e.touches.length) return;
  const touchX = e.touches[0].clientX;
  keys[touchX < canvas.width / 2 ? 'ArrowLeft' : 'ArrowRight'] = true;
});
canvas.addEventListener('touchend', () => {
  keys['ArrowLeft'] = false;
  keys['ArrowRight'] = false;
});

// 🎮 Buttons
musicToggle.addEventListener('click', () => {
  gameSettings.musicOn = !gameSettings.musicOn;
  musicToggle.textContent = gameSettings.musicOn ? "Musique ON" : "Musique OFF";
  gameSettings.musicOn ? sounds.music.play() : sounds.music.pause();
});
fxToggle.addEventListener('click', () => {
  gameSettings.fxOn = !gameSettings.fxOn;
  fxToggle.textContent = gameSettings.fxOn ? "FX ON" : "FX OFF";
});
statsBtn.addEventListener('click', showStats);
closeStatsBtn.addEventListener('click', hideStats);
pauseBtn.addEventListener('click', togglePause);
startBtn.addEventListener('click', () => animateCountdown(3, startGame));
leaderboardBtn.addEventListener('click', () => {
  leaderboardDiv.style.display = "flex";
  loadLeaderboard();
});
setupLeaderboardClose();

// 🧠 Menu Background (fixe)
function drawMenuBackground() {
  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
}
function animateMenuBackground() {
  if (gameStarted) return;
  drawMenuBackground();
  requestAnimationFrame(animateMenuBackground);
}
animateMenuBackground();

// 🚀 Start Game
function startGame() {
  gameStarted = true;
  menuMode = false;
  score = 0;
  lives = gameSettings.lives;
  level = 1;
  obstacles = [];
  boss = { x: Math.random() * canvas.width, y: -100, width: 40, height: 40 };
  player = { x: canvas.width / 2 - 25, y: canvas.height - 100, width: 50, height: 50 };
  bgY = 0;

  paramPanel.style.display = 'none';
  pauseBtn.style.display = 'block';

  if (gameSettings.musicOn) {
    sounds.music.currentTime = 0;
    sounds.music.play().catch(() => {});
  }

  requestAnimationFrame(gameLoop);
}

// 🎮 Game Loop
function gameLoop() {
  if (!gameStarted || gamePaused) return;

  bgY += gameSettings.gameSpeed / 2;
  if (bgY >= canvas.height) bgY = 0;
  drawGameBackground();

  if (keys['ArrowLeft'] && player.x > 0) player.x -= gameSettings.gameSpeed;
  if (keys['ArrowRight'] && player.x + player.width < canvas.width) player.x += gameSettings.gameSpeed;

  ctx.fillStyle = "#0ff";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  moveBoss();

  if (Math.random() * 100 < gameSettings.spawnRate / 20) {
    obstacles.push({ x: Math.random() * (canvas.width - 30), y: -30, width: 30, height: 30 });
  }

  obstacles.forEach((o, i) => {
    o.y += gameSettings.gameSpeed;
    ctx.fillStyle = "#f00";
    ctx.fillRect(o.x, o.y, o.width, o.height);

    if (player.x < o.x + o.width &&
        player.x + player.width > o.x &&
        player.y < o.y + o.height &&
        player.y + player.height > o.y) {
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

// 🎨 Background
function drawGameBackground() {
  ctx.drawImage(backgroundImg, 0, bgY - canvas.height, canvas.width, canvas.height);
  ctx.drawImage(backgroundImg, 0, bgY, canvas.width, canvas.height);
}

// 🆙 Level
function updateLevel() {
  const newLevel = Math.floor(score / 1000) + 1;
  if (newLevel > level) {
    level = newLevel;
    gameSettings.gameSpeed += 0.3;
    gameSettings.spawnRate += 1;
    if (gameSettings.fxOn) sounds.levelup.play();
  }
}

// 👾 Boss IA
function moveBoss() {
  const bossSpeed = 0.6 + level * 0.1;
  if (player.x < boss.x - 10) boss.x -= bossSpeed;
  if (player.x > boss.x + 10) boss.x += bossSpeed;
  boss.y += 0.5;

  ctx.fillStyle = "#ff0";
  ctx.fillRect(boss.x, boss.y, boss.width, boss.height);

  if (
    player.x < boss.x + boss.width &&
    player.x + player.width > boss.x &&
    player.y < boss.y + boss.height &&
    player.y + player.height > boss.y
  ) {
    lives--;
    boss.y = -100;
  }

  if (boss.y > canvas.height) boss.y = -100;
}

// ⏳ Countdown
function animateCountdown(num, callback) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;top:0;left:0;width:100%;height:100%;
    background:rgba(0,0,0,0.8);color:#0ff;font-size:100px;
    display:flex;align-items:center;justify-content:center;z-index:1000;
  `;
  document.body.appendChild(overlay);
    let count = num;
  overlay.textContent = count;
  const interval = setInterval(() => {
    count--;
    overlay.textContent = count > 0 ? count : 'GO!';
    if (count < 0) {
      clearInterval(interval);
      overlay.remove();
      callback();
    }
  }, 1000);
}

// ⏸ Pause
function togglePause() {
  gamePaused = !gamePaused;
  pauseBtn.textContent = gamePaused ? "Reprendre" : "Pause";
  if (!gamePaused) requestAnimationFrame(gameLoop);
}

// 📊 Stats
function showStats() {
  gamePaused = true;
  statsPanel.style.display = 'flex';
  const stats = JSON.parse(localStorage.getItem('gameStats')) || {
    highScore: 0,
    totalPlays: 0,
    lastScore: 0,
    maxLevel: 0
  };
  statsContent.innerHTML = `
    <p>Score actuel: ${score}</p>
    <p>Meilleur score: ${stats.highScore}</p>
    <p>Niveau max atteint: ${stats.maxLevel}</p>
    <p>Parties jouées: ${stats.totalPlays}</p>
  `;
}

function hideStats() {
  statsPanel.style.display = 'none';
  gamePaused = false;
  requestAnimationFrame(gameLoop);
}

// 🧨 Fin du jeu
function endGame() {
  gameStarted = false;
  menuMode = true;
  paramPanel.style.display = 'flex';
  pauseBtn.style.display = 'none';
  if (gameSettings.fxOn) sounds.gameover.play();
  if (gameSettings.musicOn) sounds.music.pause();

  updateLocalStats();
  if (auth.currentUser) saveScore(score);

  animateMenuBackground();
}

// 💾 Sauvegarde locale
function updateLocalStats() {
  const stats = JSON.parse(localStorage.getItem('gameStats')) || {
    highScore: 0,
    totalPlays: 0,
    lastScore: 0,
    maxLevel: 0
  };
  stats.lastScore = score;
  stats.highScore = Math.max(stats.highScore, score);
  stats.totalPlays += 1;
  stats.maxLevel = Math.max(stats.maxLevel, level);
  localStorage.setItem('gameStats', JSON.stringify(stats));
}
