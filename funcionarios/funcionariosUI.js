// funcionarios/funcionariosUI.js
import { getFuncionarios } from './funcionariosState.js';
import { ROLE_DESCRICOES } from './permissoes.js';

/**
 * Renderizar lista de funcionários
 */
export function renderFuncionarios() {
    const tbody = document.querySelector('#tabelaFuncionarios tbody');
    if (!tbody) return;
    
    const funcionarios = getFuncionarios();
    const search = document.getElementById('searchFuncionario')?.value.toLowerCase() || '';
    
    const filtrados = funcionarios.filter(f => 
        (f.nome.toLowerCase().includes(search) || 
         f.email.toLowerCase().includes(search)) &&
        f.ativo !== false
    );
    
    tbody.innerHTML = filtrados.map(func => {
        const roleInfo = ROLE_DESCRICOES[func.role] || {};
        const dataCad = new Date(func.dataCadastro).toLocaleDateString('pt-BR');
        
        return `
            <tr class="func-row" data-id="${func.id}">
                <td><strong>${func.nome}</strong></td>
                <td>${func.email}</td>
                <td>${func.telefone || '---'}</td>
                <td>${func.cargo || 'N/A'}</td>
                <td>
                    <span class="badge-role" style="background: ${roleInfo.cor}; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">
                        ${roleInfo.nome || func.role}
                    </span>
                </td>
                <td>${func.comissao ? func.comissao + '%' : 'Fixa'}</td>
                <td style="font-size: 0.85rem; color: #64748b;">${dataCad}</td>
                <td>
                    <button class="btn btn-sm" style="background: #3b82f6; color: white; padding: 4px 8px; margin-right: 4px;" onclick="editarFuncionario('${func.id}')">Editar</button>
                    <button class="btn btn-sm" style="background: #dc2626; color: white; padding: 4px 8px;" onclick="desativarFuncionario('${func.id}', '${func.nome}')">Desativar</button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Atualizar métricas
    document.getElementById('metricTotalFunc').textContent = filtrados.length;
}

/**
 * Abrir modal de edição de funcionário
 */
export function abrirModalFuncionario(funcionario = null) {
    const modal = document.getElementById('modalFuncionario');
    const form = document.getElementById('formFuncionario');
    const titulo = document.getElementById('tituloModal');
    
    if (!modal) return;
    
    if (funcionario) {
        titulo.textContent = 'Editar Funcionário';
        document.getElementById('funcId').value = funcionario.id;
        document.getElementById('funcNome').value = funcionario.nome;
        document.getElementById('funcEmail').value = funcionario.email;
        document.getElementById('funcTelefone').value = funcionario.telefone || '';
        document.getElementById('funcCargo').value = funcionario.cargo || '';
        document.getElementById('funcRole').value = funcionario.role;
        document.getElementById('funcComissao').value = funcionario.comissao || '';
    } else {
        titulo.textContent = 'Novo Funcionário';
        form.reset();
        document.getElementById('funcId').value = '';
    }
    
    modal.style.display = 'flex';
}

/**
 * Fechar modal de funcionário
 */
export function fecharModalFuncionario() {
    const modal = document.getElementById('modalFuncionario');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Exibir descrição da role no hover
 */
export function mostrarDescricaoRole(role) {
    const info = ROLE_DESCRICOES[role];
    if (info) {
        alert(`${info.nome}\n\n${info.descricao}`);
    }
}
