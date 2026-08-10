// script/index.js
import { colProdutos, colReservas, colVendas } from "../firebase.js";
import { onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { initAuth } from "../auth/index.js";
import { initEstoque } from "../estoque/index.js";
import { initReservas } from "../reservas/index.js";
import { initPdv } from "../pdv/index.js";
import { initHistorico } from "../historicos/index.js";
import { updateDashboard } from "../dashboards/index.js";

import { 
    setProdutosState, 
    setReservasState, 
    setVendasState, 
    getVendas, 
    getReservas 
} from "./appState.js";
import { showSection } from "./navigation.js";

// Expor navegação globalmente para cliques na sidebar (ex: onclick="showSection('pdv')")
window.showSection = showSection;

// Autenticação e Inicialização de Módulos
initAuth(() => {
    initEstoque(colProdutos);
    initReservas();
    initPdv();
    initHistorico();

    // Listeners Realtime Firebase
    onSnapshot(colProdutos, (snapshot) => {
        const produtosList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProdutosState(produtosList);

        if (document.getElementById('estoque')?.classList.contains('active')) {
            if (typeof window.renderEstoque === 'function') window.renderEstoque();
        }
    });

    onSnapshot(colReservas, (snapshot) => {
        const reservasList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReservasState(reservasList);

        if (document.getElementById('reservas')?.classList.contains('active')) {
            if (typeof window.renderReservas === 'function') window.renderReservas();
        }
        if (document.getElementById('dashboard')?.classList.contains('active')) {
            updateDashboard(getVendas(), getReservas());
        }
    });

    onSnapshot(colVendas, (snapshot) => {
        const vendasList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVendasState(vendasList);

        if (document.getElementById('historico')?.classList.contains('active')) {
            if (typeof window.renderHistorico === 'function') window.renderHistorico();
        }
        if (document.getElementById('dashboard')?.classList.contains('active')) {
            updateDashboard(getVendas(), getReservas());
        }
    });
});
