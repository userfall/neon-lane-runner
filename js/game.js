import { gameSettings, loadSettings } from './settings.js';
import { saveScore, loadLeaderboard, setupLeaderboardClose } from './leaderboard.js';
import { auth } from './firebase-config.js';

// 🔹 Favicon
const link = document.createElement('link');
link.rel = 'icon';
link.type = 'image/x-icon';
link.href = 'assets/images/favicon.ico';
document.head.appendChild(link);

// 🎮 CANVAS
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- resize canvas ---
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 🎵 Sons
const sounds = {
  hit: new Audio('./assets/sounds/hit.wav'),
  music: new Audio('./assets/sounds/music.mp3'),
  gameover: new Audio('./assets/sounds/gameover.wav'),
  levelup: new Audio('./assets/sounds/levelup.wav'),
  coin: new Audio('./assets/sounds/coin.wav'),
  powerup: new Audio('./assets/sounds/powerup.wav')
};
sounds.music.loop = true;
sounds.music.volume = 0.5;

// 📸 Fond
const backgroundImg = new Image();
backgroundImg.src = './assets/images/background.png';
let bgY = 0;

// 🧠 HUD
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const startBtn = document.getElementById('startBtn');
const musicToggle = document.getElementById('musicToggle');
const fxToggle = document.getElementById('fxToggle');
const statsBtn = document.getElementById('statsBtn');
const paramPanel = document.getElementById('paramPanel');
const victoryOverlay = document.getElementById('victoryOverlay');
const replayBtn = document.getElementById('replayBtn');
const fireworksCanvas = document.getElementById('fireworksCanvas');
const statsPanel = document.getElementById('statsPanel');
const pauseBtn = document.getElementById('pauseBtn');
const pauseOverlay = document.getElementById('pauseOverlay');
const resumeBtn = document.getElementById('resumeBtn');
const leaderboardBtn = document.getElementById('leaderboardBtn');

// 🧩 Variables
let player, obstacles, boss;
let score = 0, lives = gameSettings.lives || 3, level = 1;
let keys = {};
let gameStarted = false;
let fireworksLaunched = false;
let gamePaused = false;

// 🎮 Contrôles clavier
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// 📱 Contrôles tactiles
canvas.addEventListener('touchstart', e => {
  if (!e.touches.length) return;
  const touchX = e.touches[0].clientX;
  const middle = canvas.width / 2;
  keys[touchX < middle ? 'ArrowLeft' : 'ArrowRight'] = true;
});
canvas.addEventListener('touchend', () => {
  keys['ArrowLeft'] = false;
  keys['ArrowRight'] = false;
});

// 🟢 Événements boutons
startBtn.addEventListener('click', startGame);
musicToggle.addEventListener('click', () => {
  gameSettings.musicOn = !gameSettings.musicOn;
  musicToggle.textContent = gameSettings.musicOn ? "Musique ON" : "Musique OFF";
  gameSettings.musicOn ? sounds.music.play() : sounds.music.pause();
});
fxToggle.addEventListener('click', () => {
  gameSettings.fxOn = !gameSettings.fxOn;
  fxToggle.textContent = gameSettings.fxOn ? "FX ON" : "FX OFF";
});
statsBtn.addEventListener('click', () => {
  statsPanel.style.display = statsPanel.style.display === "none" ? "block" : "none";
});
replayBtn.addEventListener('click', () => {
  victoryOverlay.style.display = 'none';
  startGame();
});
pauseBtn.addEventListener('click', () => {
  gamePaused = !gamePaused;
  pauseBtn.textContent = gamePaused ? "Reprendre" : "Pause";
  pauseOverlay.style.display = gamePaused ? "flex" : "none";
  if (!gamePaused && gameStarted) requestAnimationFrame(gameLoop);
});
resumeBtn.addEventListener('click', () => {
  gamePaused = false;
  pauseOverlay.style.display = "none";
  pauseBtn.textContent = "Pause";
  requestAnimationFrame(gameLoop);
});
leaderboardBtn.addEventListener('click', () => {
  document.getElementById("leaderboardDiv").style.display = "block";
  loadLeaderboard();
});
setupLeaderboardClose();

