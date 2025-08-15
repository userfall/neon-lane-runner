// game.js
import { saveScore, loadLeaderboard, setupLeaderboardClose } from './leaderboard.js';
import { gameSettings, loadSettings } from './settings.js';

// ====== SONS ======
const sounds = {
    hit: new Audio('./assets/sounds/hit.wav'),
    music: new Audio('./assets/sounds/music.mp3'),
    gameover: new Audio('./assets/sounds/gameover.wav'),
    levelup: new Audio('./assets/sounds/levelup.wav')
};
sounds.music.loop = true;
sounds.music.volume = 0.5;

// ====== CANVAS ======
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ====== FOND ======
const backgroundImg = new Image();
backgroundImg.src = './assets/images/background.png';
let bgY = 0;

// ====== HUD ======
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

let player, obstacles, boss;
let score = 0, lives = 3, level = 1;
let keys = {};
let gameStarted = false;

// ====== CONTROLES ======
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// ====== START BUTTON ======
startBtn.addEventListener('click', startGame);

// ====== MUSIC / FX TOGGLE ======
musicToggle.addEventListener('click', () => {
    gameSettings.musicOn = !gameSettings.musicOn;
    musicToggle.textContent = gameSettings.musicOn ? "Musique ON" : "Musique OFF";
    if (gameSettings.musicOn && !gameStarted) fadeInMusic();
    else fadeOutMusic();
});

fxToggle.addEventListener('click', () => {
    gameSettings.fxOn = !gameSettings.fxOn;
    fxToggle.textContent = gameSettings.fxOn ? "FX ON" : "FX OFF";
});

// ====== LEADERBOARD ======
showLeaderboardBtn.addEventListener('click', async () => {
    await loadLeaderboard();
});
setupLeaderboardClose();

// ====== REPLAY ======
replayBtn.addEventListener('click', () => {
    victoryOverlay.style.display = 'none';
    startGame();
});

// ====== INIT ======
window.addEventListener('load', async () => {
    await loadSettings();
    lives = gameSettings.lives;
    drawBackground();
    if (gameSettings.musicOn) fadeInMusic();
});
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ====== MUSIC FADE ======
function fadeInMusic() {
    if (sounds.music.paused) sounds.music.play();
    sounds.music.volume = 0;
    let vol = 0;
    const fade = setInterval(() => {
        vol += 0.05;
        if (vol >= 0.5) {
            sounds.music.volume = 0.5;
            clearInterval(fade);
        } else sounds.music.volume = vol;
    }, 100);
}
function fadeOutMusic() {
    let vol = sounds.music.volume;
    const fade = setInterval(() => {
        vol -= 0.05;
        if (vol <= 0) {
            sounds.music.pause();
            sounds.music.volume = 0.5;
            clearInterval(fade);
        } else sounds.music.volume = vol;
    }, 100);
}

// ====== START GAME ======
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

// ====== COUNTDOWN ======
function animateCountdown(num, callback) {
    const overlay = document.createElement('div');
    overlay.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);color:#0ff;font-size:100px;display:flex;align-items:center;justify-content:center;z-index:1000;";
    document.body.appendChild(overlay);
    let count = num;
    overlay.textContent = count;
    const interval = setInterval(() => {
        count--;
        if (count > 0) overlay.textContent = count;
        else {
            clearInterval(interval);
            overlay.remove();
            callback();
        }
    }, 1000);
}

// ====== GAME LOOP ======
function gameLoop() {
    if (!gameStarted) return;

    // Fond défilant
    bgY += gameSettings.gameSpeed / 2;
    if (bgY >= canvas.height) bgY = 0;
    drawBackground();

    // Déplacement joueur
    if (keys['ArrowLeft'] && player.x > 0) player.x -= gameSettings.gameSpeed;
    if (keys['ArrowRight'] && player.x + player.width < canvas.width) player.x += gameSettings.gameSpeed;

    // Dessin joueur
    ctx.fillStyle = "#0ff";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Boss IA
    moveBoss();

    // Obstacles
    if (Math.random() * 100 < gameSettings.spawnRate / 10) {
        obstacles.push({ x: Math.random() * (canvas.width - 30), y: -30, width: 30, height: 30 });
    }

    obstacles.forEach((o, i) => {
        o.y += gameSettings.gameSpeed;
        ctx.fillStyle = "#f00";
        ctx.fillRect(o.x, o.y, o.width, o.height);

        // Collision
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

// ====== DRAW BACKGROUND ======
function drawBackground() {
    ctx.drawImage(backgroundImg, 0, bgY - canvas.height, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, 0, bgY, canvas.width, canvas.height);
}

// ====== BOSS ======
function moveBoss() {
    if (player.x < boss.x) boss.x -= 2;
    if (player.x > boss.x) boss.x += 2;
    boss.y += 1;
    ctx.fillStyle = "#ff0";
    ctx.fillRect(boss.x, boss.y, boss.width, boss.height);

    // Collision avec joueur
    if (player.x < boss.x + boss.width && player.x + player.width > boss.x &&
        player.y < boss.y + boss.height && player.y + player.height > boss.y) {
        lives--;
        boss.y = -100;
    }

    if (boss.y > canvas.height) boss.y = -100;
}

// ====== LEVEL ======
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
    const overlay = document.createElement('div');
    overlay.textContent = "Niveau " + level;
    overlay.style.cssText = "position:absolute;top:40%;left:50%;transform:translate(-50%,-50%);color:#0f0;font-size:60px;z-index:1000;";
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 1500);
}

// ====== END GAME ======
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

// ====== FIREWORKS ======
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
