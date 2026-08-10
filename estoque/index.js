// estoque/index.js
import { setProdutos, getProdutos } from "./estoqueState.js";
import { renderEstoque } from "./estoqueUI.js";
import { 
    cadastrarProdutoService, 
    atualizarPrecoPorSkuService, 
    reporEstoqueService, 
    excluirProdutoService 
} from "./estoqueService.js";

export { setProdutos };

export function initEstoque(colProdutos) {
    const formProduto = document.getElementById('formProduto');

    if (formProduto) {
        formProduto.addEventListener('submit', async (e) => {
            e.preventDefault();
            const skuDigitado = document.getElementById('sku').value.trim();
            const produtos = getProdutos();

            if (produtos.some(p => p.sku === skuDigitado)) {
                alert('Já existe um produto cadastrado com esse Código/SKU!');
                return;
            }

            const produto = {
                sku: skuDigitado,
                descricao: document.getElementById('descricao').value.trim(),
                tamanho: document.getElementById('tamanho').value,
                cor: document.getElementById('cor').value.trim(),
                preco: parseFloat(document.getElementById('preco').value),
                quantidade: parseInt(document.getElementById('quantidade').value),
                dataCadastro: new Date().toISOString()
            };

            try {
                await cadastrarProdutoService(colProdutos, produto);
                e.target.reset();
                alert('Produto cadastrado com sucesso!');
            } catch (err) {
                console.error("Erro ao salvar produto: ", err);
            }
        });
    }

    // Exposição global para chamadas via onclick ou eventos no HTML
    window.renderEstoque = renderEstoque;

    window.alterarPrecoEstoque = async function(sku) {
        const produtos = getProdutos();
        const prodsDoSku = produtos.filter(p => p.sku === sku);
        if (!prodsDoSku.length) return;

        const novoPreco = prompt(`Informe o novo Preço (R$) para TODOS os produtos com SKU ${sku}:`, prodsDoSku[0].preco);
        const val = parseFloat(novoPreco);

        if (!isNaN(val) && val >= 0) {
            await atualizarPrecoPorSkuService(prodsDoSku, val);
            alert('Preço atualizado com sucesso em todas as peças deste SKU!');
        }
    };

    window.reporEstoque = async function(idDoc) {
        const produtos = getProdutos();
        const prod = produtos.find(p => p.id === idDoc);
        if (!prod) return;

        const qtdAdd = prompt(`Quantas unidades deseja adicionar ao estoque de "${prod.descricao}"?`, "1");
        const num = parseInt(qtdAdd);

        if (num && num > 0) {
            await reporEstoqueService(idDoc, prod.quantidade + num);
        }
    };

    window.excluirProduto = async function(idDoc) {
        if (confirm('Tem certeza que deseja excluir esta peça do estoque?')) {
            await excluirProdutoService(idDoc);
        }
    };
}
