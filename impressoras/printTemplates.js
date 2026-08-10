// impressoras/printTemplates.js

export function gerarHTMLReserva(reserva, operadorAtual) {
  const dataHora = new Date().toLocaleString("pt-BR");

  const itensHTML = reserva.itens.map(item => `
    <tr>
      <td style="width: 25%;">${item.codigo || '-'}</td>
      <td style="width: 45%;">${item.nome} ${item.cor ? '(' + item.cor + ')' : ''}</td>
      <td style="width: 30%; text-align: right;">R$ ${Number(item.preco).toFixed(2)}</td>
    </tr>
  `).join("");

  return `
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
}

export function gerarHTMLVenda(venda, operadorAtual) {
  const dataHora = new Date().toLocaleString("pt-BR");

  const itensHTML = venda.itens.map(item => `
    <tr>
      <td style="width: 20%;">${item.codigo || '-'}</td>
      <td style="width: 40%;">${item.nome} ${item.cor ? '(' + item.cor + ')' : ''}</td>
      <td style="width: 15%; text-align: center;">${item.qtd || 1}</td>
      <td style="width: 25%; text-align: right;">R$ ${(Number(item.preco) * (item.qtd || 1)).toFixed(2)}</td>
    </tr>
  `).join("");

  return `
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
}
