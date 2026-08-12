// movimentacao/movimentacaoService.js
import { 
    addDoc, 
    updateDoc, 
    doc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * Registrar movimentação de estoque (entrada/saída)
 */
export async function registrarMovimentacaoService(colMovimentacoes, colProdutos, movimentacao) {
    try {
        // Salvar a movimentação
        const novaMovimentacao = {
            ...movimentacao,
            dataMovimentacao: new Date().toISOString()
        };
        
        await addDoc(colMovimentacoes, novaMovimentacao);
        
        // Se for entrada ou saída, atualizar estoque do produto
        if (movimentacao.tipoMovimentacao === 'ENTRADA' || movimentacao.tipoMovimentacao === 'SAIDA') {
            const prodRef = doc(colProdutos, movimentacao.idProduto);
            const novaQtd = movimentacao.tipoMovimentacao === 'ENTRADA' 
                ? movimentacao.quantidadeAnterior + movimentacao.quantidade
                : movimentacao.quantidadeAnterior - movimentacao.quantidade;
            
            await updateDoc(prodRef, {
                quantidade: Math.max(0, novaQtd)
            });
        }
        
        return { success: true };
    } catch (err) {
        console.error("Erro ao registrar movimentação: ", err);
        throw err;
    }
}
