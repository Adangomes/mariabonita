// pdv/pdvEvents.js
import { buscarEAdicionar, limparCarrinho, finalizarVenda } from "./pdvActions.js";

export function bindPdvEvents() {
    const inputBarcode = document.getElementById('barcodeSearch');
    if (inputBarcode) {
        inputBarcode.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') buscarEAdicionar();
        });
    }

    document.addEventListener('keydown', e => {
        const pdvSection = document.getElementById('pdv');
        if (!pdvSection || !pdvSection.classList.contains('active')) return;

        if (e.key === 'F2') { 
            e.preventDefault(); 
            const barcodeInput = document.getElementById('barcodeSearch');
            if (barcodeInput) barcodeInput.focus(); 
        }
        if (e.key === 'F4') { 
            e.preventDefault(); 
            limparCarrinho(); 
        }
        if (e.key === 'F8') { 
            e.preventDefault(); 
            finalizarVenda(); 
        }
    });
}
