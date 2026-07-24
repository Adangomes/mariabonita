let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
let vendas = JSON.parse(localStorage.getItem('vendas')) || [];
let reservas = JSON.parse(localStorage.getItem('reservas')) || [];
let carrinho = [];

// Alternar Seções
function showSection(id) {
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
}

// Cadastro de Produto
document.getElementById('formProduto').addEventListener('submit', e => {
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

    produtos.push(produto);
    localStorage.setItem('produtos', JSON.stringify(produtos));
    e.target.reset();
    renderEstoque();
    alert('Produto cadastrado com sucesso!');
});

// Renderizar Estoque e Métricas
function renderEstoque() {
    let tbody = document.querySelector('#tabelaEstoque tbody');
    tbody.innerHTML = '';
    
    let termo = document.getElementById('searchEstoque').value.trim().toLowerCase();
    let totalPecas = 0;
    let valorEstoque = 0;

    produtos.forEach((p, index) => {
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
                    <button class="btn btn-primary btn-sm" onclick="reporEstoque(${index})">+ Repor</button>
                    <button class="btn btn-danger btn-sm" onclick="excluirProduto(${index})">Excluir</button>
                </td>
            </tr>`;
    });

    document.getElementById('metricTotalPecas').innerText = totalPecas;
    document.getElementById('metricValorEstoque').innerText = `R$ ${valorEstoque.toFixed(2)}`;
}

function reporEstoque(index) {
    let qtdAdd = prompt(`Quantas unidades deseja adicionar ao estoque de "${produtos[index].descricao}"?`, "1");
    let num = parseInt(qtdAdd);
    if(num && num > 0) {
        produtos[index].quantidade += num;
        localStorage.setItem('produtos', JSON.stringify(produtos));
        renderEstoque();
    }
}

function excluirProduto(index) {
    if(confirm('Tem certeza que deseja excluir esta peça do estoque?')) {
        produtos.splice(index, 1);
        localStorage.setItem('produtos', JSON.stringify(produtos));
        renderEstoque();
    }
}

// LÓGICA DE RESERVAS
document.getElementById('formReserva').addEventListener('submit', e => {
    e.preventDefault();

    let sku = document.getElementById('reservaSku').value.trim();
    let qtd = parseInt(document.getElementById('reservaQtd').value) || 1;
    let tipo = document.getElementById('reservaTipo').value;
    let nome = document.getElementById('reservaNome').value.trim();
    let sdr = document.getElementById('reservaSdr').value.trim();

    let prodIndex = produtos.findIndex(p => p.sku.toLowerCase() == sku.toLowerCase());

    if(prodIndex == -1) {
        alert("Código da peça não encontrado.");
        return;
    }

    let prod = produtos[prodIndex];

    if(prod.quantidade < qtd) {
        alert("Estoque insuficiente.");
        return;
    }

    let total = prod.preco * qtd;
    let sinal = parseFloat(document.getElementById("valorSinal").value);

    if(isNaN(sinal)) {
        alert("Informe o valor do sinal.");
        return;
    }

    if(sinal < total * 0.5) {
        alert("O sinal mínimo deve ser 50% do valor da peça.");
        return;
    }

    if(sinal > total) {
        alert("O sinal não pode ser maior que o valor da peça.");
        return;
    }

    prod.quantidade -= qtd;

    let agora = new Date();

    reservas.push({
        id: Date.now(),
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

    localStorage.setItem("produtos", JSON.stringify(produtos));
    localStorage.setItem("reservas", JSON.stringify(reservas));

    e.target.reset();
    document.getElementById("reservaQtd").value = 1;
    renderReservas();
    alert("Reserva criada com sucesso.");
});

function renderReservas() {
    let tbody = document.querySelector("#tabelaReservas tbody");
    tbody.innerHTML = "";

    reservas.filter(r => r.status == "PENDENTE").forEach(r => {
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
                <button class="btn btn-success btn-sm" onclick="concluirVendaReserva(${r.id})">Concluir Venda</button>
                <button class="btn btn-danger btn-sm" onclick="cancelarReserva(${r.id})">Cancelar</button>
            </td>
        </tr>`;
    });
}

function concluirVendaReserva(idReserva) {
    let r = reservas.find(x => x.id == idReserva);
    if(!r) return;

    let pagamentoFinal;
    let detalhesPagamento;

    if(r.restante <= 0) {
        pagamentoFinal = "Pago Integral (" + r.formaSinal + ")";
        detalhesPagamento = `SDR: ${r.sdr}\nCliente: ${r.cliente}\nSinal: R$ ${r.sinal.toFixed(2)} (${r.formaSinal})\nPagamento Integral na Reserva`;
    } else {
        pagamentoFinal = prompt(`Saldo restante:\nR$ ${r.restante.toFixed(2)}\n\nInforme a forma de pagamento:\nPIX\nCartão de Crédito\nCartão de Débito\nDinheiro`, "PIX");
        if(!pagamentoFinal) return;

        detalhesPagamento = `SDR: ${r.sdr}\nCliente: ${r.cliente}\nSinal: R$ ${r.sinal.toFixed(2)} (${r.formaSinal})\nRestante: R$ ${r.restante.toFixed(2)} (${pagamentoFinal})`;
    }

    vendas.push({
        id: vendas.length + 1,
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

    r.status = "CONCLUIDA";
    localStorage.setItem("reservas", JSON.stringify(reservas));
    localStorage.setItem("vendas", JSON.stringify(vendas));

    renderReservas();
    alert("Venda concluída com sucesso.");
}

function cancelarReserva(idReserva) {
    if(!confirm("Deseja cancelar esta reserva?")) return;

    let r = reservas.find(x => x.id == idReserva);
    if(!r) return;

    let prod = produtos.find(p => p.sku == r.itemSku);
    if(prod) {
        prod.quantidade += r.qtd;
    }

    r.status = "CANCELADA";
    localStorage.setItem("produtos", JSON.stringify(produtos));
    localStorage.setItem("reservas", JSON.stringify(reservas));

    renderReservas();
    renderEstoque();
    alert("Reserva cancelada.");
}

// Lógica do PDV
document.getElementById('barcodeSearch').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') buscarEAdicionar();
});

