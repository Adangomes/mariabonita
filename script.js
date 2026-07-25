import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    onSnapshot,
    query,
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configurações extraídas do seu projeto "maria"
const firebaseConfig = {
    apiKey: "AIzaSyCNGQDQ2LbVcebYwDEOgu7P5sKnGxP-ous",
    authDomain: "maria-7830.firebaseapp.com",
    projectId: "maria-7830",
    storageBucket: "maria-7830.appspot.com",
    messagingSenderId: "965687947792",
    appId: "1:965687947792:web:dd462ce0e7bd6c2fb29095"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referências das Coleções
const colProdutos = collection(db, "produtos");
const colVendas = collection(db, "vendas");
const colReservas = collection(db, "reservas");

let produtos = [];
let vendas = [];
let reservas = [];
let carrinho = [];

// =========================
// ONSNAPSHOT (Realtime DB)
// =========================
onSnapshot(colProdutos, (snapshot) => {
    produtos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderEstoque();
});

onSnapshot(colReservas, (snapshot) => {
    reservas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderReservas();
});

onSnapshot(colVendas, (snapshot) => {
    vendas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderHistorico();
});

// Alternar Seções
window.showSection = function(id) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.sidebar button').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(id).classList.add('active');
    document.getElementById(`btn-${id}`).classList.add('active');
    
    if(id === 'estoque') renderEstoque();
    if(id === 'reservas') renderReservas();
    if(id === 'pdv') {
        renderCarrinho();
        setTimeout(() => document.getElementById('barcodeSearch').focus(), 100);
    }
    if(id === 'historico') renderHistorico();
};

