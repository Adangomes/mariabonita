// historicos/historicosPdf.js
import { getVendasData } from "./historicosState.js";

export function gerarPDFHistorico(periodo) {
    if (!window.jspdf) {
        console.error("Biblioteca jsPDF não foi encontrada no window.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const vendasLocal = getVendasData();

    const agora = Date.now();
    let limiteMs = 0;

    if (periodo === 'semana') limiteMs = 7 * 24 * 60 * 60 * 1000;
    if (periodo === '15dias') limiteMs = 15 * 24 * 60 * 60 * 1000;
    if (periodo === 'mes') limiteMs = 30 * 24 * 60 * 60 * 1000;
    if (periodo === 'ano') limiteMs = 365 * 24 * 60 * 60 * 1000;

    const vendasPDF = vendasLocal.filter(v => {
        if (!v.dataIso) return false;
        const t = new Date(v.dataIso).getTime();
        return (agora - t) <= limiteMs;
    });

    doc.text(`Relatório de Vendas - Maria Bonita (${periodo.toUpperCase()})`, 14, 15);

    const rows = vendasPDF.map(v => [
        v.pedidoNum || '-',
        v.data || '-',
        v.tipoVenda || '-',
        v.itens || '-',
        v.pagamento || '-',
        `R$ ${(v.total || 0).toFixed(2)}`
    ]);

    if (typeof doc.autoTable === 'function') {
        doc.autoTable({
            startY: 20,
            head: [['#', 'Data/Hora', 'Tipo', 'Itens', 'Pagamento', 'Total']],
            body: rows,
        });
    }

    doc.save(`historico_vendas_${periodo}.pdf`);
}
