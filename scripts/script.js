import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-analytics.js";
import { 
    getFirestore, 
    doc,
    setDoc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA5KhImgYAU6N2XvMGWmRpwAm7OdL7fUPw",
    authDomain: "kartbot-p8.firebaseapp.com",
    projectId: "kartbot-p8",
    storageBucket: "kartbot-p8.firebasestorage.app",
    messagingSenderId: "690039481723",
    appId: "1:690039481723:web:5ade1de5734bae9a1cc9de",
    measurementId: "G-6KPVPKKR9L"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

/* =========================
   UTILISATEUR CONNECTÉ UI
========================= */

const user = localStorage.getItem("user");
const userName = document.getElementById("userName");

if(userName){
    userName.textContent = user || "";
}

/* =========================
   AFFICHAGE LOGIN / PROFIL
========================= */

const loginSection = document.getElementById("loginSection");
const userSection = document.getElementById("userSection");
const profileName = document.getElementById("profileName");

if(loginSection && userSection){
    if(user){
        loginSection.style.display = "none";
        userSection.style.display = "flex";

        if(profileName){
            profileName.textContent = user;
        }
    } else {
        loginSection.style.display = "flex";
        userSection.style.display = "none";
    }
}

/* =========================
   INSCRIPTION
========================= */

const registerForm = document.getElementById("registerForm");

if(registerForm){
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const login = document.getElementById("login").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if(password !== confirmPassword){
            alert("Les mots de passe ne correspondent pas");
            return;
        }

        if(password.length<6){
            alert("Le mot de passe doit avoir 6 caractères au minimum");
            return;
        }

        try {
            const userRef = doc(db, "users", login);
            const userSnap = await getDoc(userRef);

            if(userSnap.exists()){
                alert("Ce login existe déjà");
                return;
            }

            const hashedPassword = await hashPassword(password);

            await setDoc(userRef, {
                collisions: 0,
                meilleurTemps: "00:00",
                password: hashedPassword,
                pseudo: login,
                totalTours: 0
            });

            alert("Utilisateur créé !");
            window.location.href = "connexion.html";

        } catch (error) {
            console.error(error);
            alert("Erreur inscription");
        }
    });
}

/* =========================
   CONNEXION
========================= */

const loginForm = document.getElementById("loginForm");

if(loginForm){
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const login = document.getElementById("log").value;
        const password = document.getElementById("pwd").value;

        try {
            const userRef = doc(db, "users", login);
            const userSnap = await getDoc(userRef);

            if(!userSnap.exists()){
                alert("Login incorrect");
                return;
            }

            const userData = userSnap.data();
            const hashedPassword = await hashPassword(password);

            if(userData.password === hashedPassword){
                localStorage.setItem("user", login);
                alert("Connexion réussie");
                window.location.href = "../index.html";
            } else {
                alert("Mot de passe incorrect");
            }

        } catch (error) {
            console.error(error);
            alert("Erreur connexion");
        }
    });
}

/* =========================
   DECONNEXION
========================= */

document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("user");
    location.reload();
});

/* =========================
   CHANGEMENT MOT DE PASSE
========================= */

document.getElementById("changePasswordForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const oldPwd = document.getElementById("oldPwd").value;
    const newPwd = document.getElementById("newPwd").value;
    const confirmNewPwd = document.getElementById("confirmNewPwd").value;

    const login = localStorage.getItem("user");

    if(!login) return;

    if(newPwd !== confirmNewPwd){
        alert("Les mots de passe ne correspondent pas");
        return;
    }

    if(password.length < 6){
        alert("Le mot de passe doit avoir 6 caractères au minimum");
        return;
    }

    try {
        const userRef = doc(db, "users", login);
        const userSnap = await getDoc(userRef);

        if(!userSnap.exists()){
            alert("Utilisateur introuvable");
            return;
        }

        const userData = userSnap.data();
        const hashedOldPwd = await hashPassword(oldPwd);

        if(userData.password !== hashedOldPwd){
            alert("Ancien mot de passe incorrect");
            return;
        }

        const hashedNewPwd = await hashPassword(newPwd);

        await updateDoc(userRef, {
            password: hashedNewPwd
        });

        alert("Mot de passe modifié");
        document.getElementById("changePasswordForm").reset();

    } catch (error) {
        console.error(error);
        alert("Erreur changement mot de passe");
    }
});

/* =========================
   HASH PASSWORD (SHA-256)
========================= */

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    //return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return password
}