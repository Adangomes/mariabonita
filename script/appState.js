// script/appState.js
import { setProdutos } from "../estoque/index.js";
import { setReservasData } from "../reservas/index.js";
import { setPdvData } from "../pdv/index.js";
import { setVendasData } from "../historicos/index.js";

let produtos = [];
let reservas = [];
let vendas = [];

export function getProdutos() { return produtos; }
export function getReservas() { return reservas; }
export function getVendas() { return vendas; }

export function setProdutosState(novosProdutos) {
    produtos = novosProdutos;
    setProdutos(produtos);
    setReservasData(reservas, produtos);
    setPdvData(produtos, vendas);
}

export function setReservasState(novasReservas) {
    reservas = novasReservas;
    setReservasData(reservas, produtos);
}

export function setVendasState(novasVendas) {
    vendas = novasVendas;
    setVendasData(vendas);
    setPdvData(produtos, vendas);
}
