 import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const EMAILS_PERMITIDOS = {
    "ferraza865@gmail.com": "Anderson",
    "adangones55@gmail.com": "TI",
    "mariabonita7830@gmail.com": "Maria Bonita"
};

export let operadorAtual = "";

export function initAuth(onSuccess) {
    document.getElementById('formLogin').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim().toLowerCase();
        const senha = document.getElementById('loginSenha').value;
        const errDiv = document.getElementById('loginError');
        errDiv.innerText = "";

        if (!EMAILS_PERMITIDOS[email]) {
            errDiv.innerText = "E-mail não possui permissão de acesso ao sistema.";
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, senha);
        } catch (err) {
            errDiv.innerText = "Erro na autenticação: " + err.message;
        }
    });

    onAuthStateChanged(auth, (user) => {
        if (user && EMAILS_PERMITIDOS[user.email.toLowerCase()]) {
            operadorAtual = EMAILS_PERMITIDOS[user.email.toLowerCase()];
            document.getElementById('nomeOperador').innerText = operadorAtual;
            document.getElementById('login-overlay').style.display = 'none';
            document.getElementById('app').style.display = 'flex';
            if (document.getElementById('reservaSdr')) {
                document.getElementById('reservaSdr').value = operadorAtual;
            }
            if(onSuccess) onSuccess();
        } else {
            if (user) signOut(auth);
            document.getElementById('login-overlay').style.display = 'flex';
            document.getElementById('app').style.display = 'none';
        }
    });
}

export window.fazerLogout = function() {
    signOut(auth);
};
