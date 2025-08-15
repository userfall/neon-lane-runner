import { updateSettings } from './settings.js';
import { db } from './firebase-config.js';
import { collection, query, orderBy, limit, onSnapshot, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

const message = document.getElementById('adminMessage');
const table = document.getElementById('scoresTable');

const showMessage = (text, isError=false) => {
    message.textContent = text;
    message.style.color = isError ? "#f00" : "#0ff";
    setTimeout(()=>{ message.textContent=""; },3000);
};

document.getElementById('startCompBtn').addEventListener('click',()=>{
    updateSettings({competitionActive:true});
    showMessage("Compétition lancée !");
});
document.getElementById('stopCompBtn').addEventListener('click',()=>{
    updateSettings({competitionActive:false});
    showMessage("Compétition arrêtée !");
});
document.getElementById('saveParams').addEventListener('click', ()=>{
    const newSettings = {
        gameSpeed: parseInt(document.getElementById('speedSlider').value),
        spawnRate: parseInt(document.getElementById('spawnSlider').value),
        lives: parseInt(document.getElementById('livesInput').value),
        musicOn: document.getElementById('musicCheckbox').checked,
        fxOn: document.getElementById('fxCheckbox').checked
    };
    updateSettings(newSettings);
    showMessage("Paramètres sauvegardés !");
});

window.deleteScore = async(id)=>{
    try{
        await deleteDoc(doc(db,"scores",id));
        showMessage("Score supprimé !");
    }catch(err){ showMessage("Erreur: "+err.message,true);}
};

const listenLeaderboardAdmin = ()=>{
    const q = query(collection(db,"scores"),orderBy("score","desc"),limit(50));
    onSnapshot(q, snapshot=>{
        table.innerHTML="<tr><th>Utilisateur</th><th>Score</th><th>Action</th></tr>";
        snapshot.forEach(doc=>{
            const row=document.createElement('tr');
            row.innerHTML=`
            <td>${doc.data().user}</td>
            <td>${doc.data().score}</td>
            <td><button onclick="deleteScore('${doc.id}')">Supprimer</button></td>`;
            table.appendChild(row);
        });
    });
};

listenLeaderboardAdmin();
