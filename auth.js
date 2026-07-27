import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const EMAILS_PERMITIDOS = {
    "ferraza865@gmail.com": "Anderson",
    "adangones55@gmail.com": "TI",
    "mariabonita7830@gmail.com": "Maria Bonita"
};

export let operadorAtual = "";

export function initAuth(onSuccess) {
    const formLogin = document.getElementById('formLogin');
    
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('loginEmail').value.trim().toLowerCase();
            const senha = document.getElementById('loginSenha').value;
            const errDiv = document.getElementById('loginError');
            
            if (errDiv) errDiv.innerText = "";

            // Verifica permissão no objeto local
            if (!EMAILS_PERMITIDOS[emailInput]) {
                if (errDiv) errDiv.innerText = "E-mail não possui permissão de acesso ao sistema.";
                alert("Acesso negado: E-mail não cadastrado na lista de permissões.");
                return;
            }

            try {
                await signInWithEmailAndPassword(auth, emailInput, senha);
            } catch (err) {
                console.error("Erro Firebase:", err);
                if (errDiv) errDiv.innerText = "Erro na autenticação: " + err.message;
                alert("Erro ao entrar: " + err.message);
            }
        });
    }

    onAuthStateChanged(auth, (user) => {
        if (user && user.email && EMAILS_PERMITIDOS[user.email.toLowerCase()]) {
            operadorAtual = EMAILS_PERMITIDOS[user.email.toLowerCase()];
            
            const elOperador = document.getElementById('nomeOperador');
            if (elOperador) elOperador.innerText = operadorAtual;
            
            const overlay = document.getElementById('login-overlay');
            if (overlay) overlay.style.display = 'none';
            
            const app = document.getElementById('app');
            if (app) app.style.display = 'flex';
            
            const reservaSdr = document.getElementById('reservaSdr');
            if (reservaSdr) reservaSdr.value = operadorAtual;
            
            if (onSuccess) onSuccess();
        } else {
            if (user) signOut(auth);
            
            const overlay = document.getElementById('login-overlay');
            if (overlay) overlay.style.display = 'flex';
            
            const app = document.getElementById('app');
            if (app) app.style.display = 'none';
        }
    });
}

// Forma correta de expor a função para o HTML
window.fazerLogout = function() {
    signOut(auth);
};
