// estoque/estoqueUI.js
import { getProdutos } from "./estoqueState.js";

export function renderEstoque() {
    const produtos = getProdutos();
    const tbody = document.querySelector('#tabelaEstoque tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const inputSearch = document.getElementById('searchEstoque');
    const termo = inputSearch ? inputSearch.value.trim().toLowerCase() : '';

    let totalPecas = 0;
    let valorEstoque = 0;

    produtos.forEach((p) => {
        totalPecas += p.quantidade;
        valorEstoque += (p.quantidade * p.preco);

        // Filtro de busca
        if (termo && !p.sku.toLowerCase().includes(termo) && 
            !p.descricao.toLowerCase().includes(termo) && 
            !p.cor.toLowerCase().includes(termo)) {
            return;
        }

        const status = p.quantidade <= 3 
            ? '<span class="badge low-stock">Baixo</span>' 
            : '<span class="badge ok-stock">OK</span>';

        tbody.innerHTML += `
            <tr>
                <td><strong>${p.sku}</strong></td>
                <td>${p.descricao}</td>
                <td>${p.tamanho}</td>
                <td>${p.cor}</td>
                <td>
                    R$ ${p.preco.toFixed(2)} 
                    <button class="btn btn-secondary btn-sm" onclick="alterarPrecoEstoque('${p.sku}')">Edit</button>
                </td>
                <td><strong>${p.quantidade} un</strong></td>
                <td>${status}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="reporEstoque('${p.id}')">+ Repor</button>
                    <button class="btn btn-danger btn-sm" onclick="excluirProduto('${p.id}')">Excluir</button>
                </td>
            </tr>`;
    });

    const elTotalPecas = document.getElementById('metricTotalPecas');
    const elValorEstoque = document.getElementById('metricValorEstoque');

    if (elTotalPecas) elTotalPecas.innerText = totalPecas;
    if (elValorEstoque) elValorEstoque.innerText = `R$ ${valorEstoque.toFixed(2)}`;
}
