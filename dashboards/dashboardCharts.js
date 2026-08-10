// dashboards/dashboardCharts.js

let chartPagamentosInstance = null;
let chartOrigemInstance = null;

export function renderizarGraficoPagamentos(pagMap) {
    const canvas = document.getElementById('chartPagamentos');
    if (!canvas) return;

    if (chartPagamentosInstance) {
        chartPagamentosInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    chartPagamentosInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(pagMap),
            datasets: [{
                data: Object.values(pagMap),
                backgroundColor: ['#3b82f6', '#16a34a', '#eab308', '#ef4444', '#8b5cf6']
            }]
        }
    });
}

export function renderizarGraficoOrigem(origemMap) {
    const canvas = document.getElementById('chartOrigemReservas');
    if (!canvas) return;

    if (chartOrigemInstance) {
        chartOrigemInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    chartOrigemInstance = new Chart(ctx, {
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
