// dashboards/index.js
import { calcularMetricas, atualizarCardsUI } from "./dashboardMetrics.js";
import { agruparPagamentos, agruparOrigemReservas } from "./dashboardData.js";
import { renderizarGraficoPagamentos, renderizarGraficoOrigem } from "./dashboardCharts.js";

export function updateDashboard(vendas = [], reservas = []) {
    // 1. Atualiza Indicadores/Cards
    const metricas = calcularMetricas(vendas, reservas);
    atualizarCardsUI(metricas);

    // 2. Agrupa os Dados
    const pagMap = agruparPagamentos(vendas);
    const origemMap = agruparOrigemReservas(reservas);

    // 3. Renderiza os Gráficos
    renderizarGraficoPagamentos(pagMap);
    renderizarGraficoOrigem(origemMap);
}

// Expõe globalmente caso o sistema chame via window
window.updateDashboard = updateDashboard;
