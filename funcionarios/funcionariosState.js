// funcionarios/funcionariosState.js

let funcionarios = [];

export function setFuncionarios(data) {
    funcionarios = data;
}

export function getFuncionarios() {
    return [...funcionarios];
}

export function findFuncionarioById(id) {
    return funcionarios.find(f => f.id === id);
}

export function findFuncionarioByEmail(email) {
    return funcionarios.find(f => f.email === email);
}
