// dashboards/dashboardMetrics.js

export function calcularMetricas(vendas, reservas) {
    const totalVendas = vendas.length;
    const faturamento = vendas.reduce((acc, v) => acc + (v.total || 0), 0);
    const reservasAtivas = reservas.filter(r => r.status === "PENDENTE").length;

    return { totalVendas, faturamento, reservasAtivas };
}

export function atualizarCardsUI({ totalVendas, faturamento, reservasAtivas }) {
    const elTotalVendas = document.getElementById('dashTotalVendas');
    const elFaturamento = document.getElementById('dashFaturamentoTotal');
    const elReservasAtivas = document.getElementById('dashReservasAtivas');

    if (elTotalVendas) elTotalVendas.innerText = totalVendas;
    if (elFaturamento) elFaturamento.innerText = `R$ ${faturamento.toFixed(2)}`;
    if (elReservasAtivas) elReservasAtivas.innerText = reservasAtivas;
}
