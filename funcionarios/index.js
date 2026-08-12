// funcionarios/index.js
import { setFuncionarios, getFuncionarios } from './funcionariosState.js';
import { renderFuncionarios, fecharModalFuncionario } from './funcionariosUI.js';
import { 
    cadastrarFuncionarioService, 
    desativarFuncionarioService 
} from './funcionariosService.js';
import { db } from '../firebase.js';

export { setFuncionarios };

export function initFuncionarios(colFuncionarios) {
    const formFunc = document.getElementById('formFuncionario');
    
    if (formFunc) {
        formFunc.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const funcId = document.getElementById('funcId').value;
            const funcionario = {
                nome: document.getElementById('funcNome').value.trim(),
                email: document.getElementById('funcEmail').value.trim(),
                telefone: document.getElementById('funcTelefone').value.trim(),
                cargo: document.getElementById('funcCargo').value.trim(),
                role: document.getElementById('funcRole').value,
                comissao: parseFloat(document.getElementById('funcComissao').value) || 0
            };
            
            try {
                if (funcId) {
                    // Atualizar funcionário existente (implementar depois)
                    alert('Funcionalidade de edição em desenvolvimento');
                } else {
                    // Verificar se e-mail já existe
                    const funcionarios = getFuncionarios();
                    if (funcionarios.some(f => f.email === funcionario.email)) {
                        alert('Este e-mail já está cadastrado!');
                        return;
                    }
                    
                    await cadastrarFuncionarioService(colFuncionarios, funcionario);
                    alert('Funcionário cadastrado com sucesso!');
                    e.target.reset();
                    fecharModalFuncionario();
                    renderFuncionarios();
                }
            } catch (err) {
                console.error("Erro ao salvar funcionário: ", err);
                alert('Erro ao salvar funcionário');
            }
        });
    }
    
    // Exposição global para chamadas onclick
    window.renderFuncionarios = renderFuncionarios;
    
    window.editarFuncionario = function(idFunc) {
        const funcionarios = getFuncionarios();
        const func = funcionarios.find(f => f.id === idFunc);
        if (func) {
            // Implementar edição depois
            alert('Funcionalidade de edição em desenvolvimento');
        }
    };
    
    window.desativarFuncionario = async function(idFunc, nome) {
        if (confirm(`Desativar funcionário ${nome}?`)) {
            try {
                await desativarFuncionarioService(db, idFunc);
                alert('Funcionário desativado com sucesso!');
                renderFuncionarios();
            } catch (err) {
                alert('Erro ao desativar funcionário');
            }
        }
    };
}
