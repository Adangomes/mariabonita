// pdv/pdvState.js

let carrinho = [];
let produtosLocal = [];
let vendasLocal = [];

export function setPdvData(prod, vend) {
    produtosLocal = prod || [];
    vendasLocal = vend || [];
}

export function getCarrinho() {
    return carrinho;
}

export function setCarrinho(novoCarrinho) {
    carrinho = novoCarrinho;
}

export function getProdutosData() {
    return produtosLocal;
}

export function getVendasData() {
    return vendasLocal;
}
