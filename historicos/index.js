// historicos/index.js
import { setVendasData } from "./historicosState.js";
import { renderHistorico, limparFiltroData } from "./historicosUI.js";
import { gerarPDFHistorico } from "./historicosPdf.js";

export { setVendasData };

export function initHistorico() {
    // Exposição global para chamadas via eventos no HTML (ex: onclick)
    window.renderHistorico = renderHistorico;
    window.limparFiltroData = limparFiltroData;
    window.gerarPDFHistorico = gerarPDFHistorico;
}
