// reservas/reservasUI.js
import { getReservasData } from "./reservasState.js";

export function renderReservas() {
    const reservasLocal = getReservasData();
    const tbody = document.querySelector("#tabelaReservas tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const buscaNomeInput = document.getElementById("searchReservaNome");
    const filtroStatusInput = document.getElementById("filtroReservaStatus");
    const filtroHoraInput = document.getElementById("filtroReservaHora");

    const buscaNome = buscaNomeInput ? buscaNomeInput.value.trim().toLowerCase() : "";
    const filtroStatus = filtroStatusInput ? filtroStatusInput.value : "TODOS";
    const filtroHora = filtroHoraInput ? filtroHoraInput.value : "TODAS";

    const agoraMs = Date.now();

    reservasLocal.filter(r => r.status === "PENDENTE").forEach(r => {
        // Filtro por Nome
        if (buscaNome && !r.cliente.toLowerCase().includes(buscaNome)) return;

        // Filtro por Status/Estado
        if (filtroStatus !== "TODOS" && r.estadoReserva !== filtroStatus) return;

        // Filtro por Horas
        if (filtroHora !== "TODAS") {
            const horasDiff = (agoraMs - r.timestamp) / (1000 * 60 * 60);
            if (horasDiff > parseFloat(filtroHora)) return;
        }

        // Calcular Destaque de Cor
        let classeCor = "";
        const diffHoras = (agoraMs - r.timestamp) / (1000 * 60 * 60);

        if (r.estadoReserva === "PAGO") {
            classeCor = "reserva-pago";
        } else if (r.estadoReserva === "DINHEIRO") {
            classeCor = "reserva-marrom";
        } else if (r.estadoReserva === "SINAL DE RESERVA") {
            classeCor = "reserva-laranja";
        } else if (r.estadoReserva === "PAGAMENTO PENDENTE") {
            if (diffHoras >= 3.5) {
                classeCor = "reserva-vermelho";
            } else {
                classeCor = "reserva-laranja";
            }
        }

        const htmlItens = r.itens.map((i, idx) => `
            <div>
                ${i.qtd}x ${i.desc} (${i.sku}) - R$ ${(i.totalItem || 0).toFixed(2)}
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
            <td><strong>R$ ${(r.totalGeral || 0).toFixed(2)}</strong></td>
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
}