// ========================
// START GAME
// ========================
function startGame() {
  gameStarted = true;
  score = 0;
  level = 1;
  lives = gameSettings.lives || 3;
  gameSettings.gameSpeed = 2.5;
  gameSettings.spawnRate = 25;
  fireworksLaunched = false;
  gamePaused = false;
  obstacles = [];
  player = { x: canvas.width / 2 - 25, y: canvas.height - 100, width: 50, height: 50 };
  boss = { x: Math.random() * canvas.width, y: -100, width: 40, height: 40 };
  bgY = 0;
  paramPanel.style.display = 'none';
  pauseBtn.style.display = 'block';
  pauseOverlay.style.display = 'none';

  if (gameSettings.musicOn) {
    sounds.music.currentTime = 0;
    sounds.music.play();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  updateLocalStats();
  animateCountdown(3, () => requestAnimationFrame(gameLoop));
}

// ========================
// UPDATE STATS
// ========================
function updateLocalStats() {
  let played = Number(localStorage.getItem("gamesPlayed")) || 0;
  localStorage.setItem("gamesPlayed", played + 1);

  let best = Number(localStorage.getItem("bestScore")) || 0;
  if (score > best) {
    localStorage.setItem("bestScore", score);
    best = score;
    showNewRecord(score);
  }

  document.getElementById("gamesPlayed").textContent = played + 1;
  document.getElementById("bestScore").textContent = best;
}

// ========================
// SHOW NEW RECORD
// ========================
function showNewRecord(score) {
  if (!gameSettings.fxOn) return;
  sounds.levelup.play();
  const overlay = document.createElement('div');
  overlay.textContent = `🏆 Nouveau record : ${score} pts !`;
  overlay.style.cssText = `
    position:absolute;top:30%;left:50%;transform:translate(-50%,-50%);
    background:#222;color:#ff0;font-size:32px;padding:20px 30px;border-radius:12px;
    box-shadow:0 0 20px #ff0;z-index:1000;animation: pulse 1s infinite;
  `;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 4000);
}

// ========================
// GAME LOOP
// ========================
function gameLoop() {
  if (!gameStarted || gamePaused) return;

  bgY += gameSettings.gameSpeed / 2;
  if (bgY >= canvas.height) bgY = 0;
  drawBackground();

  // Mouvement joueur
  if (keys['ArrowLeft'] && player.x > 0) player.x -= gameSettings.gameSpeed;
  if (keys['ArrowRight'] && player.x + player.width < canvas.width) player.x += gameSettings.gameSpeed;

  // Dessiner joueur
  ctx.fillStyle = "#0ff";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  moveBoss();

  // Spawn obstacles
  if (Math.random() * 100 < gameSettings.spawnRate / 20) {
    obstacles.push({ x: Math.random() * (canvas.width - 30), y: -30, width: 30, height: 30 });
  }

  obstacles.forEach((o, i) => {
    o.y += gameSettings.gameSpeed;
    ctx.fillStyle = "#f00";
    ctx.fillRect(o.x, o.y, o.width, o.height);

    // Collision
    if (
      player.x < o.x + o.width &&
      player.x + player.width > o.x &&
      player.y < o.y + o.height &&
      player.y + player.height > o.y
    ) {
      obstacles.splice(i, 1);
      lives--;
      if (gameSettings.fxOn) sounds.hit.play();
    }
    if (o.y > canvas.height) obstacles.splice(i, 1);
  });

  // Score & HUD
  score++;
  scoreEl.textContent = "Score: " + score;
  livesEl.textContent = "Vies: " + lives;

  updateLevel();

  if (lives <= 0) endGame();
  else requestAnimationFrame(gameLoop);
}

// ========================
// UPDATE LEVEL
// ========================
function updateLevel() {
  if (score % 600 === 0 && score !== 0) {
    level++;
    gameSettings.gameSpeed += 0.5;
    gameSettings.spawnRate += 5;
    if (gameSettings.fxOn) sounds.levelup.play();
    showLevelUp(level);
  }
}

function showLevelUp(level) {
  const overlay = document.createElement('div');
  overlay.textContent = "Niveau " + level;
  overlay.style.cssText = `
    position:absolute;top:40%;left:50%;transform:translate(-50%,-50%);
    color:#0f0;font-size:60px;z-index:1000;text-shadow:0 0 20px #0f0;
  `;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 1500);
}

