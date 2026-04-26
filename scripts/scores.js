import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, collection, getDocs } 
from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA5KhImgYAU6N2XvMGWmRpwAm7OdL7fUPw",
    authDomain: "kartbot-p8.firebaseapp.com",
    projectId: "kartbot-p8",
    storageBucket: "kartbot-p8.firebasestorage.app",
    messagingSenderId: "690039481723",
    appId: "1:690039481723:web:5ade1de5734bae9a1cc9de"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const container = document.getElementById("scoresContainer");

async function loadScores() {

    const snapshot = await getDocs(collection(db, "courses"));

    let data = [];

    snapshot.forEach(doc => {
        const d = doc.data();

        data.push({
            pseudo: d.pilote_pseudo,
            score: d.score_final || 0
        });
    });

    // tri décroissant
    data.sort((a, b) => b.score - a.score);

    container.innerHTML = "";

    let rank = 1;

    data.forEach(item => {

        const div = document.createElement("div");

        div.style.cssText = `
            display:flex;
            justify-content:space-between;
            padding:15px;
            margin-bottom:10px;
            background:rgba(255,255,255,0.1);
            border-radius:10px;
            color:white;
        `;

        div.innerHTML = `
            <span>#${rank}</span>
            <span>${item.pseudo}</span>
            <span>${item.score}</span>
        `;

        container.appendChild(div);
        rank++;
    });
}

loadScores();