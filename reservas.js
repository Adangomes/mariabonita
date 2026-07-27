import { db, colReservas } from "./firebase.js";
import { addDoc, doc, updateDoc, collection } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { operadorAtual } from "./auth.js";
import { imprimirReserva } from "./imprimir.js";

let reservasLocal = [];
let produtosLocal = [];

export function setReservasData(res, prod) {
    reservasLocal = res;
    produtosLocal = prod;
}

export function initReservas() {
    document.getElementById('formReserva').addEventListener('submit', async (e) => {
        e.preventDefault();

        let sku = document.getElementById('reservaSku').value.trim();
        let qtd = parseInt(document.getElementById('reservaQtd').value) || 1;
        let tipo = document.getElementById('reservaTipo').value;
        let nome = document.getElementById('reservaNome').value.trim();
        let sdr = operadorAtual;
        let origem = document.getElementById('reservaOrigem').value;
        let estadoReserva = document.getElementById('reservaEstado').value;

        let prod = produtosLocal.find(p => p.sku.toLowerCase() === sku.toLowerCase());

        if(!prod){
            alert("Código da peça não encontrado no estoque.");
            return;
        }

        if(prod.quantidade < qtd){
            alert("Estoque insuficiente.");
            return;
        }

        let total = prod.preco * qtd;
        let sinalVal = parseFloat(document.getElementById("valorSinal").value) || 0;

        // Atualiza estoque
        await updateDoc(doc(db, "produtos", prod.id), { quantidade: prod.quantidade - qtd });

        let agora = new Date();

        let novaReserva = {
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
        document.getElementById("reservaSdr").value = operadorAtual;

        // Pergunta da Impressão da Reserva (Sacola)
        let querImprimir = confirm("Reserva registrada com sucesso!\n\nDeseja imprimir o comprovante da sacola?");
        if(querImprimir) {
            imprimirReservaViaObjeto(novaReserva);
        }
    });

    window.renderReservas = function(){
        let tbody = document.querySelector("#tabelaReservas tbody");
        tbody.innerHTML = "";

        let buscaNome = document.getElementById("searchReservaNome").value.trim().toLowerCase();
        let filtroStatus = document.getElementById("filtroReservaStatus").value;
        let filtroHora = document.getElementById("filtroReservaHora").value;

        let agoraMs = Date.now();

        reservasLocal.filter(r => r.status === "PENDENTE").forEach(r => {
            // Filtro por Nome
            if(buscaNome && !r.cliente.toLowerCase().includes(buscaNome)) return;

            // Filtro por Status/Estado
            if(filtroStatus !== "TODOS" && r.estadoReserva !== filtroStatus) return;

            // Filtro por Horas
            if(filtroHora !== "TODAS") {
                let horasDiff = (agoraMs - r.timestamp) / (1000 * 60 * 60);
                if(horasDiff > parseFloat(filtroHora)) return;
            }

            // Calcular Destaque de Cor
            let classeCor = "";
            let diffHoras = (agoraMs - r.timestamp) / (1000 * 60 * 60);

            if(r.estadoReserva === "PAGO") {
                classeCor = "reserva-pago";
            } else if(r.estadoReserva === "DINHEIRO") {
                classeCor = "reserva-marrom";
            } else if(r.estadoReserva === "SINAL DE RESERVA") {
                classeCor = "reserva-laranja";
            } else if(r.estadoReserva === "PAGAMENTO PENDENTE") {
                if(diffHoras >= 3.5) {
                    classeCor = "reserva-vermelho";
                } else {
                    classeCor = "reserva-laranja";
                }
            }

            let htmlItens = r.itens.map((i, idx) => `
                <div>
                    ${i.qtd}x ${i.desc} (${i.sku}) - R$ ${i.totalItem.toFixed(2)}
                    <button class="btn btn-danger btn-sm" onclick="removerItemReserva('${r.id}', ${idx})">✕</button>
                </div>
            `).join("");

            tbody.innerHTML += `
            <tr class="${classeCor}">
                <td>${r.dataHora}</td>
                <td><strong>${r.cliente}</strong></td>
                <td><span class="badge ${r.origem === 'Instagram' ? 'online-tag' : 'ok-stock'}">${r.origem}</span></td>
                <td>${r.sdr}</td>
                <td>${r.tipo}</td>
                <td>
                    ${htmlItens}
                    <button class="btn btn-secondary btn-sm" style="margin-top:4px;" onclick="adicionarItemReserva('${r.id}')">+ Adicionar Item</button>
                </td>
                <td><strong>R$ ${r.totalGeral.toFixed(2)}</strong></td>
                <td>
                    <strong>${r.estadoReserva}</strong><br>
                    Sinal: R$ ${(r.sinal || 0).toFixed(2)}
                </td>
                <td>
                    <div style="display: flex; flex-direction: column; gap: 4px; min-width: 90px;">
                        <button class="btn btn-secondary btn-sm" onclick="concluirVendaReserva('${r.id}')">Concluir</button>
                        <button class="btn btn-secondary btn-sm" onclick="cancelarReserva('${r.id}')">Cancelar</button>
                        <button class="btn btn-secondary btn-sm" onclick="acaoImprimirReserva('${r.id}')">Imprimir</button>
                    </div>
                </td>
            </tr>`;
        });
    };

    // Função auxiliar para formatar e disparar a impressão
    window.acaoImprimirReserva = function(idReserva) {
        let r = reservasLocal.find(x => x.id === idReserva);
        if(!r) return;
        imprimirReservaViaObjeto(r);
    };

    function imprimirReservaViaObjeto(reservaObj) {
        let itensFormatados = reservaObj.itens.map(i => ({
            codigo: i.sku,
            nome: i.desc,
            cor: i.tamanho,
            preco: i.totalItem
        }));

        imprimirReserva({
            cliente: reservaObj.cliente,
            observacao: `Origem: ${reservaObj.origem} | SDR: ${reservaObj.sdr}`,
            desconto: reservaObj.sinal || 0,
            total: reservaObj.totalGeral,
            itens: itensFormatados
        });
    }

    window.adicionarItemReserva = async function(idReserva) {
        let r = reservasLocal.find(x => x.id === idReserva);
        if(!r) return;

        let sku = prompt("Digite o SKU do item a ser ADICIONADO:");
        if(!sku) return;

        let prod = produtosLocal.find(p => p.sku.toLowerCase() === sku.trim().toLowerCase());
        if(!prod || prod.quantidade < 1) {
            alert("Produto indisponível no estoque.");
            return;
        }

        await updateDoc(doc(db, "produtos", prod.id), { quantidade: prod.quantidade - 1 });

        let novosItens = [...r.itens, {
            sku: prod.sku,
            desc: prod.descricao,
            tamanho: prod.tamanho,
            qtd: 1,
            precoUn: prod.preco,
            totalItem: prod.preco
        }];

        let novoTotal = novosItens.reduce((acc, i) => acc + i.totalItem, 0);

        await updateDoc(doc(db, "reservas", idReserva), {
            itens: novosItens,
            totalGeral: novoTotal
        });
    };

    window.removerItemReserva = async function(idReserva, idxItem) {
        let r = reservasLocal.find(x => x.id === idReserva);
        if(!r) return;

        let item = r.itens[idxItem];
        let prod = produtosLocal.find(p => p.sku === item.sku);

        if(prod) {
            await updateDoc(doc(db, "produtos", prod.id), { quantidade: prod.quantidade + item.qtd });
        }

        let novosItens = r.itens.filter((_, idx) => idx !== idxItem);

        if(novosItens.length === 0) {
            await updateDoc(doc(db, "reservas", idReserva), { status: "CANCELADA" });
        } else {
            let novoTotal = novosItens.reduce((acc, i) => acc + i.totalItem, 0);
            await updateDoc(doc(db, "reservas", idReserva), {
                itens: novosItens,
                totalGeral: novoTotal
            });
        }
    };

    window.concluirVendaReserva = async function(idReserva){
        let r = reservasLocal.find(x => x.id === idReserva);
        if(!r) return;

        let formaPag = prompt("Informe a Forma de Pagamento para Concluir a Venda:\nPIX\nCartão de Crédito\nCartão de Débito\nDinheiro", "PIX");
        if(!formaPag) return;

        let descItens = r.itens.map(i => `${i.qtd}x ${i.desc} (${i.tamanho})`).join(", ");

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
        
        let querImprimir = confirm("Reserva concluída com sucesso! Deseja imprimir a via da sacola?");
        if(querImprimir) {
            imprimirReservaViaObjeto(r);
        }
    };

    window.cancelarReserva = async function(idReserva){
        if(!confirm("Deseja cancelar esta reserva? Os produtos retornarão ao estoque.")) return;

        let r = reservasLocal.find(x => x.id === idReserva);
        if(!r) return;

        for(let item of r.itens) {
            let prod = produtosLocal.find(p => p.sku === item.sku);
            if(prod){
                await updateDoc(doc(db, "produtos", prod.id), { quantidade: prod.quantidade + item.qtd });
            }
        }

        await updateDoc(doc(db, "reservas", idReserva), { status: "CANCELADA" });
        alert("Reserva cancelada.");
    };
}
