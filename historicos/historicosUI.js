// historicos/historicosUI.js
import { getVendasData } from "./historicosState.js";

export function renderHistorico() {
    const vendasLocal = getVendasData();
    const tbody = document.querySelector('#tabelaHistorico tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const filtroInput = document.getElementById('filtroMesAno');
    const filtroMesAno = filtroInput ? filtroInput.value : '';

    let faturamento = 0;
    let pecasVendidas = 0;

    const vendasFiltradas = vendasLocal.filter(v => {
        if (!filtroMesAno) return true;
        const dataVenda = v.dataIso ? v.dataIso.substring(0, 7) : "";
        return dataVenda === filtroMesAno;
    });

    vendasFiltradas.slice().reverse().forEach((v, index) => {
        faturamento += (v.total || 0);
        pecasVendidas += (v.totalPecas || 1);

        const badgeTipo = v.tipoVenda === 'VENDA ONLINE' 
            ? '<span class="badge online-tag">VENDA ONLINE</span>' 
            : '<span class="badge balcao-tag">LOJA FÍSICA</span>';

        tbody.innerHTML += `
            <tr>
                <td><strong>#${v.pedidoNum || index + 1}</strong></td>
                <td><small>${v.data}</small></td>
                <td>${badgeTipo}</td>
                <td><small>${v.detalhes || 'Balcão'}</small></td>
                <td>${v.itens}</td>
                <td>${v.pagamento}</td>
                <td style="color:#dc2626;">-${v.desconto || 'R$ 0.00'}</td>
                <td><strong>R$ ${(v.total || 0).toFixed(2)}</strong></td>
            </tr>`;
    });

    const elFaturamento = document.getElementById('metricFaturamento');
    const elPecasVendidas = document.getElementById('metricPecasVendidas');

    if (elFaturamento) elFaturamento.innerText = `R$ ${faturamento.toFixed(2)}`;
    if (elPecasVendidas) elPecasVendidas.innerText = pecasVendidas;
}

export function limparFiltroData() {
    const filtroInput = document.getElementById('filtroMesAno');
    if (filtroInput) filtroInput.value = '';
    renderHistorico();
}
