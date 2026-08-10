// reservas/reservasState.js

let reservasLocal = [];
let produtosLocal = [];

export function setReservasData(res, prod) {
    reservasLocal = res || [];
    produtosLocal = prod || [];
}

export function getReservasData() {
    return reservasLocal;
}

export function getProdutosData() {
    return produtosLocal;
}
