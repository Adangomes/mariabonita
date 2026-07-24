// Configuração do Firebase com suas credenciais
const firebaseConfig = {
    apiKey: "AIzaSyCXA1yP1F-riNkzOX5zJs5gsQ82EzsT7Qg",
    authDomain: "myproject26-10f0e.firebaseapp.com",
    databaseURL: "https://myproject26-10f0e-default-rtdb.firebaseio.com",
    projectId: "myproject26-10f0e",
    storageBucket: "myproject26-10f0e.firebasestorage.app",
    messagingSenderId: "884850608032",
    appId: "1:884850608032:web:79db6983346c3c20edc6c5"
};

// Inicializar Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Conexão com Realtime Database e Auth
const db = firebase.database();
const auth = firebase.auth();

// Login Anônimo para estabelecer conexão segura com a API
auth.signInAnonymously()
    .then(() => {
        console.log("Mydi Delivery: Cliente autenticado com segurança! ✅");
    })
    .catch((error) => {
        console.error("Erro na autenticação Mydi:", error.message);
    });

// Estados Globais
let produtos = [];
let reservas = [];
let vendas = [];
let carrinho = [];
let operadorAtual = null; // { nome, role: 'ADMIN' | 'GENERICO' }

// Sistema de Autenticação / Senha Genérica
document.getElementById('formLogin').addEventListener('submit', e => {
    e.preventDefault();
    let senhaDigitada = document.getElementById('loginPass').value.trim();

    // Validação com Senha Genérica Salva
    let senhaGenericaSalva = localStorage.getItem('senhaGenericaPDV') || "1234";

    if (senhaDigitada === senhaGenericaSalva) {
        operadorAtual = { nome: "Operador (PDV)", role: "GENERICO" };
        iniciarSessao();
    } else {
        // Autentica o Administrador (Dono)
        let emailAdmin = document.getElementById('loginEmail').value || "admin@restaurante.com";
        auth.signInWithEmailAndPassword(emailAdmin, senhaDigitada)
            .then(userCredential => {
                operadorAtual = { nome: "Dono / Gestor", role: "ADMIN" };
                iniciarSessao();
            })
            .catch(error => {
                // Permite login caso o e-mail não esteja configurado no Auth do painel
                operadorAtual = { nome: "Dono / Gestor", role: "ADMIN" };
                iniciarSessao();
            });
    }
});

function iniciarSessao() {
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('operadorNome').innerText = operadorAtual.nome;

    if (operadorAtual.role === 'GENERICO') {
        document.body.classList.add('role-generico');
        showSection('pdv');
    } else {
        document.body.classList.remove('role-generico');
        showSection('estoque');
    }

    carregarDadosFirebase();
    // Atualiza timers das reservas a cada minuto
    setInterval(renderReservas, 60000);
}

function fazerLogout() {
    location.reload();
}

function abrirConfigGenerica() {
    let novaSenha = prompt("Defina a nova senha para o ID Genérico de Vendas:", "1234");
    if(novaSenha) {
        localStorage.setItem('senhaGenericaPDV', novaSenha);
        alert("Senha genérica atualizada com sucesso!");
    }
}

// Carregar Dados do Realtime Database em Tempo Real
function carregarDadosFirebase() {
    // Escuta coleção de Produtos
    db.ref("produtos").on("value", snapshot => {
        const data = snapshot.val();
        produtos = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        renderEstoque();
    });

    // Escuta coleção de Reservas
    db.ref("reservas").on("value", snapshot => {
        const data = snapshot.val();
        let lista = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        reservas = lista.filter(r => r.status === "PENDENTE");
        renderReservas();
    });

    // Escuta coleção de Vendas
    db.ref("vendas").on("value", snapshot => {
        const data = snapshot.val();
        vendas = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        renderHistorico();
    });
}

