// movimentacao/index.js
import { setMovimentacoes } from './movimentacaoState.js';
import { renderMovimentacoes, validarMovimentacao } from './movimentacaoUI.js';
import { registrarMovimentacaoService } from './movimentacaoService.js';
import { getProdutos } from '../estoque/estoqueState.js';

export { setMovimentacoes };

export function initMovimentacao(colMovimentacoes, colProdutos) {
    const form = document.getElementById('formMovimentacao');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const sku = document.getElementById('movSku').value.trim();
            const tipo = document.getElementById('movTipo').value;
            const quantidade = parseInt(document.getElementById('movQtd').value);
            const motivo = document.getElementById('movMotivo').value.trim();
            
            if (!validarMovimentacao(sku, tipo, quantidade, motivo)) {
                return;
            }
            
            try {
                // Buscar produto pelo SKU
                const produtos = getProdutos();
                const produto = produtos.find(p => p.sku === sku);
                
                if (!produto) {
                    alert('Produto com este SKU não encontrado');
                    return;
                }
                
                // Validar quantidade para saída
                if ((tipo === 'SAIDA' || tipo === 'DEVOLUCAO') && quantidade > produto.quantidade) {
                    alert(`Quantidade insuficiente em estoque. Disponível: ${produto.quantidade}`);
                    return;
                }
                
                // Preparar dados de movimentação
                const movimentacao = {
                    idProduto: produto.id,
                    sku: produto.sku,
                    descricaoProduto: produto.descricao,
                    tipoMovimentacao: tipo,
                    quantidade: quantidade,
                    quantidadeAnterior: produto.quantidade,
                    motivo: motivo || (tipo === 'ENTRADA' ? 'Reposição' : ''),
                    responsavel: document.getElementById('nomeOperador')?.textContent || 'Sistema',
                    notaFiscal: document.getElementById('movNotaFiscal').value.trim() || null
                };
                
                await registrarMovimentacaoService(colMovimentacoes, colProdutos, movimentacao);
                alert('Movimentação registrada com sucesso!');
                e.target.reset();
                renderMovimentacoes();
                
            } catch (err) {
                console.error("Erro ao registrar movimentação: ", err);
                alert('Erro ao registrar movimentação');
            }
        });
    }
    
    // Exposição global
    window.renderMovimentacoes = renderMovimentacoes;
}
