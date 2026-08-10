// auth.js
import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { obterNomePorEmail, setOperadorAtual, operadorAtual } from "./users.js";
import { exibirErroLogin, atualizarInterfaceUsuarioLogado, atualizarInterfaceUsuarioDeslogado } from "./uiAuth.js";

export { operadorAtual };

export function initAuth(onSuccess) {
    const formLogin = document.getElementById('formLogin');

    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('loginEmail').value.trim().toLowerCase();
            const senha = document.getElementById('loginSenha').value;

            exibirErroLogin(""); // Limpa erros anteriores

            // Valida permissão prévia
            const nomeOperador = obterNomePorEmail(emailInput);
            if (!nomeOperador) {
                exibirErroLogin("Acesso negado: E-mail não cadastrado na lista de permissões.");
                return;
            }

            try {
                await signInWithEmailAndPassword(auth, emailInput, senha);
            } catch (err) {
                console.error("Erro Firebase:", err);
                exibirErroLogin("Erro na autenticação: " + err.message);
            }
        });
    }

    // Monitora estado do login
    onAuthStateChanged(auth, (user) => {
        const email = user?.email?.toLowerCase();
        const nomeOperador = email ? obterNomePorEmail(email) : null;

        if (user && nomeOperador) {
            setOperadorAtual(nomeOperador);
            atualizarInterfaceUsuarioLogado(nomeOperador);
            if (onSuccess) onSuccess();
        } else {
            if (user) signOut(auth); // Desloga se não tiver permissão
            atualizarInterfaceUsuarioDeslogado();
        }
    });
}

// Expõe logout global para eventos do HTML (ex: onclick="fazerLogout()")
window.fazerLogout = function() {
    signOut(auth);
};
