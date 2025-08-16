<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Neon Lane Runner - Kabir & Françoise</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/game.css" />
  <script type="module" src="js/settings.js"></script>
  <script type="module" src="js/game.js"></script>
</head>
<body>
  <!-- 🎮 Canvas principal -->
  <canvas id="gameCanvas"></canvas>

  <!-- 🧠 HUD -->
  <div id="hud">
    <div id="score">Score: 0</div>
    <div id="lives">Vies: 3</div>
  </div>

  <!-- ⚙️ Panneau de paramètres -->
  <div id="paramPanel">
    <button id="musicToggle">Musique ON</button>
    <button id="fxToggle">FX ON</button>
    <button id="statsBtn">Stats</button>
    <button id="startBtn">START</button>
  </div>

  <!-- ⏸️ Bouton Pause -->
  <button id="pauseBtn" style="display:none;">Pause</button>

  <!-- 🛑 Panneau Pause -->
  <div id="pauseOverlay" style="display:none;">
    <p>⏸️ Jeu en pause</p>
  </div>

  <!-- 📊 Panneau de stats -->
  <div id="statsPanel" style="display:none;">
    Parties jouées : <span id="gamesPlayed">0</span><br>
    Meilleur score : <span id="bestScore">0</span>
  </div>

  <!-- 🎉 Victoire -->
  <div id="victoryOverlay" style="display:none;">
    <canvas id="fireworksCanvas"></canvas>
    <p>🎉 Bravo ! Tu as atteint un score incroyable !</p>
    <button id="replayBtn">Rejouer</button>
  </div>
</body>
</html>
