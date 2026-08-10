// reservas/reservasPrint.js
import { imprimirReserva } from "../impressoras/index.js";
import { getReservasData } from "./reservasState.js";

export function imprimirReservaViaObjeto(reservaObj) {
    if (!reservaObj || !reservaObj.itens) return;

    const itensFormatados = reservaObj.itens.map(i => ({
        codigo: i.sku,
        nome: i.desc,
        cor: i.tamanho,
        preco: i.totalItem
    }));

    imprimirReserva({
        cliente: reservaObj.cliente,
        observacao: `Origem: ${reservaObj.origem} | SDR: ${reservaObj.sdr}`,
        desconto: reservaObj.sinal || 0,
        total: reservaObj.totalGeral,
        itens: itensFormatados
    });
}

export function acaoImprimirReserva(idReserva) {
    const reservasLocal = getReservasData();
    const r = reservasLocal.find(x => x.id === idReserva);
    if (!r) return;
    imprimirReservaViaObjeto(r);
}
