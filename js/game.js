// 🧨 Fin du jeu
function endGame() {
  gameStarted = false;
  paramPanel.style.display = 'flex';
  if (gameSettings.fxOn) sounds.gameover.play();
  if (gameSettings.musicOn) sounds.music.pause();

  alert("Game Over ! Score: " + score);

  if (score >= 2000) {
    victoryOverlay.style.display = 'flex';
    launchFireworks();
  }

  updateLocalStats();
  gameSettings.gameSpeed = 3;
  gameSettings.spawnRate = 40;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
}

// 🎨 Fond défilant
function drawBackground() {
  ctx.drawImage(backgroundImg, 0, bgY - canvas.height, canvas.width, canvas.height);
  ctx.drawImage(backgroundImg, 0, bgY, canvas.width, canvas.height);
}

// 👾 Boss IA — suit le joueur lentement, évitable
function moveBoss() {
  const bossSpeed = 1 + Math.floor(score / 450); // augmente tous les 450 pts
  if (player.x < boss.x) boss.x -= bossSpeed;
  if (player.x > boss.x) boss.x += bossSpeed;
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
