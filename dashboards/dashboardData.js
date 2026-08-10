// dashboards/dashboardData.js

export function agruparPagamentos(vendas) {
    const pagMap = {};
    vendas.forEach(v => {
        const forma = v.pagamento || "Outros";
        pagMap[forma] = (pagMap[forma] || 0) + (v.total || 0);
    });
    return pagMap;
}

export function agruparOrigemReservas(reservas) {
    const origemMap = { "WhatsApp": 0, "Instagram": 0 };
    reservas.forEach(r => {
        if (r.origem) {
            origemMap[r.origem] = (origemMap[r.origem] || 0) + 1;
        }
    });
    return origemMap;
}