function buscarEAdicionar() {
    let input = document.getElementById('barcodeSearch');
    let termo = input.value.trim().toLowerCase();
    let qtd = parseInt(document.getElementById('qtdVenda').value) || 1;

    if(!termo) return;

    let index = produtos.findIndex(p => p.sku.toLowerCase() === termo || p.descricao.toLowerCase().includes(termo));

    if(index === -1) {
        alert('Produto não encontrado!');
        input.select();
        return;
    }

    let prod = produtos[index];
    let itemNoCarrinho = carrinho.find(c => c.index === index);
    let qtdTotalNoCarrinho = (itemNoCarrinho ? itemNoCarrinho.qtd : 0) + qtd;

    if(qtdTotalNoCarrinho > prod.quantidade) {
        alert(`Estoque insuficiente! Saldo atual no estoque: ${prod.quantidade}`);
        return;
    }

    if(itemNoCarrinho) {
        itemNoCarrinho.qtd += qtd;
    } else {
        carrinho.push({ index, produto: prod, qtd });
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
}

function alterarQtdCarrinho(cIndex, delta) {
    let item = carrinho[cIndex];
    let novaQtd = item.qtd + delta;

    if(novaQtd <= 0) { removerDoCarrinho(cIndex); return; }
    if(novaQtd > produtos[item.index].quantidade) { alert('Limite de estoque atingido!'); return; }

    item.qtd = novaQtd;
    renderCarrinho();
}

function removerDoCarrinho(cIndex) {
    carrinho.splice(cIndex, 1);
    renderCarrinho();
}

function limparCarrinho() {
    carrinho = [];
    document.getElementById('descontoValor').value = '';
    renderCarrinho();
}

function finalizarVenda() {
    if(carrinho.length === 0) { alert('O carrinho está vazio!'); return; }

    let total = parseFloat(document.getElementById('totalVenda').innerText);
    let descontoDesc = document.getElementById('descontoCalculado').innerText;
    let formaPagamento = document.getElementById('pagamento').value;
    let id = vendas.length + 1;
    let dataIso = new Date().toISOString();
    let dataFormatada = new Date().toLocaleString('pt-BR');
    let totalPecasVenda = carrinho.reduce((acc, i) => acc + i.qtd, 0);
    let itensStr = carrinho.map(i => `${i.qtd}x ${i.produto.descricao} (${i.produto.tamanho})`).join(', ');

    carrinho.forEach(item => {
        produtos[item.index].quantidade -= item.qtd;
    });

    vendas.push({
        id,
        dataIso,
        data: dataFormatada,
        tipoVenda: 'LOJA FÍSICA',
        detalhes: 'Balcão',
        itens: itensStr,
        totalPecas: totalPecasVenda,
        pagamento: formaPagamento,
        desconto: `R$ ${descontoDesc}`,
        total
    });

    localStorage.setItem('produtos', JSON.stringify(produtos));
    localStorage.setItem('vendas', JSON.stringify(vendas));

    limparCarrinho();
    alert('Venda realizada com sucesso!');
    showSection('pdv');
}

// Histórico e Filtros por Data
function renderHistorico() {
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

    vendasFiltradas.slice().reverse().forEach(v => {
        faturamento += v.total;
        pecasVendidas += (v.totalPecas || 1);

        let badgeTipo = v.tipoVenda === 'VENDA ONLINE' 
            ? '<span class="badge online-tag">VENDA ONLINE</span>' 
            : '<span class="badge balcao-tag">LOJA FÍSICA</span>';

        tbody.innerHTML += `
            <tr>
                <td><strong>#${v.id}</strong></td>
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
}

function limparFiltroData() {
    document.getElementById('filtroMesAno').value = '';
    renderHistorico();
}

// Ferramentas de Dados
function exportarDados() {
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ produtos, vendas, reservas }));
    let downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `backup_erp_moda_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function zerarSistema() {
    if(confirm("ATENÇÃO: Deseja apagar TODOS os produtos, reservas e vendas gravados?")) {
        localStorage.clear();
        produtos = [];
        vendas = [];
        reservas = [];
        renderEstoque();
        renderHistorico();
        alert("Sistema zerado com sucesso!");
    }
}

// Atalhos Globais
document.addEventListener('keydown', e => {
    if(!document.getElementById('pdv').classList.contains('active')) return;
    if(e.key === 'F2') { e.preventDefault(); document.getElementById('barcodeSearch').focus(); }
    if(e.key === 'F4') { e.preventDefault(); limparCarrinho(); }
    if(e.key === 'F8') { e.preventDefault(); finalizarVenda(); }
});

// Inicialização
renderEstoque();

