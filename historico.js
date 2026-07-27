 let vendasLocal = [];

export function setVendasData(vendas) {
    vendasLocal = vendas;
}

export function initHistorico() {
    window.renderHistorico = function() {
        let tbody = document.querySelector('#tabelaHistorico tbody');
        tbody.innerHTML = '';
        
        let filtroMesAno = document.getElementById('filtroMesAno').value;
        let faturamento = 0;
        let pecasVendidas = 0;

        let vendasFiltradas = vendasLocal.filter(v => {
            if(!filtroMesAno) return true;
            let dataVenda = v.dataIso ? v.dataIso.substring(0, 7) : "";
            return dataVenda === filtroMesAno;
        });

        vendasFiltradas.slice().reverse().forEach((v, index) => {
            faturamento += v.total;
            pecasVendidas += (v.totalPecas || 1);

            let badgeTipo = v.tipoVenda === 'VENDA ONLINE' 
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
                    <td><strong>R$ ${v.total.toFixed(2)}</strong></td>
                </tr>`;
        });

        document.getElementById('metricFaturamento').innerText = `R$ ${faturamento.toFixed(2)}`;
        document.getElementById('metricPecasVendidas').innerText = pecasVendidas;
    };

    window.limparFiltroData = function() {
        document.getElementById('filtroMesAno').value = '';
        renderHistorico();
    };

    window.gerarPDFHistorico = function(periodo) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let agora = Date.now();
        let limiteMs = 0;

        if(periodo === 'semana') limiteMs = 7 * 24 * 60 * 60 * 1000;
        if(periodo === '15dias') limiteMs = 15 * 24 * 60 * 60 * 1000;
        if(periodo === 'mes') limiteMs = 30 * 24 * 60 * 60 * 1000;
        if(periodo === 'ano') limiteMs = 365 * 24 * 60 * 60 * 1000;

        let vendasPDF = vendasLocal.filter(v => {
            let t = new Date(v.dataIso).getTime();
            return (agora - t) <= limiteMs;
        });

        doc.text(`Relatório de Vendas - Maria Bonita (${periodo.toUpperCase()})`, 14, 15);

        let rows = vendasPDF.map(v => [
            v.pedidoNum,
            v.data,
            v.tipoVenda,
            v.itens,
            v.pagamento,
            `R$ ${v.total.toFixed(2)}`
        ]);

        doc.autoTable({
            startY: 20,
            head: [['#', 'Data/Hora', 'Tipo', 'Itens', 'Pagamento', 'Total']],
            body: rows,
        });

        doc.save(`historico_vendas_${periodo}.pdf`);
    };
}
