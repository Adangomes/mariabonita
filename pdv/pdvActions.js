// pdv/pdvActions.js
import { db, colVendas } from "../firebase.js";
import { addDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { imprimirCupomVenda } from "../impressoras/index.js";
import { getCarrinho, setCarrinho, getProdutosData, getVendasData } from "./pdvState.js";
import { renderCarrinho } from "./pdvUI.js";

export function buscarEAdicionar() {
    const input = document.getElementById('barcodeSearch');
    if (!input) return;

    const termo = input.value.trim().toLowerCase();
    const qtdInput = document.getElementById('qtdVenda');
    const qtd = qtdInput ? parseInt(qtdInput.value) || 1 : 1;

    if (!termo) return;

    const produtosLocal = getProdutosData();
    const prod = produtosLocal.find(p => p.sku.toLowerCase() === termo || p.descricao.toLowerCase().includes(termo));

    if (!prod) {
        alert('Produto não encontrado!');
        input.select();
        return;
    }

    const carrinho = getCarrinho();
    const itemNoCarrinho = carrinho.find(c => c.produto.id === prod.id);
    const qtdTotalNoCarrinho = (itemNoCarrinho ? itemNoCarrinho.qtd : 0) + qtd;

    if (qtdTotalNoCarrinho > prod.quantidade) {
        alert(`Estoque insuficiente! Saldo atual em estoque: ${prod.quantidade}`);
        return;
    }

    if (itemNoCarrinho) {
        itemNoCarrinho.qtd += qtd;
    } else {
        carrinho.push({ produto: prod, qtd });
    }

    input.value = '';
    if (qtdInput) qtdInput.value = 1;
    input.focus();
    renderCarrinho();
}

export function alterarQtdCarrinho(cIndex, delta) {
    const carrinho = getCarrinho();
    const item = carrinho[cIndex];
    if (!item) return;

    const novaQtd = item.qtd + delta;

    if (novaQtd <= 0) { 
        removerDoCarrinho(cIndex); 
        return; 
    }

    const produtosLocal = getProdutosData();
    const prodOriginal = produtosLocal.find(p => p.id === item.produto.id);

    if (prodOriginal && novaQtd > prodOriginal.quantidade) { 
        alert('Limite de estoque atingido!'); 
        return; 
    }

    item.qtd = novaQtd;
    renderCarrinho();
}

export function removerDoCarrinho(cIndex) {
    const carrinho = getCarrinho();
    carrinho.splice(cIndex, 1);
    renderCarrinho();
}

export function limparCarrinho() {
    setCarrinho([]);
    const descValorInput = document.getElementById('descontoValor');
    if (descValorInput) descValorInput.value = '';
    
    renderCarrinho();
    
    const inputSearch = document.getElementById('barcodeSearch');
    if (inputSearch) inputSearch.focus();
}

export async function finalizarVenda() {
    const carrinho = getCarrinho();
    if (carrinho.length === 0) { 
        alert('O carrinho está vazio!'); 
        return; 
    }

    const subtotal = carrinho.reduce((acc, i) => acc + (i.qtd * i.produto.preco), 0);
    const totalEl = document.getElementById('totalVenda');
    const descontoEl = document.getElementById('descontoCalculado');
    const pagamentoEl = document.getElementById('pagamento');

    const total = totalEl ? parseFloat(totalEl.innerText) : subtotal;
    const descontoVal = descontoEl ? parseFloat(descontoEl.innerText) || 0 : 0;
    const formaPagamento = pagamentoEl ? pagamentoEl.value : 'PIX';

    const totalPecasVenda = carrinho.reduce((acc, i) => acc + i.qtd, 0);
    const itensStr = carrinho.map(i => `${i.qtd}x ${i.produto.descricao} (${i.produto.tamanho})`).join(', ');

    const itensParaImpressao = carrinho.map(i => ({
        codigo: i.produto.sku || '-',
        nome: i.produto.descricao,
        cor: i.produto.cor || i.produto.tamanho,
        qtd: i.qtd,
        preco: i.produto.preco
    }));

    const vendasLocal = getVendasData();
    const produtosLocal = getProdutosData();
    const numeroPedido = vendasLocal.length + 1;

    // 1. Atualiza estoque no Firestore
    for (let item of carrinho) {
        const prodOriginal = produtosLocal.find(p => p.id === item.produto.id);
        if (prodOriginal) {
            await updateDoc(doc(db, "produtos", item.produto.id), {
                quantidade: prodOriginal.quantidade - item.qtd
            });
        }
    }

    // 2. Registra a venda no Firestore
    await addDoc(colVendas, {
        pedidoNum: numeroPedido,
        dataIso: new Date().toISOString(),
        data: new Date().toLocaleString('pt-BR'),
        tipoVenda: 'LOJA FÍSICA',
        detalhes: 'Balcão',
        itens: itensStr,
        totalPecas: totalPecasVenda,
        pagamento: formaPagamento,
        desconto: `R$ ${descontoVal.toFixed(2)}`,
        total
    });

    // 3. Pergunta sobre a impressão do cupom
    const querImprimir = confirm('Venda realizada com sucesso! 🎉\n\nDeseja imprimir o cupom da venda?');

    if (querImprimir) {
        imprimirCupomVenda({
            id: numeroPedido,
            subtotal: subtotal,
            desconto: descontoVal,
            total: total,
            formaPagamento: formaPagamento,
            itens: itensParaImpressao
        });
    }

    // 4. Limpa o caixa
    limparCarrinho();
}
