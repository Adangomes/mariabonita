// script/navigation.js
import { getVendas, getReservas } from "./appState.js";
import { updateDashboard } from "../dashboards/index.js";

export function showSection(id) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.sidebar button').forEach(btn => btn.classList.remove('active'));
    
    const sectionTarget = document.getElementById(id);
    const buttonTarget = document.getElementById(`btn-${id}`);

    if (sectionTarget) sectionTarget.classList.add('active');
    if (buttonTarget) buttonTarget.classList.add('active');
    
    if (id === 'estoque' && typeof window.renderEstoque === 'function') {
        window.renderEstoque();
    }
    if (id === 'reservas' && typeof window.renderReservas === 'function') {
        window.renderReservas();
    }
    if (id === 'pdv') {
        if (typeof window.renderCarrinho === 'function') window.renderCarrinho();
        setTimeout(() => {
            const input = document.getElementById('barcodeSearch');
            if (input) input.focus();
        }, 100);
    }
    if (id === 'historico' && typeof window.renderHistorico === 'function') {
        window.renderHistorico();
    }
    if (id === 'dashboard') {
        updateDashboard(getVendas(), getReservas());
    }
}
