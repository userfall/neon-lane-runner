import { db } from './firebase-config.js';
import { collection, addDoc, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

export async function saveScore(score) {
    try {
        const userName = sessionStorage.getItem('userName') || "Anonyme";
        await addDoc(collection(db, "leaderboard"), {
            user: userName,
            score: score,
            timestamp: new Date()
        });
    } catch (err) {
        console.error("Erreur sauvegarde score:", err);
    }
}

export async function loadLeaderboard() {
    const overlay = document.getElementById('leaderboardOverlay');
    const loader = document.getElementById('loader');
    const table = document.getElementById('leaderboardTable');

    if (!overlay || !loader || !table) {
        console.error("Les éléments du leaderboard n'existent pas dans le DOM !");
        return;
    }

    overlay.style.display = "flex";
    loader.style.display = "block";
    table.innerHTML = "";

    try {
        const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(10));
        const snapshot = await getDocs(q);

        table.innerHTML = "<tr><th>Nom</th><th>Score</th></tr>";
        snapshot.forEach(doc => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${doc.data().user}</td><td>${doc.data().score}</td>`;
            table.appendChild(row);
        });
    } catch (err) {
        table.innerHTML = `<tr><td colspan="2">Erreur chargement</td></tr>`;
        console.error(err);
    } finally {
        loader.style.display = "none";
    }
}

// Fermer le leaderboard
export function setupLeaderboardClose() {
    const closeBtn = document.getElementById('closeLeaderboardBtn');
    const overlay = document.getElementById('leaderboardOverlay');
    if (!closeBtn || !overlay) return;

    closeBtn.addEventListener('click', () => {
        overlay.style.display = "none";
    });
}
