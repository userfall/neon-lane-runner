// ========================
// NEON LANE RUNNER - GAME.JS
// By Kabir - Neon Games Corporation
// ========================

import { gameSettings } from './settings.js';
import { saveScore, loadLeaderboard, setupLeaderboardClose } from './leaderboard.js';
import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// 🎮 CANVAS
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

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

// 🧠 DOM
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
const rankingBoard = document.getElementById('rankingBoard');

// Variables
let player, obstacles, boss;
let score = 0, lives = gameSettings.lives || 3, level = 1;
let keys = {};
let gameStarted = false;
let fireworksLaunched = false;
let gamePaused = false;

// Auth check
onAuthStateChanged(auth, user => {
    if (!user) {
        alert("Vous devez être connecté pour jouer !");
        window.location.href = "index.html";
    }
});

// Contrôles clavier et tactile
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

// Boutons
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
    statsPanel.style.display = 'flex';
});
replayBtn.addEventListener('click', () => {
    victoryOverlay.style.display = 'none';
    startGame();
});
pauseBtn.addEventListener('click', togglePause);
resumeBtn.addEventListener('click', resumeGame);
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

    // Tout menu disparaît
    paramPanel.style.display = 'none';
    leaderboardBtn.style.display = 'none';
    pauseBtn.style.display = 'block';
    pauseOverlay.style.display = 'none';

    if (gameSettings.musicOn) {
        sounds.music.currentTime = 0;
        sounds.music.play();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    animateCountdown(3, () => requestAnimationFrame(gameLoop));
}

// ========================
// GAME LOOP
// ========================
function gameLoop() {
    if (!gameStarted || gamePaused) return;

    bgY += gameSettings.gameSpeed / 2;
    if (bgY >= canvas.height) bgY = 0;
    drawBackground();

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
        if (checkCollision(player, o)) {
            obstacles.splice(i, 1);
            lives--;
            if (gameSettings.fxOn) sounds.hit.play();
        }
        if (o.y > canvas.height) obstacles.splice(i, 1);
    });

    score++;
    updateLevel();

    if (lives <= 0) endGame();
    else requestAnimationFrame(gameLoop);
}

function checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// ========================
// END GAME
// ========================
function endGame() {
    gameStarted = false;
    pauseBtn.style.display = 'none';
    pauseOverlay.style.display = 'none';
    victoryOverlay.style.display = score >= 2000 ? 'flex' : 'none';
    if (gameSettings.fxOn) sounds.gameover.play();
    if (gameSettings.musicOn) sounds.music.pause();

    launchFireworks();

    if (auth.currentUser) saveScore(score).catch(err => console.error(err));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
}

// ========================
// LEVEL
// ========================
function updateLevel() {
    const newLevel = Math.floor(score / 1000) + 1;
    if (newLevel > level) {
        level = newLevel;
        gameSettings.gameSpeed += 0.3;
        gameSettings.spawnRate += 1;
        if (gameSettings.fxOn) sounds.levelup.play();
    }
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
    if (checkCollision(player, boss)) {
        lives--;
        if (gameSettings.fxOn) sounds.hit.play();
        boss.y = -100;
    }
    if (boss.y > canvas.height) boss.y = -100;
}

// ========================
// FIREWORKS
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
            color: `hsl(${Math.random() * 360},100%,50%)`,
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
        particles = particles.filter(p => p.life > 0);
        if (particles.length > 0) requestAnimationFrame(animate);
    }
    animate();
}

// ========================
// PAUSE / RESUME
// ========================
function togglePause() {
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? "Reprendre" : "Pause";
    pauseOverlay.style.display = gamePaused ? "flex" : "none";
    if (!gamePaused) requestAnimationFrame(gameLoop);
}
function resumeGame() {
    gamePaused = false;
    pauseOverlay.style.display = "none";
    pauseBtn.textContent = "Pause";
    requestAnimationFrame(gameLoop);
}

// ========================
// COUNTDOWN
// ========================
function animateCountdown(count, callback) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; inset:0; display:flex; justify-content:center; align-items:center;
        font-size: 80px; font-weight:bold; color:#0ff; text-shadow: 0 0 20px #0ff; background: rgba(0,0,0,0.7);
        z-index:10000;
    `;
    document.body.appendChild(overlay);

    let current = count;
    overlay.textContent = current;

    const interval = setInterval(() => {
        current--;
        if(current > 0) overlay.textContent = current;
        else {
            clearInterval(interval);
            document.body.removeChild(overlay);
            callback();
        }
    }, 1000);
}

// ========================
// DISPLAY STATS (avec retour)
// ========================
function displayStats() {
    gamePaused = true;
    statsPanel.style.display = 'flex';
    const stats = JSON.parse(localStorage.getItem('gameStats')) || {highScore:0, totalPlays:0};
    statsPanel.innerHTML = `
        <p>Meilleur score: ${stats.highScore}</p>
        <p>Parties jouées: ${stats.totalPlays}</p>
        <button id="closeStatsBtn">Retour au jeu</button>
    `;
    document.getElementById('closeStatsBtn').addEventListener('click', () => {
        statsPanel.style.display = 'none';
        gamePaused = false;
        if (gameStarted) requestAnimationFrame(gameLoop);
    });
}
