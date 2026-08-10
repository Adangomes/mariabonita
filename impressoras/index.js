// impressoras/index.js
import { operadorAtual } from "../auth.js"; // Ajuste o caminho conforme necessário
import { obterContainerImpressao } from "./printDom.js";
import { gerarHTMLReserva, gerarHTMLVenda } from "./printTemplates.js";

/**
 * Comprovante de Reserva (Sacola) - 58mm
 */
export function imprimirReserva(reserva) {
  const container = obterContainerImpressao();
  container.innerHTML = gerarHTMLReserva(reserva, operadorAtual);
  window.print();
}

/**
 * Cupom Não Fiscal PDV - 58mm
 */
export function imprimirCupomVenda(venda) {
  const container = obterContainerImpressao();
  container.innerHTML = gerarHTMLVenda(venda, operadorAtual);
  window.print();
}

// Atribuição ao escopo global para compatibilidade com chamadas no HTML (ex: onclick="")
window.imprimirReserva = imprimirReserva;
window.imprimirCupomVenda = imprimirCupomVenda;
