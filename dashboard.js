 let chartPagamentosInstance = null;
let chartOrigemInstance = null;

export function updateDashboard(vendas, reservas) {
    let totalVendas = vendas.length;
    let faturamento = vendas.reduce((acc, v) => acc + v.total, 0);
    let reservasAtivas = reservas.filter(r => r.status === "PENDENTE").length;

    document.getElementById('dashTotalVendas').innerText = totalVendas;
    document.getElementById('dashFaturamentoTotal').innerText = `R$ ${faturamento.toFixed(2)}`;
    document.getElementById('dashReservasAtivas').innerText = reservasAtivas;

    // Agrupar formas de pagamento
    let pagMap = {};
    vendas.forEach(v => {
        pagMap[v.pagamento] = (pagMap[v.pagamento] || 0) + v.total;
    });

    // Agrupar origem reservas
    let origemMap = { "WhatsApp": 0, "Instagram": 0 };
    reservas.forEach(r => {
        if(r.origem) origemMap[r.origem] = (origemMap[r.origem] || 0) + 1;
    });

    // Renderizar Gráfico Pagamentos
    const ctxPag = document.getElementById('chartPagamentos').getContext('2d');
    if(chartPagamentosInstance) chartPagamentosInstance.destroy();
    chartPagamentosInstance = new Chart(ctxPag, {
        type: 'pie',
        data: {
            labels: Object.keys(pagMap),
            datasets: [{
                data: Object.values(pagMap),
                backgroundColor: ['#3b82f6', '#16a34a', '#eab308', '#ef4444', '#8b5cf6']
            }]
        }
    });

    // Renderizar Gráfico Origem Reservas
    const ctxOrigem = document.getElementById('chartOrigemReservas').getContext('2d');
    if(chartOrigemInstance) chartOrigemInstance.destroy();
    chartOrigemInstance = new Chart(ctxOrigem, {
        type: 'doughnut',
        data: {
            labels: Object.keys(origemMap),
            datasets: [{
                data: Object.values(origemMap),
                backgroundColor: ['#22c55e', '#ec4899']
            }]
        }
    });
}