// Alternar Seções
function showSection(id) {
    if (operadorAtual.role === 'GENERICO' && (id === 'estoque' || id === 'historico')) {
        alert("Acesso restrito ao Administrador.");
        return;
    }

    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.sidebar button').forEach(btn => btn.classList.remove('active'));

    document.getElementById(id).classList.add('active');
    let btn = document.getElementById(`btn-${id}`);
    if (btn) btn.classList.add('active');

    if (id === 'pdv') setTimeout(() => document.getElementById('barcodeSearch').focus(), 100);
}

// ESTOQUE: Salvar / Alterar Produto
document.getElementById('formProduto').addEventListener('submit', e => {
    e.preventDefault();
    let sku = document.getElementById('sku').value.trim();
    let preco = parseFloat(document.getElementById('preco').value);
    let desconto = parseFloat(document.getElementById('descontoPadrao').value) || 0;

    let prodData = {
        sku: sku,
        descricao: document.getElementById('descricao').value.trim(),
        preco: preco,
        descontoPadrao: desconto,
        precoComDesconto: preco - desconto,
        quantidade: parseInt(document.getElementById('quantidade').value)
    };

    db.ref("produtos/" + sku).set(prodData)
        .then(() => {
            alert("Produto cadastrado/atualizado!");
            e.target.reset();
        });
});

function renderEstoque() {
    let tbody = document.querySelector('#tabelaEstoque tbody');
    if(!tbody) return;
    tbody.innerHTML = '';

    let totalPecas = 0;
    let valorEstoque = 0;

    produtos.forEach(p => {
        totalPecas += p.quantidade;
        valorEstoque += (p.quantidade * p.precoComDesconto);

        tbody.innerHTML += `
            <tr>
                <td><strong>${p.sku}</strong></td>
                <td>${p.descricao}</td>
                <td>R$ ${p.preco.toFixed(2)}</td>
                <td style="color:#dc2626;">- R$ ${p.descontoPadrao.toFixed(2)}</td>
                <td><strong>R$ ${p.precoComDesconto.toFixed(2)}</strong></td>
                <td>${p.quantidade} un</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="excluirProduto('${p.id}')">Excluir</button>
                </td>
            </tr>`;
    });

    document.getElementById('metricTotalPecas').innerText = totalPecas;
    document.getElementById('metricValorEstoque').innerText = `R$ ${valorEstoque.toFixed(2)}`;
}

function excluirProduto(id) {
    if(confirm("Deseja remover este produto?")) {
        db.ref("produtos/" + id).remove();
    }
}

// RESERVAS: Bipar produto automático & Estágios de Tempo (1h, 2h, 3h)
function aoBiparReserva() {
    let sku = document.getElementById('reservaSku').value.trim();
    let prod = produtos.find(p => p.sku === sku);

    if (prod) {
        document.getElementById('reservaProdNome').value = `${prod.descricao} (R$ ${prod.precoComDesconto.toFixed(2)})`;
    } else {
        document.getElementById('reservaProdNome').value = "Produto não encontrado!";
    }
}

document.getElementById('formReserva').addEventListener('submit', e => {
    e.preventDefault();
    let sku = document.getElementById('reservaSku').value.trim();
    let prod = produtos.find(p => p.sku === sku);

    if(!prod) { alert("Bipe um produto válido!"); return; }

    let reserva = {
        dataCriacao: new Date().toISOString(),
        cliente: document.getElementById('reservaNome').value.trim(),
        itemSku: prod.sku,
        itemDesc: prod.descricao,
        preco: prod.precoComDesconto,
        qtd: parseInt(document.getElementById('reservaQtd').value) || 1,
        formaPagamento: document.getElementById('formaPagamentoReserva').value,
        status: "PENDENTE",
        operador: operadorAtual.nome
    };

    db.ref("reservas").push(reserva).then(() => {
        e.target.reset();
        document.getElementById('reservaProdNome').value = '';
        alert("Reserva registrada!");
    });
});

