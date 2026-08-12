// movimentacao/movimentacaoUI.js
import { getMovimentacoes } from './movimentacaoState.js';

const TIPO_CORES = {
    'ENTRADA': '#16a34a',
    'SAIDA': '#dc2626',
    'DEVOLUCAO': '#f59e0b',
    'AJUSTE': '#3b82f6'
};

/**
 * Renderizar histórico de movimentações
 */
export function renderMovimentacoes() {
    const tbody = document.querySelector('#tabelaMovimentacoes tbody');
    if (!tbody) return;
    
    const movimentacoes = getMovimentacoes();
    const filtroTipo = document.getElementById('filtroTipoMovimentacao')?.value || 'TODAS';
    const search = document.getElementById('searchMovimentacao')?.value.toLowerCase() || '';
    
    let filtradas = movimentacoes;
    
    if (filtroTipo !== 'TODAS') {
        filtradas = filtradas.filter(m => m.tipoMovimentacao === filtroTipo);
    }
    
    filtradas = filtradas.filter(m => 
        m.descricaoProduto.toLowerCase().includes(search) ||
        m.sku.toLowerCase().includes(search) ||
        (m.motivo && m.motivo.toLowerCase().includes(search))
    );
    
    tbody.innerHTML = filtradas.map(mov => {
        const data = new Date(mov.dataMovimentacao);
        const dataFormatada = data.toLocaleDateString('pt-BR');
        const horaFormatada = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        const cor = TIPO_CORES[mov.tipoMovimentacao] || '#64748b';
        
        return `
            <tr>
                <td style="font-size: 0.85rem; color: #64748b;">${dataFormatada} ${horaFormatada}</td>
                <td><strong>${mov.sku}</strong></td>
                <td>${mov.descricaoProduto}</td>
                <td>
                    <span style="background: ${cor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">
                        ${mov.tipoMovimentacao}
                    </span>
                </td>
                <td style="text-align: center; font-weight: bold;">${mov.quantidade}</td>
                <td style="text-align: center;">${mov.quantidadeAnterior} → ${mov.tipoMovimentacao === 'ENTRADA' ? mov.quantidadeAnterior + mov.quantidade : mov.quantidadeAnterior - mov.quantidade}</td>
                <td>${mov.motivo || '---'}</td>
                <td style="font-size: 0.85rem; color: #64748b;">${mov.responsavel || 'Sistema'}</td>
            </tr>
        `;
    }).join('');
}

/**
 * Validar dados de movimentação
 */
export function validarMovimentacao(sku, tipo, quantidade, motivo) {
    if (!sku || !sku.trim()) {
        alert('Informe o SKU do produto');
        return false;
    }
    
    if (!tipo || tipo === 'SELECIONE') {
        alert('Selecione o tipo de movimentação');
        return false;
    }
    
    if (!quantidade || quantidade <= 0) {
        alert('Informe uma quantidade válida (maior que 0)');
        return false;
    }
    
    if (tipo !== 'ENTRADA' && !motivo) {
        alert('Informe o motivo da saída/devolução');
        return false;
    }
    
    return true;
}
