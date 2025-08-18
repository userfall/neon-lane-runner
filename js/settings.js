export let gameSettings = {
    lives: 5,
    gameSpeed: 5,
    spawnRate: 20,
    musicOn: true,
    fxOn: true,
};

// Charger les settings depuis le localStorage (si existants)
export async function loadSettings() {
    const saved = localStorage.getItem('gameSettings');
    if (saved) {
        gameSettings = JSON.parse(saved);
    }
}

// Sauvegarder les settings
export function saveSettings() {
    localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
}
