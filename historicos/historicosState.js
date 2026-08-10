// historicos/historicosState.js

let vendasLocal = [];

export function setVendasData(vendas) {
    vendasLocal = vendas;
}

export function getVendasData() {
    return vendasLocal;
}
