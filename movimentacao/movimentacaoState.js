// movimentacao/movimentacaoState.js

let movimentacoes = [];

export function setMovimentacoes(data) {
    movimentacoes = data;
}

export function getMovimentacoes() {
    return [...movimentacoes];
}

export function adicionarMovimentacao(mov) {
    movimentacoes.unshift(mov);
}