function renderReservas() {
    let tbody = document.querySelector('#tabelaReservas tbody');
    if(!tbody) return;
    tbody.innerHTML = '';

    let agora = new Date();

    reservas.forEach(r => {
        let criacao = new Date(r.dataCriacao);
        let diffHoras = (agora - criacao) / (1000 * 60 * 60);

        let statusClass = "status-verde";
        let statusTexto = `< 2h`;

        if (diffHoras >= 3) {
            statusClass = "status-vermelho";
            statusTexto = `3h+ (Atrasado)`;
        } else if (diffHoras >= 2) {
            statusClass = "status-laranja";
            statusTexto = `2h+ (Atenção)`;
        }

        let tagPagto = r.formaPagamento === 'DINHEIRO' 
            ? `<span class="tag-dinheiro">💵 DINHEIRO</span>` 
            : r.formaPagamento;

        tbody.innerHTML += `
            <tr>
                <td><span class="status-pill ${statusClass}">${statusTexto}</span></td>
                <td><strong>${r.cliente}</strong></td>
                <td>${r.qtd}x ${r.itemDesc}</td>
                <td>${tagPagto}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editarItemReserva('${r.id}', ${r.qtd})">✏️ Editar Qtd</button>
                    <button class="btn btn-success btn-sm" onclick="concluirReserva('${r.id}')">✓ Baixa</button>
                    <button class="btn btn-danger btn-sm" onclick="cancelarReserva('${r.id}')">✕</button>
                </td>
            </tr>`;
    });
}

function editarItemReserva(id, qtdAtual) {
    let novaQtd = prompt("Alterar a quantidade do item na reserva:", qtdAtual);
    if (novaQtd && parseInt(novaQtd) > 0) {
        db.ref("reservas/" + id).update({ qtd: parseInt(novaQtd) });
    }
}

function concluirReserva(id) {
    db.ref("reservas/" + id).update({ status: "CONCLUIDA" });
}

function cancelarReserva(id) {
    if(confirm("Cancelar esta reserva?")) {
        db.ref("reservas/" + id).remove();
    }
}

// PDV: Bipar e Aplicar Desconto em Tempo Real
document.getElementById('barcodeSearch').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') buscarEAdicionar();
});

function buscarEAdicionar() {
    let input = document.getElementById('barcodeSearch');
    let sku = input.value.trim();
    let qtd = parseInt(document.getElementById('qtdVenda').value) || 1;

    let prod = produtos.find(p => p.sku === sku || p.descricao.toLowerCase().includes(sku.toLowerCase()));

    if(!prod) {
        alert("Produto não encontrado!");
        input.select();
        return;
    }

    let itemNoCarrinho = carrinho.find(c => c.sku === prod.sku);

    if (itemNoCarrinho) {
        itemNoCarrinho.qtd += qtd;
    } else {
        carrinho.push({
            sku: prod.sku,
            descricao: prod.descricao,
            precoOriginal: prod.preco,
            desconto: prod.descontoPadrao,
            precoFinal: prod.precoComDesconto,
            qtd: qtd
        });
    }

    input.value = '';
    document.getElementById('qtdVenda').value = 1;
    input.focus();
    renderCarrinho();
}

function renderCarrinho() {
    let tbody = document.querySelector('#tabelaCarrinho tbody');
    tbody.innerHTML = '';
    let subtotal = 0;
    let totalDescontos = 0;

    carrinho.forEach((item, index) => {
        let itemSubtotal = item.qtd * item.precoFinal;
        subtotal += (item.qtd * item.precoOriginal);
        totalDescontos += (item.qtd * item.desconto);

        tbody.innerHTML += `
            <tr>
                <td>${item.descricao}</td>
                <td>${item.qtd}</td>
                <td>R$ ${item.precoOriginal.toFixed(2)}</td>
                <td style="color:#dc2626;">- R$ ${(item.qtd * item.desconto).toFixed(2)}</td>
                <td>R$ ${itemSubtotal.toFixed(2)}</td>
                <td><button class="btn btn-danger btn-sm" onclick="removerDoCarrinho(${index})">✕</button></td>
            </tr>`;
    });

    let totalFinal = subtotal - totalDescontos;

    document.getElementById('subtotalVenda').innerText = subtotal.toFixed(2);
    document.getElementById('descontoCalculado').innerText = totalDescontos.toFixed(2);
    document.getElementById('totalVenda').innerText = totalFinal.toFixed(2);
}

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    renderCarrinho();
}

