// funcionarios/permissoes.js

/**
 * Sistema de Permissões por Role
 * Define o que cada tipo de usuário pode fazer no sistema
 */

export const ROLES = {
    ADMIN: 'admin',
    GERENTE: 'gerente',
    VENDEDOR: 'vendedor',
    CONSULTOR: 'consultor'
};

export const PERMISSOES = {
    // Estoque
    ver_estoque: ['admin', 'gerente', 'vendedor'],
    editar_estoque: ['admin', 'gerente'],
    cadastrar_produto: ['admin', 'gerente'],
    deletar_produto: ['admin'],
    
    // PDV / Vendas
    acessar_pdv: ['admin', 'gerente', 'vendedor'],
    finalizar_venda: ['admin', 'gerente', 'vendedor'],
    gerar_desconto: ['admin', 'gerente'],
    
    // Reservas
    ver_reservas: ['admin', 'gerente', 'vendedor', 'consultor'],
    gerenciar_reservas: ['admin', 'gerente', 'vendedor'],
    deletar_reserva: ['admin', 'gerente'],
    
    // Funcionários
    ver_funcionarios: ['admin', 'gerente'],
    editar_funcionarios: ['admin'],
    cadastrar_funcionario: ['admin'],
    deletar_funcionario: ['admin'],
    
    // Relatórios
    ver_dashboard: ['admin', 'gerente'],
    ver_relatorios: ['admin', 'gerente'],
    ver_vendas_proprias: ['vendedor'],
    ver_todas_vendas: ['admin', 'gerente'],
    
    // Movimentação de Estoque
    registrar_entrada: ['admin', 'gerente'],
    registrar_saida: ['admin', 'gerente'],
    ver_movimentacao: ['admin', 'gerente'],
    
    // Configurações
    acessar_config: ['admin'],
    gerenciar_backup: ['admin']
};

/**
 * Verificar se um usuário tem uma permissão específica
 * @param {string} role - Role do usuário (admin, gerente, vendedor, consultor)
 * @param {string} permissao - Código da permissão
 * @returns {boolean}
 */
export function temPermissao(role, permissao) {
    return PERMISSOES[permissao]?.includes(role) || false;
}

/**
 * Obter todas as permissões de um role
 * @param {string} role - Role do usuário
 * @returns {Array}
 */
export function obterPermissoesRole(role) {
    const perms = [];
    for (const [permissao, roles] of Object.entries(PERMISSOES)) {
        if (roles.includes(role)) {
            perms.push(permissao);
        }
    }
    return perms;
}

/**
 * Descrições dos Roles para exibição
 */
export const ROLE_DESCRICOES = {
    admin: {
        nome: 'Administrador',
        descricao: 'Acesso total ao sistema, gestão de funcionários e relatórios',
        cor: '#dc2626'
    },
    gerente: {
        nome: 'Gerente',
        descricao: 'Gerencia estoque, vendas, e tem acesso a relatórios',
        cor: '#3b82f6'
    },
    vendedor: {
        nome: 'Vendedor',
        descricao: 'Acesso PDV, estoque e próprias vendas/comissões',
        cor: '#16a34a'
    },
    consultor: {
        nome: 'Consultor',
        descricao: 'Visualiza apenas reservas e cliente (sem edição)',
        cor: '#f59e0b'
    }
};
