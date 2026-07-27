 import { db } from "./firebase.js";
import { addDoc, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let produtosLocal = [];

export function setProdutos(data) {
    produtosLocal = data;
}

export function initEstoque(colProdutos) {
    document.getElementById('formProduto').addEventListener('submit', async (e) => {
        e.preventDefault();
        let skuDigitado = document.getElementById('sku').value.trim();
        
        if(produtosLocal.some(p => p.sku === skuDigitado)) {
            alert('Já existe um produto cadastrado com esse Código/SKU!');
            return;
        }

        let produto = {
            sku: skuDigitado,
            descricao: document.getElementById('descricao').value.trim(),
            tamanho: document.getElementById('tamanho').value,
            cor: document.getElementById('cor').value.trim(),
            preco: parseFloat(document.getElementById('preco').value),
            quantidade: parseInt(document.getElementById('quantidade').value),
            dataCadastro: new Date().toISOString()
        };

        try {
            await addDoc(colProdutos, produto);
            e.target.reset();
            alert('Produto cadastrado com sucesso!');
        } catch (err) {
            console.error("Erro ao salvar produto: ", err);
        }
    });

    window.renderEstoque = function() {
        let tbody = document.querySelector('#tabelaEstoque tbody');
        tbody.innerHTML = '';
        
        let termo = document.getElementById('searchEstoque').value.trim().toLowerCase();
        let totalPecas = 0;
        let valorEstoque = 0;

        produtosLocal.forEach((p) => {
            totalPecas += p.quantidade;
            valorEstoque += (p.quantidade * p.preco);

            if(termo && !p.sku.toLowerCase().includes(termo) && !p.descricao.toLowerCase().includes(termo) && !p.cor.toLowerCase().includes(termo)) {
                return;
            }

            let status = p.quantidade <= 3 ? '<span class="badge low-stock">Baixo</span>' : '<span class="badge ok-stock">OK</span>';
            tbody.innerHTML += `
                <tr>
                    <td><strong>${p.sku}</strong></td>
                    <td>${p.descricao}</td>
                    <td>${p.tamanho}</td>
                    <td>${p.cor}</td>
                    <td>
                        R$ ${p.preco.toFixed(2)} 
                        <button class="btn btn-secondary btn-sm" onclick="alterarPrecoEstoque('${p.sku}')">✏️ Edit</button>
                    </td>
                    <td><strong>${p.quantidade} un</strong></td>
                    <td>${status}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="reporEstoque('${p.id}')">+ Repor</button>
                        <button class="btn btn-danger btn-sm" onclick="excluirProduto('${p.id}')">Excluir</button>
                    </td>
                </tr>`;
        });

        document.getElementById('metricTotalPecas').innerText = totalPecas;
        document.getElementById('metricValorEstoque').innerText = `R$ ${valorEstoque.toFixed(2)}`;
    };

    window.alterarPrecoEstoque = async function(sku) {
        let prodsDoSku = produtosLocal.filter(p => p.sku === sku);
        if(!prodsDoSku.length) return;

        let novoPreco = prompt(`Informe o novo Preço (R$) para TODOS os produtos com SKU ${sku}:`, prodsDoSku[0].preco);
        let val = parseFloat(novoPreco);

        if(!isNaN(val) && val >= 0) {
            for(let p of prodsDoSku) {
                await updateDoc(doc(db, "produtos", p.id), { preco: val });
            }
            alert('Preço atualizado com sucesso em todas as peças deste SKU!');
        }
    };

    window.reporEstoque = async function(idDoc) {
        let prod = produtosLocal.find(p => p.id === idDoc);
        if (!prod) return;

        let qtdAdd = prompt(`Quantas unidades deseja adicionar ao estoque de "${prod.descricao}"?`, "1");
        let num = parseInt(qtdAdd);
        if(num && num > 0) {
            await updateDoc(doc(db, "produtos", idDoc), { quantidade: prod.quantidade + num });
        }
    };

    window.excluirProduto = async function(idDoc) {
        if(confirm('Tem certeza que deseja excluir esta peça do estoque?')) {
            await deleteDoc(doc(db, "produtos", idDoc));
        }
    };
}
