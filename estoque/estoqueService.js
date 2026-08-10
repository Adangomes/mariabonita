// estoque/estoqueService.js
import { db } from "../firebase.js"; // Ajuste o caminho se necessário
import { addDoc, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export async function cadastrarProdutoService(colProdutos, produto) {
    return await addDoc(colProdutos, produto);
}

export async function atualizarPrecoPorSkuService(prodsDoSku, novoPreco) {
    for (let p of prodsDoSku) {
        await updateDoc(doc(db, "produtos", p.id), { preco: novoPreco });
    }
}

export async function reporEstoqueService(idDoc, novaQuantidade) {
    await updateDoc(doc(db, "produtos", idDoc), { quantidade: novaQuantidade });
}

export async function excluirProdutoService(idDoc) {
    await deleteDoc(doc(db, "produtos", idDoc));
}
