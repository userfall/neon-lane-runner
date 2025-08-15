import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

export async function loginUser() {
    const name = document.getElementById('loginName').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    if (!name || !password) throw new Error("Veuillez remplir tous les champs.");

    // On utilise le pseudo comme email factice pour Firebase
    const email = `${name}@neon.com`;

    try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        return userCred.user;
    } catch (err) {
        if(err.code === 'auth/user-not-found') throw new Error("Pseudo introuvable.");
        if(err.code === 'auth/wrong-password') throw new Error("Mot de passe incorrect.");
        throw new Error("Erreur lors de la connexion.");
    }
}

export async function signupUser() {
    const name = document.getElementById('signupName').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    if (!name || !password) throw new Error("Veuillez remplir tous les champs.");

    const email = `${name}@neon.com`; // Email factice pour Firebase

    try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: name });
    } catch (err) {
        if(err.code === 'auth/email-already-in-use') throw new Error("Pseudo déjà utilisé.");
        throw new Error("Erreur lors de l'inscription.");
    }
}
