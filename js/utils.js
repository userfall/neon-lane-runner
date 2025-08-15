// Gestion simple des sons
export function playSound(name) {
    const audioMap = {
        hit: new Audio('./assets/sounds/hit.wav'),
        gameover: new Audio('./assets/sounds/gameover.wav')
    };
    if(audioMap[name]) {
        audioMap[name].currentTime = 0; // reset pour rejouer rapidement
        audioMap[name].play();
    }
}

// Animation fade in / fade out pour messages (ex: admin)
export function showMessage(msg, color='#0ff', duration=2000) {
    const div = document.createElement('div');
    div.textContent = msg;
    div.style.cssText = `
        position:fixed;
        top:20px;
        left:50%;
        transform:translateX(-50%);
        background:rgba(0,0,0,0.8);
        color:${color};
        padding:10px 20px;
        border-radius:10px;
        font-family:'Orbitron',sans-serif;
        font-size:20px;
        opacity:0;
        transition:opacity 0.5s;
        z-index:2000;
    `;
    document.body.appendChild(div);
    // fade in
    setTimeout(()=> div.style.opacity = 1, 10);
    // fade out et suppression
    setTimeout(()=>{
        div.style.opacity = 0;
        setTimeout(()=> div.remove(), 500);
    }, duration);
}
