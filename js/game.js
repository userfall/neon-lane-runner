// ========================
// NEON LANE RUNNER - GAME.JS
// By Kabir - Neon Games Corporation
// ========================

import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// 🎮 Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 🧩 HUD & DOM
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

// 🎵 Sons intégrés
const sounds = {
    music: new Audio('./assets/sounds/music.mp3'),
    hit: new Audio('./assets/sounds/hit.wav'),
    levelup: new Audio('./assets/sounds/levelup.wav'),
    gameover: new Audio('./assets/sounds/gameover.wav')
};
sounds.music.loop = true;
sounds.music.volume = 0.5;

// 🖼️ Fond
const backgroundImg = new Image();
backgroundImg.src = './assets/images/background.png';
let bgY = 0;

// 🔹 Variables de jeu
let player, obstacles;
let score = 0, lives = 3, level = 1;
let gameStarted = false;
let gamePaused = false;
let keys = {};
let gameSettings = {
    gameSpeed: 2.5,
    spawnRate: 25,
    musicOn: true,
    fxOn: true,
    lives: 3
};

// 🔹 Auth
onAuthStateChanged(auth, user => {
    if (!user) {
        alert("Vous devez être connecté pour jouer !");
        window.location.href = "index.html";
    }
});

// 🔹 Contrôles
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

// 🔹 Boutons
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
    showStats();
});
closeStatsBtn.addEventListener('click', () => {
    hideStats();
});

pauseBtn.addEventListener('click', () => togglePause());

startBtn.addEventListener('click', startGame);

// ========================
// START GAME
// ========================
function startGame() {
    gameStarted = true;
    score = 0;
    lives = gameSettings.lives;
    level = 1;
    obstacles = [];
    player = { x: canvas.width/2 - 25, y: canvas.height - 100, width: 50, height: 50 };
    bgY = 0;

    paramPanel.style.display = 'none';
    pauseBtn.style.display = 'block';

    if (gameSettings.musicOn) {
        sounds.music.currentTime = 0;
        sounds.music.play();
    }

    requestAnimationFrame(gameLoop);
}

// ========================
// GAME LOOP
// ========================
function gameLoop() {
    if (!gameStarted || gamePaused) return;

    // Fond
    bgY += gameSettings.gameSpeed / 2;
    if (bgY >= canvas.height) bgY = 0;
    drawBackground();

    // Joueur
    if (keys['ArrowLeft'] && player.x > 0) player.x -= gameSettings.gameSpeed;
    if (keys['ArrowRight'] && player.x + player.width < canvas.width) player.x += gameSettings.gameSpeed;

    ctx.fillStyle = "#0ff";
    ctx.fillRect(player.x, player.y, player.width, player.height);

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

    // HUD
    score++;
    scoreEl.textContent = "Score: " + score;
    livesEl.textContent = "Vies: " + lives;

    updateLevel();

    if (lives <= 0) endGame();
    else requestAnimationFrame(gameLoop);
}

// ========================
// BACKGROUND
// ========================
function drawBackground() {
    ctx.drawImage(backgroundImg, 0, bgY - canvas.height, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, 0, bgY, canvas.width, canvas.height);
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
// PAUSE
// ========================
function togglePause() {
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? "Reprendre" : "Pause";
    if (!gamePaused) requestAnimationFrame(gameLoop);
}

// ========================
// STATS
// ========================
function showStats() {
    gamePaused = true;
    statsPanel.style.display = 'flex';
    const stats = JSON.parse(localStorage.getItem('gameStats')) || {
        highScore: 0, totalPlays: 0, lastScore: 0, maxLevel: 0
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

// ========================
// END GAME
// ========================
function endGame() {
    gameStarted = false;
    paramPanel.style.display = 'flex';
    pauseBtn.style.display = 'none';
    if (gameSettings.fxOn) sounds.gameover.play();
    if (gameSettings.musicOn) sounds.music.pause();

    // Mise à jour stats locales
    updateLocalStats();
}

// ========================
// LOCAL STATS
// ========================
function updateLocalStats() {
    const stats = JSON.parse(localStorage.getItem('gameStats')) || {
        highScore: 0, totalPlays: 0, lastScore: 0, maxLevel: 0
    };
    stats.lastScore = score;
    stats.highScore = Math.max(stats.highScore, score);
    stats.totalPlays += 1;
    stats.maxLevel = Math.max(stats.maxLevel, level);
    localStorage.setItem('gameStats', JSON.stringify(stats));
}
