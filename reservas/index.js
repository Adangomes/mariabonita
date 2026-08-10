// reservas/index.js
import { setReservasData } from "./reservasState.js";
import { renderReservas } from "./reservasUI.js";
import { acaoImprimirReserva } from "./reservasPrint.js";
import { 
    criarReserva, 
    adicionarItemReserva, 
    removerItemReserva, 
    concluirVendaReserva, 
    cancelarReserva 
} from "./reservasActions.js";

export { setReservasData };

export function initReservas() {
    const formReserva = document.getElementById('formReserva');
    if (formReserva) {
        formReserva.addEventListener('submit', criarReserva);
    }

    // Exposição global para chamadas inline do HTML (onclick)
    window.renderReservas = renderReservas;
    window.acaoImprimirReserva = acaoImprimirReserva;
    window.adicionarItemReserva = adicionarItemReserva;
    window.removerItemReserva = removerItemReserva;
    window.concluirVendaReserva = concluirVendaReserva;
    window.cancelarReserva = cancelarReserva;
}