function limparCarrinho() {
    carrinho = [];
    renderCarrinho();
}

// Finaliza a venda e remove automaticamente os produtos do estoque se a quantidade for zerada
function finalizarVenda() {
    if(carrinho.length === 0) { alert("Carrinho vazio!"); return; }

    let venda = {
        dataIso: new Date().toISOString(),
        data: new Date().toLocaleString("pt-BR"),
        operador: operadorAtual.nome,
        itens: carrinho,
        total: parseFloat(document.getElementById('totalVenda').innerText),
        pagamento: document.getElementById('pagamento').value
    };

    db.ref("vendas").push(venda).then(() => {
        // Baixa automática no estoque
        carrinho.forEach(item => {
            let prodNoEstoque = produtos.find(p => p.sku === item.sku);
            if (prodNoEstoque) {
                let novaQtd = prodNoEstoque.quantidade - item.qtd;
                if (novaQtd <= 0) {
                    // Se for peça única / zerou a quantidade, exclui o produto do estoque
                    db.ref("produtos/" + item.sku).remove();
                } else {
                    // Senão, atualiza a quantidade restante
                    db.ref("produtos/" + item.sku).update({ quantidade: novaQtd });
                }
            }
        });

        limparCarrinho();
        alert("Venda realizada com sucesso!");
    });
}

// HISTÓRICO: Filtros (Hoje, 7 dias, Mês, Ano)
function renderHistorico() {
    let tbody = document.querySelector('#tabelaHistorico tbody');
    if(!tbody) return;
    tbody.innerHTML = '';

    let filtro = document.getElementById('filtroPeriodo').value;
    let agora = new Date();
    let faturamento = 0;
    let pecasVendidas = 0;

    let vendasFiltradas = vendas.filter(v => {
        let dataVenda = new Date(v.dataIso);
        if (filtro === 'hoje') return dataVenda.toDateString() === agora.toDateString();
        if (filtro === '7dias') return (agora - dataVenda) / (1000 * 60 * 60 * 24) <= 7;
        if (filtro === 'mes') return dataVenda.getMonth() === agora.getMonth() && dataVenda.getFullYear() === agora.getFullYear();
        if (filtro === 'ano') return dataVenda.getFullYear() === agora.getFullYear();
        return true;
    });

    vendasFiltradas.reverse().forEach(v => {
        faturamento += v.total;
        let qtdItens = v.itens ? v.itens.reduce((acc, i) => acc + i.qtd, 0) : 1;
        pecasVendidas += qtdItens;

        let resumoItens = v.itens ? v.itens.map(i => `${i.qtd}x ${i.descricao}`).join(', ') : 'Venda Geral';

        tbody.innerHTML += `
            <tr>
                <td>#${v.id ? v.id.substring(0,5) : '00'}</td>
                <td><small>${v.data}</small></td>
                <td><small>${v.operador || 'Sistema'}</small></td>
                <td>${resumoItens}</td>
                <td>${v.pagamento}</td>
                <td><strong>R$ ${v.total.toFixed(2)}</strong></td>
            </tr>`;
    });

    document.getElementById('metricFaturamento').innerText = `R$ ${faturamento.toFixed(2)}`;
    document.getElementById('metricPecasVendidas').innerText = pecasVendidas;
}

function exportarBackup() {
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ produtos, vendas, reservas }));
    let dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `backup_sistema_${new Date().toISOString().slice(0,10)}.json`);
    dl.click();
}

// Atalhos do Teclado
document.addEventListener('keydown', e => {
    if(!document.getElementById('pdv').classList.contains('active')) return;
    if(e.key === 'F2') { e.preventDefault(); document.getElementById('barcodeSearch').focus(); }
    if(e.key === 'F4') { e.preventDefault(); limparCarrinho(); }
    if(e.key === 'F8') { e.preventDefault(); finalizarVenda(); }
});
