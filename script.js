import { colProdutos, colReservas, colVendas } from "./firebase.js";
import { onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { initAuth } from "./auth.js";
import { initEstoque, setProdutos } from "./estoque.js";
import { initReservas, setReservasData } from "./reservas.js";
import { initPdv, setPdvData } from "./pdv.js";
import { initHistorico, setVendasData } from "./historico.js";
import { updateDashboard } from "./dashboard.js";

let produtos = [];
let reservas = [];
let vendas = [];

// Alternar Seções
window.showSection = function(id) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.sidebar button').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(id).classList.add('active');
    document.getElementById(`btn-${id}`).classList.add('active');
    
    if(id === 'estoque') renderEstoque();
    if(id === 'reservas') renderReservas();
    if(id === 'pdv') {
        renderCarrinho();
        setTimeout(() => document.getElementById('barcodeSearch').focus(), 100);
    }
    if(id === 'historico') renderHistorico();
    if(id === 'dashboard') updateDashboard(vendas, reservas);
};

// Autenticação e Inicialização de Módulos
initAuth(() => {
    initEstoque(colProdutos);
    initReservas();
    initPdv();
    initHistorico();

    // Listeners Realtime Firebase
    onSnapshot(colProdutos, (snapshot) => {
        produtos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProdutos(produtos);
        setReservasData(reservas, produtos);
        setPdvData(produtos, vendas);
        if(document.getElementById('estoque').classList.contains('active')) renderEstoque();
    });

    onSnapshot(colReservas, (snapshot) => {
        reservas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReservasData(reservas, produtos);
        if(document.getElementById('reservas').classList.contains('active')) renderReservas();
        if(document.getElementById('dashboard').classList.contains('active')) updateDashboard(vendas, reservas);
    });

    onSnapshot(colVendas, (snapshot) => {
        vendas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVendasData(vendas);
        setPdvData(produtos, vendas);
        if(document.getElementById('historico').classList.contains('active')) renderHistorico();
        if(document.getElementById('dashboard').classList.contains('active')) updateDashboard(vendas, reservas);
    });
});