// ========================
// END GAME
// ========================
function endGame() {
  gameStarted = false;
  paramPanel.style.display = 'flex';
  pauseBtn.style.display = 'none';
  pauseOverlay.style.display = 'none';
  if (gameSettings.fxOn) sounds.gameover.play();
  if (gameSettings.musicOn) sounds.music.pause();

  if (score >= 5000) showFireworksMessage();
  if (score >= 2000 && !fireworksLaunched) {
    fireworksLaunched = true;
    victoryOverlay.style.display = 'flex';
    launchFireworks();
  }

  updateLocalStats();

  // 🔹 Sauvegarde automatique du score dans Firebase
  if (auth.currentUser) saveScore(score);

  gameSettings.gameSpeed = 2.5;
  gameSettings.spawnRate = 25;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
}

// ========================
// BACKGROUND & BOSS
// ========================
function drawBackground() {
  ctx.drawImage(backgroundImg, 0, bgY - canvas.height, canvas.width, canvas.height);
  ctx.drawImage(backgroundImg, 0, bgY, canvas.width, canvas.height);
}

function moveBoss() {
  const bossSpeed = 0.8 + Math.floor(score / 600) * 0.2;
  if (player.x < boss.x - 10) boss.x -= bossSpeed;
  if (player.x > boss.x + 10) boss.x += bossSpeed;
  boss.y += 0.8;

  ctx.fillStyle = "#ff0";
  ctx.fillRect(boss.x, boss.y, boss.width, boss.height);

  if (
    player.x < boss.x + boss.width &&
    player.x + player.width > boss.x &&
    player.y < boss.y + boss.height &&
    player.y + player.height > boss.y
  ) {
    lives--;
    if (gameSettings.fxOn) sounds.hit.play();
    boss.y = -100;
  }

  if (boss.y > canvas.height) boss.y = -100;
}

// ========================
// FEUX D'ARTIFICE
// ========================
function launchFireworks() {
  const ctxF = fireworksCanvas.getContext('2d');
  fireworksCanvas.width = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;

  let particles = [];
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

  function animateFireworks() {
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
    particles = particles.filter(p => p.life > 0);
    if (particles.length > 0) requestAnimationFrame(animateFireworks);
  }

  animateFireworks();
}

function showFireworksMessage() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset:0; background: rgba(0,0,0,0.85);
    display:flex; flex-direction: column; align-items:center; justify-content:center;
    z-index:10000; animation: fadeIn 0.5s ease-out;
  `;

  const canvasMsg = document.createElement('canvas');
  canvasMsg.width = window.innerWidth;
  canvasMsg.height = window.innerHeight;
  canvasMsg.style.position = "absolute"; canvasMsg.style.top = "0"; canvasMsg.style.left = "0";
  overlay.appendChild(canvasMsg);

  const msg = document.createElement('div');
  msg.textContent = `🚀 Tu as explosé les 5000 points !`;
  msg.style.cssText = `
    color:#fff;font-size:36px;font-weight:bold;text-shadow:0 0 20px #0ff;
    z-index:10001; animation:pulse 1s infinite; margin-top:20px;
  `;
  overlay.appendChild(msg);
  document.body.appendChild(overlay);

  const ctxMsg = canvasMsg.getContext("2d");
  let particles = [];
  for (let i = 0; i < 120; i++) particles.push({
    x: canvasMsg.width/2, y: canvasMsg.height/2,
    dx: (Math.random()-0.5)*8, dy: (Math.random()-0.5)*8,
    radius: Math.random()*3+2,
    color: `hsl(${Math.random()*360},100%,50%)`, life:100
  });

  function animateFireworks() {
    ctxMsg.clearRect(0,0,canvasMsg.width,canvasMsg.height);
    particles.forEach(p=>{
      ctxMsg.beginPath();
      ctxMsg.arc(p.x,p.y,p.radius,0,Math.PI*2);
      ctxMsg.fillStyle=p.color;
      ctxMsg.fill();
      p.x+=p.dx; p.y+=p.dy; p.life--;
    });
    particles = particles.filter(p=>p.life>0);
    if(particles.length>0) requestAnimationFrame(animateFireworks);
  }
  animateFireworks();
  setTimeout(()=>overlay.remove(),4000);
}
