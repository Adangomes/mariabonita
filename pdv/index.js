// pdv/index.js
import { setPdvData } from "./pdvState.js";
import { renderCarrinho } from "./pdvUI.js";
import { 
    buscarEAdicionar, 
    alterarQtdCarrinho, 
    removerDoCarrinho, 
    limparCarrinho, 
    finalizarVenda 
} from "./pdvActions.js";
import { bindPdvEvents } from "./pdvEvents.js";

export { setPdvData };

export function initPdv() {
    bindPdvEvents();

    // Expõe as funções para a janela global (necessário para os onclicks no HTML)
    window.buscarEAdicionar = buscarEAdicionar;
    window.renderCarrinho = renderCarrinho;
    window.alterarQtdCarrinho = alterarQtdCarrinho;
    window.removerDoCarrinho = removerDoCarrinho;
    window.limparCarrinho = limparCarrinho;
    window.finalizarVenda = finalizarVenda;
}