// Cadastrar Produto
document.getElementById('formProduto').addEventListener('submit', async (e) => {
    e.preventDefault();
    let skuDigitado = document.getElementById('sku').value.trim();
    
    if(produtos.some(p => p.sku === skuDigitado)) {
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

// Renderizar Estoque
window.renderEstoque = function() {
    let tbody = document.querySelector('#tabelaEstoque tbody');
    tbody.innerHTML = '';
    
    let termo = document.getElementById('searchEstoque').value.trim().toLowerCase();
    let totalPecas = 0;
    let valorEstoque = 0;

    produtos.forEach((p) => {
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
                <td>R$ ${p.preco.toFixed(2)}</td>
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

window.reporEstoque = async function(idDoc) {
    let prod = produtos.find(p => p.id === idDoc);
    if (!prod) return;

    let qtdAdd = prompt(`Quantas unidades deseja adicionar ao estoque de "${prod.descricao}"?`, "1");
    let num = parseInt(qtdAdd);
    if(num && num > 0) {
        const prodRef = doc(db, "produtos", idDoc);
        await updateDoc(prodRef, { quantidade: prod.quantidade + num });
    }
};

window.excluirProduto = async function(idDoc) {
    if(confirm('Tem certeza que deseja excluir esta peça do estoque?')) {
        await deleteDoc(doc(db, "produtos", idDoc));
    }
};

// =========================
// LÓGICA DE RESERVAS
// =========================
document.getElementById('formReserva').addEventListener('submit', async (e) => {
    e.preventDefault();

    let sku = document.getElementById('reservaSku').value.trim();
    let qtd = parseInt(document.getElementById('reservaQtd').value) || 1;
    let tipo = document.getElementById('reservaTipo').value;
    let nome = document.getElementById('reservaNome').value.trim();
    let sdr = document.getElementById('reservaSdr').value.trim();

    let prod = produtos.find(p => p.sku.toLowerCase() === sku.toLowerCase());

    if(!prod){
        alert("Código da peça não encontrado.");
        return;
    }

    if(prod.quantidade < qtd){
        alert("Estoque insuficiente.");
        return;
    }

    let total = prod.preco * qtd;
    let sinal = parseFloat(document.getElementById("valorSinal").value);

    if(isNaN(sinal)){
        alert("Informe o valor do sinal.");
        return;
    }

    if(sinal < total * 0.5){
        alert("O sinal mínimo deve ser 50% do valor da peça.");
        return;
    }

    if(sinal > total){
        alert("O sinal não pode ser maior que o valor da peça.");
        return;
    }

    // Atualiza estoque
    const prodRef = doc(db, "produtos", prod.id);
    await updateDoc(prodRef, { quantidade: prod.quantidade - qtd });

    let agora = new Date();

    await addDoc(colReservas, {
        dataHora: agora.toLocaleString("pt-BR"),
        cliente: nome,
        sdr: sdr,
        tipo: tipo,
        itemSku: prod.sku,
        itemDesc: prod.descricao,
        tamanho: prod.tamanho,
        qtd: qtd,
        precoUn: prod.preco,
        total: total,
        sinal: sinal,
        restante: total - sinal,
        formaSinal: document.getElementById("formaSinal").value,
        status: "PENDENTE"
    });

    e.target.reset();
    document.getElementById("reservaQtd").value = 1;
    alert("Reserva criada com sucesso.");
});

window.renderReservas = function(){
    let tbody = document.querySelector("#tabelaReservas tbody");
    tbody.innerHTML = "";

    reservas.filter(r => r.status === "PENDENTE").forEach(r => {
        tbody.innerHTML += `
        <tr>
            <td>${r.dataHora}</td>
            <td>${r.cliente}</td>
            <td>${r.sdr}</td>
            <td><span class="badge online-tag">${r.tipo}</span></td>
            <td>${r.qtd}x ${r.itemDesc}</td>
            <td>R$ ${r.total.toFixed(2)}</td>
            <td>
                <strong>Sinal:</strong> R$ ${r.sinal.toFixed(2)}<br>
                <strong>Saldo:</strong> R$ ${r.restante.toFixed(2)}
            </td>
            <td>
                <button class="btn btn-success btn-sm" onclick="concluirVendaReserva('${r.id}')">Concluir Venda</button>
                <button class="btn btn-danger btn-sm" onclick="cancelarReserva('${r.id}')">Cancelar</button>
            </td>
        </tr>`;
    });
};

window.concluirVendaReserva = async function(idReserva){
    let r = reservas.find(x => x.id === idReserva);
    if(!r) return;

    let pagamentoFinal;
    let detalhesPagamento;

    if(r.restante <= 0){
        pagamentoFinal = "Pago Integral (" + r.formaSinal + ")";
        detalhesPagamento = `SDR: ${r.sdr}\nCliente: ${r.cliente}\nSinal: R$ ${r.sinal.toFixed(2)} (${r.formaSinal})\nPagamento Integral na Reserva`;
    } else {
        pagamentoFinal = prompt(`Saldo restante: R$ ${r.restante.toFixed(2)}\nInforme a forma de pagamento:\nPIX\nCartão de Crédito\nCartão de Débito\nDinheiro`, "PIX");
        if(!pagamentoFinal) return;

        detalhesPagamento = `SDR: ${r.sdr}\nCliente: ${r.cliente}\nSinal: R$ ${r.sinal.toFixed(2)} (${r.formaSinal})\nRestante: R$ ${r.restante.toFixed(2)} (${pagamentoFinal})`;
    }

    await addDoc(colVendas, {
        pedidoNum: vendas.length + 1,
        dataIso: new Date().toISOString(),
        data: new Date().toLocaleString("pt-BR"),
        tipoVenda: "VENDA ONLINE",
        detalhes: detalhesPagamento,
        itens: `${r.qtd}x ${r.itemDesc} (${r.tamanho})`,
        totalPecas: r.qtd,
        pagamento: r.restante <= 0 ? "Integral (" + r.formaSinal + ")" : `${r.formaSinal} + ${pagamentoFinal}`,
        desconto: "R$ 0.00",
        total: r.total
    });

    await updateDoc(doc(db, "reservas", idReserva), { status: "CONCLUIDA" });
    alert("Venda concluída com sucesso.");
};

window.cancelarReserva = async function(idReserva){
    if(!confirm("Deseja cancelar esta reserva?")) return;

    let r = reservas.find(x => x.id === idReserva);
    if(!r) return;

    let prod = produtos.find(p => p.sku === r.itemSku);
    if(prod){
        await updateDoc(doc(db, "produtos", prod.id), { quantidade: prod.quantidade + r.qtd });
    }

    await updateDoc(doc(db, "reservas", idReserva), { status: "CANCELADA" });
    alert("Reserva cancelada.");
};

// =========================
// LÓGICA DO PDV
// =========================
document.getElementById('barcodeSearch').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') buscarEAdicionar();
});

window.buscarEAdicionar = function() {
    let input = document.getElementById('barcodeSearch');
    let termo = input.value.trim().toLowerCase();
    let qtd = parseInt(document.getElementById('qtdVenda').value) || 1;

    if(!termo) return;

    let prod = produtos.find(p => p.sku.toLowerCase() === termo || p.descricao.toLowerCase().includes(termo));

    if(!prod) {
        alert('Produto não encontrado!');
        input.select();
        return;
    }

    let itemNoCarrinho = carrinho.find(c => c.produto.id === prod.id);
    let qtdTotalNoCarrinho = (itemNoCarrinho ? itemNoCarrinho.qtd : 0) + qtd;

    if(qtdTotalNoCarrinho > prod.quantidade) {
        alert(`Estoque insuficiente! Saldo atual no estoque: ${prod.quantidade}`);
        return;
    }

    if(itemNoCarrinho) {
        itemNoCarrinho.qtd += qtd;
    } else {
        carrinho.push({ produto: prod, qtd });
    }

    input.value = '';
    document.getElementById('qtdVenda').value = 1;
    input.focus();
    renderCarrinho();
};

window.renderCarrinho = function() {
    let tbody = document.querySelector('#tabelaCarrinho tbody');
    tbody.innerHTML = '';
    let subtotal = 0;

    carrinho.forEach((item, cIndex) => {
        let itemSubtotal = item.qtd * item.produto.preco;
        subtotal += itemSubtotal;

        tbody.innerHTML += `
            <tr>
                <td>${item.produto.descricao} (${item.produto.tamanho}/${item.produto.cor})</td>
                <td>
                    <button class="btn btn-sm" onclick="alterarQtdCarrinho(${cIndex}, -1)">-</button>
                    ${item.qtd}
                    <button class="btn btn-sm" onclick="alterarQtdCarrinho(${cIndex}, 1)">+</button>
                </td>
                <td>R$ ${item.produto.preco.toFixed(2)}</td>
                <td>R$ ${itemSubtotal.toFixed(2)}</td>
                <td><button class="btn btn-danger btn-sm" onclick="removerDoCarrinho(${cIndex})">✕</button></td>
            </tr>`;
    });

    let descValorInput = parseFloat(document.getElementById('descontoValor').value) || 0;
    let descTipo = document.getElementById('descontoTipo').value;
    let descontoFinal = descTipo === 'R$' ? descValorInput : (subtotal * descValorInput) / 100;

    if(descontoFinal > subtotal) descontoFinal = subtotal;

    let totalFinal = subtotal - descontoFinal;

    document.getElementById('subtotalVenda').innerText = subtotal.toFixed(2);
    document.getElementById('descontoCalculado').innerText = descontoFinal.toFixed(2);
    document.getElementById('totalVenda').innerText = totalFinal.toFixed(2);
};

window.alterarQtdCarrinho = function(cIndex, delta) {
    let item = carrinho[cIndex];
    let novaQtd = item.qtd + delta;

    if(novaQtd <= 0) { removerDoCarrinho(cIndex); return; }
    
    let prodOriginal = produtos.find(p => p.id === item.produto.id);
    if(novaQtd > prodOriginal.quantidade) { alert('Limite de estoque atingido!'); return; }

    item.qtd = novaQtd;
    renderCarrinho();
};

window.removerDoCarrinho = function(cIndex) {
    carrinho.splice(cIndex, 1);
    renderCarrinho();
};

window.limparCarrinho = function() {
    carrinho = [];
    document.getElementById('descontoValor').value = '';
    renderCarrinho();
};

window.finalizarVenda = async function() {
    if(carrinho.length === 0) { alert('O carrinho está vazio!'); return; }

    let total = parseFloat(document.getElementById('totalVenda').innerText);
    let descontoDesc = document.getElementById('descontoCalculado').innerText;
    let formaPagamento = document.getElementById('pagamento').value;
    let totalPecasVenda = carrinho.reduce((acc, i) => acc + i.qtd, 0);
    let itensStr = carrinho.map(i => `${i.qtd}x ${i.produto.descricao} (${i.produto.tamanho})`).join(', ');

    // Abater estoque no Firestore
    for (let item of carrinho) {
        let prodOriginal = produtos.find(p => p.id === item.produto.id);
        if(prodOriginal) {
            await updateDoc(doc(db, "produtos", item.produto.id), {
                quantidade: prodOriginal.quantidade - item.qtd
            });
        }
    }

    await addDoc(colVendas, {
        pedidoNum: vendas.length + 1,
        dataIso: new Date().toISOString(),
        data: new Date().toLocaleString('pt-BR'),
        tipoVenda: 'LOJA FÍSICA',
        detalhes: 'Balcão',
        itens: itensStr,
        totalPecas: totalPecasVenda,
        pagamento: formaPagamento,
        desconto: `R$ ${descontoDesc}`,
        total
    });

    limparCarrinho();
    alert('Venda realizada com sucesso!');
    showSection('pdv');
};

// =========================
// HISTÓRICO E FILTROS
// =========================
window.renderHistorico = function() {
    let tbody = document.querySelector('#tabelaHistorico tbody');
    tbody.innerHTML = '';
    
    let filtroMesAno = document.getElementById('filtroMesAno').value;
    let faturamento = 0;
    let pecasVendidas = 0;

    let vendasFiltradas = vendas.filter(v => {
        if(!filtroMesAno) return true;
        let dataVenda = v.dataIso ? v.dataIso.substring(0, 7) : "";
        return dataVenda === filtroMesAno;
    });

    vendasFiltradas.slice().reverse().forEach((v, index) => {
        faturamento += v.total;
        pecasVendidas += (v.totalPecas || 1);

        let badgeTipo = v.tipoVenda === 'VENDA ONLINE' 
            ? '<span class="badge online-tag">VENDA ONLINE</span>' 
            : '<span class="badge balcao-tag">LOJA FÍSICA</span>';

        tbody.innerHTML += `
            <tr>
                <td><strong>#${v.pedidoNum || index + 1}</strong></td>
                <td><small>${v.data}</small></td>
                <td>${badgeTipo}</td>
                <td><small>${v.detalhes || 'Balcão'}</small></td>
                <td>${v.itens}</td>
                <td>${v.pagamento}</td>
                <td style="color:#dc2626;">-${v.desconto || 'R$ 0.00'}</td>
                <td><strong>R$ ${v.total.toFixed(2)}</strong></td>
            </tr>`;
    });

    document.getElementById('metricFaturamento').innerText = `R$ ${faturamento.toFixed(2)}`;
    document.getElementById('metricPecasVendidas').innerText = pecasVendidas;
};

window.limparFiltroData = function() {
    document.getElementById('filtroMesAno').value = '';
    renderHistorico();
};

// Atalhos do PDV
document.addEventListener('keydown', e => {
    if(!document.getElementById('pdv').classList.contains('active')) return;
    if(e.key === 'F2') { e.preventDefault(); document.getElementById('barcodeSearch').focus(); }
    if(e.key === 'F4') { e.preventDefault(); limparCarrinho(); }
    if(e.key === 'F8') { e.preventDefault(); finalizarVenda(); }
});
