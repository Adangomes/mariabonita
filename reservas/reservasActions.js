// reservas/reservasActions.js
import { db, colReservas } from "../firebase.js";
import { addDoc, doc, updateDoc, collection } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { operadorAtual } from "../auth/users.js";
import { getReservasData, getProdutosData } from "./reservasState.js";
import { imprimirReservaViaObjeto } from "./reservasPrint.js";

export async function criarReserva(e) {
    e.preventDefault();
    const produtosLocal = getProdutosData();

    const sku = document.getElementById('reservaSku').value.trim();
    const qtd = parseInt(document.getElementById('reservaQtd').value) || 1;
    const tipo = document.getElementById('reservaTipo').value;
    const nome = document.getElementById('reservaNome').value.trim();
    const sdr = operadorAtual;
    const origem = document.getElementById('reservaOrigem').value;
    const estadoReserva = document.getElementById('reservaEstado').value;

    const prod = produtosLocal.find(p => p.sku.toLowerCase() === sku.toLowerCase());

    if (!prod) {
        alert("Código da peça não encontrado no estoque.");
        return;
    }

    if (prod.quantidade < qtd) {
        alert("Estoque insuficiente.");
        return;
    }

    const total = prod.preco * qtd;
    const sinalVal = parseFloat(document.getElementById("valorSinal").value) || 0;

    // Atualiza estoque no Firestore
    await updateDoc(doc(db, "produtos", prod.id), { quantidade: prod.quantidade - qtd });

    const agora = new Date();

    const novaReserva = {
        timestamp: agora.getTime(),
        dataHora: agora.toLocaleString("pt-BR"),
        cliente: nome,
        sdr: sdr,
        origem: origem,
        tipo: tipo,
        estadoReserva: estadoReserva,
        itens: [{
            sku: prod.sku,
            desc: prod.descricao,
            tamanho: prod.tamanho,
            qtd: qtd,
            precoUn: prod.preco,
            totalItem: total
        }],
        totalGeral: total,
        sinal: sinalVal,
        status: "PENDENTE"
    };

    await addDoc(colReservas, novaReserva);

    e.target.reset();
    document.getElementById("reservaQtd").value = 1;
    const reservaSdrEl = document.getElementById("reservaSdr");
    if (reservaSdrEl) reservaSdrEl.value = operadorAtual;

    const querImprimir = confirm("Reserva registrada com sucesso!\n\nDeseja imprimir o comprovante da sacola?");
    if (querImprimir) {
        imprimirReservaViaObjeto(novaReserva);
    }
}

export async function adicionarItemReserva(idReserva) {
    const reservasLocal = getReservasData();
    const produtosLocal = getProdutosData();

    const r = reservasLocal.find(x => x.id === idReserva);
    if (!r) return;

    const sku = prompt("Digite o SKU do item a ser ADICIONADO:");
    if (!sku) return;

    const prod = produtosLocal.find(p => p.sku.toLowerCase() === sku.trim().toLowerCase());
    if (!prod || prod.quantidade < 1) {
        alert("Produto indisponível no estoque.");
        return;
    }

    await updateDoc(doc(db, "produtos", prod.id), { quantidade: prod.quantidade - 1 });

    const novosItens = [...r.itens, {
        sku: prod.sku,
        desc: prod.descricao,
        tamanho: prod.tamanho,
        qtd: 1,
        precoUn: prod.preco,
        totalItem: prod.preco
    }];

    const novoTotal = novosItens.reduce((acc, i) => acc + i.totalItem, 0);

    await updateDoc(doc(db, "reservas", idReserva), {
        itens: novosItens,
        totalGeral: novoTotal
    });
}

export async function removerItemReserva(idReserva, idxItem) {
    const reservasLocal = getReservasData();
    const produtosLocal = getProdutosData();

    const r = reservasLocal.find(x => x.id === idReserva);
    if (!r) return;

    const item = r.itens[idxItem];
    const prod = produtosLocal.find(p => p.sku === item.sku);

    if (prod) {
        await updateDoc(doc(db, "produtos", prod.id), { quantidade: prod.quantidade + item.qtd });
    }

    const novosItens = r.itens.filter((_, idx) => idx !== idxItem);

    if (novosItens.length === 0) {
        await updateDoc(doc(db, "reservas", idReserva), { status: "CANCELADA" });
    } else {
        const novoTotal = novosItens.reduce((acc, i) => acc + i.totalItem, 0);
        await updateDoc(doc(db, "reservas", idReserva), {
            itens: novosItens,
            totalGeral: novoTotal
        });
    }
}

export async function concluirVendaReserva(idReserva) {
    const reservasLocal = getReservasData();
    const r = reservasLocal.find(x => x.id === idReserva);
    if (!r) return;

    const formaPag = prompt("Informe a Forma de Pagamento para Concluir a Venda:\nPIX\nCartão de Crédito\nCartão de Débito\nDinheiro", "PIX");
    if (!formaPag) return;

    const descItens = r.itens.map(i => `${i.qtd}x ${i.desc} (${i.tamanho})`).join(", ");

    await addDoc(collection(db, "vendas"), {
        pedidoNum: Date.now(),
        dataIso: new Date().toISOString(),
        data: new Date().toLocaleString("pt-BR"),
        tipoVenda: "VENDA ONLINE",
        detalhes: `SDR: ${r.sdr} | Cliente: ${r.cliente} | Origem: ${r.origem}`,
        itens: descItens,
        totalPecas: r.itens.reduce((a, b) => a + b.qtd, 0),
        pagamento: formaPag,
        desconto: "R$ 0.00",
        total: r.totalGeral
    });

    await updateDoc(doc(db, "reservas", idReserva), { status: "CONCLUIDA" });

    const querImprimir = confirm("Reserva concluída com sucesso! Deseja imprimir a via da sacola?");
    if (querImprimir) {
        imprimirReservaViaObjeto(r);
    }
}

export async function cancelarReserva(idReserva) {
    if (!confirm("Deseja cancelar esta reserva? Os produtos retornarão ao estoque.")) return;

    const reservasLocal = getReservasData();
    const produtosLocal = getProdutosData();

    const r = reservasLocal.find(x => x.id === idReserva);
    if (!r) return;

    for (let item of r.itens) {
        const prod = produtosLocal.find(p => p.sku === item.sku);
        if (prod) {
            await updateDoc(doc(db, "produtos", prod.id), { quantidade: prod.quantidade + item.qtd });
        }
    }

    await updateDoc(doc(db, "reservas", idReserva), { status: "CANCELADA" });
    alert("Reserva cancelada.");
}
