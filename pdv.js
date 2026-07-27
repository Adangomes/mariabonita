 import { db, colVendas } from "./firebase.js";
import { addDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let carrinho = [];
let produtosLocal = [];
let vendasLocal = [];

export function setPdvData(prod, vend) {
    produtosLocal = prod;
    vendasLocal = vend;
}

export function initPdv() {
    document.getElementById('barcodeSearch').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') buscarEAdicionar();
    });

    window.buscarEAdicionar = function() {
        let input = document.getElementById('barcodeSearch');
        let termo = input.value.trim().toLowerCase();
        let qtd = parseInt(document.getElementById('qtdVenda').value) || 1;

        if(!termo) return;

        let prod = produtosLocal.find(p => p.sku.toLowerCase() === termo || p.descricao.toLowerCase().includes(termo));

        if(!prod) {
            alert('Produto não encontrado!');
            input.select();
            return;
        }

        let itemNoCarrinho = carrinho.find(c => c.produto.id === prod.id);
        let qtdTotalNoCarrinho = (itemNoCarrinho ? itemNoCarrinho.qtd : 0) + qtd;

        if(qtdTotalNoCarrinho > prod.quantidade) {
            alert(`Estoque insuficiente! Saldo atual em estoque: ${prod.quantidade}`);
            return;
        }

        if(itemNoCarrinho) {
            itemNoCarrinho.qtd += qtd;
        } else {
            carrinho.push({ produto: prod, qtd });
        }

        input.value = '';
        document.getElementById('qtdVenda').value = 1;
        input.focus();
        renderCarrinho();
    };

    window.renderCarrinho = function() {
        let tbody = document.querySelector('#tabelaCarrinho tbody');
        tbody.innerHTML = '';
        let subtotal = 0;

        carrinho.forEach((item, cIndex) => {
            let itemSubtotal = item.qtd * item.produto.preco;
            subtotal += itemSubtotal;

            tbody.innerHTML += `
                <tr>
                    <td>${item.produto.descricao} (${item.produto.tamanho}/${item.produto.cor})</td>
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

        let descValorInput = parseFloat(document.getElementById('descontoValor').value) || 0;
        let descTipo = document.getElementById('descontoTipo').value;
        let descontoFinal = descTipo === 'R$' ? descValorInput : (subtotal * descValorInput) / 100;

        if(descontoFinal > subtotal) descontoFinal = subtotal;

        let totalFinal = subtotal - descontoFinal;

        document.getElementById('subtotalVenda').innerText = subtotal.toFixed(2);
        document.getElementById('descontoCalculado').innerText = descontoFinal.toFixed(2);
        document.getElementById('totalVenda').innerText = totalFinal.toFixed(2);
    };

    window.alterarQtdCarrinho = function(cIndex, delta) {
        let item = carrinho[cIndex];
        let novaQtd = item.qtd + delta;

        if(novaQtd <= 0) { removerDoCarrinho(cIndex); return; }
        
        let prodOriginal = produtosLocal.find(p => p.id === item.produto.id);
        if(novaQtd > prodOriginal.quantidade) { alert('Limite de estoque atingido!'); return; }

        item.qtd = novaQtd;
        renderCarrinho();
    };

    window.removerDoCarrinho = function(cIndex) {
        carrinho.splice(cIndex, 1);
        renderCarrinho();
    };

    window.limparCarrinho = function() {
        carrinho = [];
        document.getElementById('descontoValor').value = '';
        renderCarrinho();
    };

    window.finalizarVenda = async function() {
        if(carrinho.length === 0) { alert('O carrinho está vazio!'); return; }

        let total = parseFloat(document.getElementById('totalVenda').innerText);
        let descontoDesc = document.getElementById('descontoCalculado').innerText;
        let formaPagamento = document.getElementById('pagamento').value;
        let totalPecasVenda = carrinho.reduce((acc, i) => acc + i.qtd, 0);
        let itensStr = carrinho.map(i => `${i.qtd}x ${i.produto.descricao} (${i.produto.tamanho})`).join(', ');

        for (let item of carrinho) {
            let prodOriginal = produtosLocal.find(p => p.id === item.produto.id);
            if(prodOriginal) {
                await updateDoc(doc(db, "produtos", item.produto.id), {
                    quantidade: prodOriginal.quantidade - item.qtd
                });
            }
        }

        await addDoc(colVendas, {
            pedidoNum: vendasLocal.length + 1,
            dataIso: new Date().toISOString(),
            data: new Date().toLocaleString('pt-BR'),
            tipoVenda: 'LOJA FÍSICA',
            detalhes: 'Balcão',
            itens: itensStr,
            totalPecas: totalPecasVenda,
            pagamento: formaPagamento,
            desconto: `R$ ${descontoDesc}`,
            total
        });

        limparCarrinho();
        alert('Venda realizada com sucesso!');
    };

    document.addEventListener('keydown', e => {
        if(!document.getElementById('pdv').classList.contains('active')) return;
        if(e.key === 'F2') { e.preventDefault(); document.getElementById('barcodeSearch').focus(); }
        if(e.key === 'F4') { e.preventDefault(); limparCarrinho(); }
        if(e.key === 'F8') { e.preventDefault(); finalizarVenda(); }
    });
}
