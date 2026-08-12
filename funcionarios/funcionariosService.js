// funcionarios/funcionariosService.js
import { 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * Cadastrar novo funcionário
 */
export async function cadastrarFuncionarioService(colFuncionarios, funcionario) {
    try {
        const novoFunc = {
            ...funcionario,
            dataCadastro: new Date().toISOString(),
            ativo: true
        };
        await addDoc(colFuncionarios, novoFunc);
        return { success: true };
    } catch (err) {
        console.error("Erro ao cadastrar funcionário: ", err);
        throw err;
    }
}

/**
 * Atualizar dados do funcionário
 */
export async function atualizarFuncionarioService(funcionario) {
    try {
        const ref = doc(funcionario.db, "funcionarios", funcionario.id);
        await updateDoc(ref, {
            nome: funcionario.nome,
            email: funcionario.email,
            telefone: funcionario.telefone,
            cargo: funcionario.cargo,
            role: funcionario.role,
            comissao: funcionario.comissao,
            dataAtualizacao: new Date().toISOString()
        });
        return { success: true };
    } catch (err) {
        console.error("Erro ao atualizar funcionário: ", err);
        throw err;
    }
}

/**
 * Desativar funcionário (soft delete)
 */
export async function desativarFuncionarioService(db, idFunc) {
    try {
        const ref = doc(db, "funcionarios", idFunc);
        await updateDoc(ref, {
            ativo: false,
            dataDesativacao: new Date().toISOString()
        });
        return { success: true };
    } catch (err) {
        console.error("Erro ao desativar funcionário: ", err);
        throw err;
    }
}

/**
 * Deletar funcionário permanentemente
 */
export async function deletarFuncionarioService(db, idFunc) {
    try {
        const ref = doc(db, "funcionarios", idFunc);
        await deleteDoc(ref);
        return { success: true };
    } catch (err) {
        console.error("Erro ao deletar funcionário: ", err);
        throw err;
    }
}
