// ========================
// NEON LANE RUNNER - GAME.JS
// By Kabir
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
    coin: new Audio('./assets/sounds/coin.wav')
};
sounds.music.loop = true;
sounds.music.volume = 0.5;

// 📸 Fond
const backgroundImg = new Image();
backgroundImg.src = './assets/images/background.png';
let bgY = 0;

// 🧠 HUD & DOM
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
const leaderboardDiv = document.getElementById('leaderboardDiv');

// 🧩 Variables
let player, obstacles, boss;
let score = 0, lives = gameSettings.lives || 3, level = 1;
let keys = {};
let gameStarted = false;
let fireworksLaunched = false;
let gamePaused = false;

// 🔹 Auth check
onAuthStateChanged(auth, user => {
    if (!user) {
        alert("Vous devez être connecté pour jouer !");
        window.location.href = "index.html";
    }
});

// 🔹 Contrôles clavier
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// 🔹 Contrôles tactiles
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

// 🔹 Boutons
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
    toggleStats();
});
replayBtn.addEventListener('click', () => {
    victoryOverlay.style.display = 'none';
    startGame();
});
pauseBtn.addEventListener('click', () => {
    togglePause();
});
resumeBtn.addEventListener('click', () => {
    togglePause(false);
});
leaderboardBtn.addEventListener('click', () => {
    leaderboardDiv.style.display = "flex";
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
// GAME LOOP
// ========================
function gameLoop() {
    if (!gameStarted || gamePaused) return;

    bgY += gameSettings.gameSpeed / 2;
    if (bgY >= canvas.height) bgY = 0;
    drawBackground();

    // Player movement
    if (keys['ArrowLeft'] && player.x > 0) player.x -= gameSettings.gameSpeed;
    if (keys['ArrowRight'] && player.x + player.width < canvas.width) player.x += gameSettings.gameSpeed;

    // Draw player
    ctx.fillStyle = "#0ff";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    moveBoss();

    // Obstacles
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

    if (auth.currentUser) {
        saveScore(score).then(() => console.log("Score sauvegardé sur Firebase !"))
            .catch(err => console.error(err));
    }

    gameSettings.gameSpeed = 2.5;
    gameSettings.spawnRate = 25;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
}

// ========================
// UPDATE LOCAL STATS
// ========================
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

    if (statsPanel.style.display !== 'none') {
        statsPanel.innerHTML = `
            <p>Score actuel: ${score}</p>
            <p>Meilleur score: ${stats.highScore}</p>
            <p>Niveau max atteint: ${stats.maxLevel}</p>
            <p>Parties jouées: ${stats.totalPlays}</p>
            <button id="closeStatsBtn">Retour</button>
        `;
        document.getElementById('closeStatsBtn').addEventListener('click', toggleStats);
    }
}

// ========================
// STATS PANEL TOGGLE
// ========================
function toggleStats() {
    if (statsPanel.style.display === 'none') {
        statsPanel.style.display = 'block';
        gamePaused = true;
        pauseOverlay.style.display = 'flex';
        updateLocalStats();
    } else {
        statsPanel.style.display = 'none';
        pauseOverlay.style.display = 'none';
        gamePaused = false;
        if (gameStarted) requestAnimationFrame(gameLoop);
    }
}

// ========================
// PAUSE
// ========================
function togglePause(forceState) {
    gamePaused = typeof forceState === 'boolean' ? forceState : !gamePaused;
    pauseOverlay.style.display = gamePaused ? 'flex' : 'none';
    pauseBtn.textContent = gamePaused ? "Reprendre" : "Pause";
    if (!gamePaused && gameStarted) requestAnimationFrame(gameLoop);
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

    if (player.x < boss.x + boss.width &&
        player.x + player.width > boss.x &&
        player.y < boss.y + boss.height &&
        player.y + player.height > boss.y) {
        lives--;
        if (gameSettings.fxOn) sounds.hit.play();
        boss.y = -100;
    }

    if (boss.y > canvas.height) boss.y = -100;
}

// ========================
// LEVEL / SCORE
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
