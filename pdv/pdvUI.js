// pdv/pdvUI.js
import { getCarrinho } from "./pdvState.js";

export function renderCarrinho() {
    const carrinho = getCarrinho();
    const tbody = document.querySelector('#tabelaCarrinho tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    let subtotal = 0;

    carrinho.forEach((item, cIndex) => {
        const itemSubtotal = item.qtd * item.produto.preco;
        subtotal += itemSubtotal;

        tbody.innerHTML += `
            <tr>
                <td>${item.produto.descricao} (${item.produto.tamanho}/${item.produto.cor || ''})</td>
                <td>
                    <button class="btn btn-sm" onclick="alterarQtdCarrinho(${cIndex}, -1)">-</button>
                    ${item.qtd}
                    <button class="btn btn-sm" onclick="alterarQtdCarrinho(${cIndex}, 1)">+</button>
                </td>
                <td>R$ ${item.produto.preco.toFixed(2)}</td>
                <td>R$ ${itemSubtotal.toFixed(2)}</td>
                <td><button class="btn btn-danger btn-sm" onclick="removerDoCarrinho(${cIndex})">✕</button></td>
            </tr>`;
    });

    const descValorInputEl = document.getElementById('descontoValor');
    const descTipoEl = document.getElementById('descontoTipo');

    const descValorInput = descValorInputEl ? parseFloat(descValorInputEl.value) || 0 : 0;
    const descTipo = descTipoEl ? descTipoEl.value : 'R$';

    let descontoFinal = descTipo === 'R$' ? descValorInput : (subtotal * descValorInput) / 100;
    if (descontoFinal > subtotal) descontoFinal = subtotal;

    const totalFinal = subtotal - descontoFinal;

    const elSubtotal = document.getElementById('subtotalVenda');
    const elDesconto = document.getElementById('descontoCalculado');
    const elTotal = document.getElementById('totalVenda');

    if (elSubtotal) elSubtotal.innerText = subtotal.toFixed(2);
    if (elDesconto) elDesconto.innerText = descontoFinal.toFixed(2);
    if (elTotal) elTotal.innerText = totalFinal.toFixed(2);
}
