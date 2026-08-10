// estoque/estoqueState.js

let produtosLocal = [];

export function setProdutos(data) {
    produtosLocal = data;
}

export function getProdutos() {
    return produtosLocal;
}
