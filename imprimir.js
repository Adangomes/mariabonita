/**
 * Módulo de Impressão - Maria Bonita (Otimizado para 58mm)
 */

import { operadorAtual } from "./auth.js";

const CSS_IMPRESSAO = `
  @media print {
    body * {
      visibility: hidden;
    }
    #area-impressao, #area-impressao * {
      visibility: visible;
    }
    #area-impressao {
      position: absolute;
      left: 0;
      top: 0;
      width: 58mm;
      font-family: 'Courier New', Courier, monospace;
      font-size: 10px;
      color: #000;
      background: #fff;
      padding: 2mm;
      box-sizing: border-box;
    }
  }
  .cupom-container {
    width: 100%;
    max-width: 54mm;
    font-family: 'Courier New', Courier, monospace;
    font-size: 10px;
    line-height: 1.2;
    word-break: break-word;
  }
  .cupom-header {
    text-align: center;
    border-bottom: 1px dashed #000;
    padding-bottom: 4px;
    margin-bottom: 4px;
  }
  .cupom-header h2 {
    margin: 0;
    font-size: 14px;
    text-transform: uppercase;
  }
  .cupom-destaque-cliente {
    border: 1.5px solid #000;
    padding: 4px;
    text-align: center;
    margin: 6px 0;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
  }
  .cupom-info {
    margin-bottom: 4px;
    border-bottom: 1px dashed #000;
    padding-bottom: 4px;
    font-size: 9.5px;
  }
  .cupom-tabela {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 4px;
    font-size: 9.5px;
  }
  .cupom-tabela th {
    border-bottom: 1px solid #000;
    text-align: left;
    font-size: 9px;
  }
  .cupom-tabela td {
    padding: 2px 0;
    vertical-align: top;
  }
  .cupom-totais {
    border-top: 1px dashed #000;
    padding-top: 4px;
    margin-top: 4px;
    font-size: 10px;
  }
  .linha-flex {
    display: flex;
    justify-content: space-between;
  }
  .cupom-footer {
    text-align: center;
    margin-top: 8px;
    border-top: 1px dashed #000;
    padding-top: 4px;
    font-size: 9px;
  }
`;

function injetarEstiloImpressao() {
  if (!document.getElementById("style-impressao")) {
    const style = document.createElement("style");
    style.id = "style-impressao";
    style.innerHTML = CSS_IMPRESSAO;
    document.head.appendChild(style);
  }
}

function obterContainerImpressao() {
  injetarEstiloImpressao();
  let container = document.getElementById("area-impressao");
  if (!container) {
    container = document.createElement("div");
    container.id = "area-impressao";
    document.body.appendChild(container);
  }
  container.innerHTML = "";
  return container;
}

/**
 * Comprovante de Reserva (Sacola) - 58mm
 */
export function imprimirReserva(reserva) {
  const container = obterContainerImpressao();
  const dataHora = new Date().toLocaleString("pt-BR");

  let itensHTML = reserva.itens.map(item => `
    <tr>
      <td style="width: 25%;">${item.codigo || '-'}</td>
      <td style="width: 45%;">${item.nome} ${item.cor ? '(' + item.cor + ')' : ''}</td>
      <td style="width: 30%; text-align: right;">R$ ${Number(item.preco).toFixed(2)}</td>
    </tr>
  `).join("");

  container.innerHTML = `
    <div class="cupom-container">
      <div class="cupom-header">
        <h2>MARIA BONITA</h2>
        <div>COMPROVANTE RESERVA</div>
      </div>

      <div class="cupom-destaque-cliente">
        CLIENTE:<br>${reserva.cliente || "NÃO INFORMADO"}
      </div>

      <div class="cupom-info">
        <div><strong>Data:</strong> ${dataHora}</div>
        <div><strong>Op:</strong> ${operadorAtual || "Sistema"}</div>
        ${reserva.observacao ? `<div><strong>Obs:</strong> ${reserva.observacao}</div>` : ''}
      </div>

      <table class="cupom-tabela">
        <thead>
          <tr>
            <th>Cód</th>
            <th>Item</th>
            <th style="text-align: right;">Val</th>
          </tr>
        </thead>
        <tbody>
          ${itensHTML}
        </tbody>
      </table>

      <div class="cupom-totais">
        ${reserva.desconto && reserva.desconto > 0 ? `
          <div class="linha-flex">
            <span>Desconto:</span>
            <span>-R$ ${Number(reserva.desconto).toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="linha-flex" style="font-weight: bold; font-size: 11px; margin-top: 3px;">
          <span>TOTAL:</span>
          <span>R$ ${Number(reserva.total).toFixed(2)}</span>
        </div>
      </div>

      <div class="cupom-footer">
        --------------------
      </div>
    </div>
  `;

  window.print();
}

/**
 * Cupom Não Fiscal PDV - 58mm
 */
export function imprimirCupomVenda(venda) {
  const container = obterContainerImpressao();
  const dataHora = new Date().toLocaleString("pt-BR");

  let itensHTML = venda.itens.map(item => `
    <tr>
      <td style="width: 20%;">${item.codigo || '-'}</td>
      <td style="width: 40%;">${item.nome} ${item.cor ? '(' + item.cor + ')' : ''}</td>
      <td style="width: 15%; text-align: center;">${item.qtd || 1}</td>
      <td style="width: 25%; text-align: right;">R$ ${(Number(item.preco) * (item.qtd || 1)).toFixed(2)}</td>
    </tr>
  `).join("");

  container.innerHTML = `
    <div class="cupom-container">
      <div class="cupom-header">
        <h2>MARIA BONITA</h2>
        <div>CUPOM NÃO FISCAL</div>
      </div>

      <div class="cupom-info">
        <div><strong>Venda #:</strong> ${venda.id || "PDV"}</div>
        <div><strong>Data:</strong> ${dataHora}</div>
        <div><strong>Op:</strong> ${operadorAtual || "Caixa"}</div>
        ${venda.cliente ? `<div><strong>Cli:</strong> ${venda.cliente}</div>` : ''}
      </div>

      <table class="cupom-tabela">
        <thead>
          <tr>
            <th>Cód</th>
            <th>Item</th>
            <th style="text-align: center;">Qtd</th>
            <th style="text-align: right;">Tot</th>
          </tr>
        </thead>
        <tbody>
          ${itensHTML}
        </tbody>
      </table>

      <div class="cupom-totais">
        ${venda.subtotal ? `
          <div class="linha-flex">
            <span>Subtotal:</span>
            <span>R$ ${Number(venda.subtotal).toFixed(2)}</span>
          </div>
        ` : ''}
        ${venda.desconto && venda.desconto > 0 ? `
          <div class="linha-flex">
            <span>Desconto:</span>
            <span>-R$ ${Number(venda.desconto).toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="linha-flex" style="font-weight: bold; font-size: 11px; margin-top: 3px;">
          <span>TOTAL:</span>
          <span>R$ ${Number(venda.total).toFixed(2)}</span>
        </div>
        ${venda.formaPagamento ? `
          <div class="linha-flex" style="margin-top: 2px;">
            <span>Forma:</span>
            <span>${venda.formaPagamento}</span>
          </div>
        ` : ''}
      </div>

      <div class="cupom-footer">
        Obrigado pela preferência! ❤️
      </div>
    </div>
  `;

  window.print();
}

window.imprimirReserva = imprimirReserva;
window.imprimirCupomVenda = imprimirCupomVenda;
