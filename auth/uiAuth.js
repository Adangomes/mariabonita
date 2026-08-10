// uiAuth.js
export function exibirErroLogin(mensagem) {
    const errDiv = document.getElementById('loginError');
    if (errDiv) errDiv.innerText = mensagem;
    if (mensagem) alert(mensagem);
}

export function atualizarInterfaceUsuarioLogado(nomeOperador) {
    const elOperador = document.getElementById('nomeOperador');
    if (elOperador) elOperador.innerText = nomeOperador;

    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.style.display = 'none';

    const app = document.getElementById('app');
    if (app) app.style.display = 'flex';

    const reservaSdr = document.getElementById('reservaSdr');
    if (reservaSdr) reservaSdr.value = nomeOperador;
}

export function atualizarInterfaceUsuarioDeslogado() {
    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.style.display = 'flex';

    const app = document.getElementById('app');
    if (app) app.style.display = 'none';
}
