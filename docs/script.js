// script.js profissional completo para IA Mestre em Compras

// Inicializa o app assim que o DOM estiver pronto
document.addEventListener('DOMContentLoaded', async function() {
    mostrarLoading(true);
    try {
        await carregarDadosIniciais();
        initEventListeners();
    } catch (error) {
        console.error("Erro inicializando app:", error);
        alert("Erro ao carregar dados. Consulte o console.");
    } finally {
        mostrarLoading(false);
    }
});

async function carregarDadosIniciais() {
    const vendas = await GoogleSheetsConnector.obterDadosVendas();
    const estoque = await GoogleSheetsConnector.obterDadosEstoque();
    const nfEntrada = await GoogleSheetsConnector.obterDadosNFEntrada();
    window.dadosSistema = { vendas, estoque, nfEntrada };
    atualizarHoraAtualizacao();
    montarDashboard();
}

function initEventListeners() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            mudarPagina(pageId);
        });
    });

    document.getElementById('btnAtualizar').addEventListener('click', async function() {
        mostrarLoading(true);
        await carregarDadosIniciais();
        mostrarLoading(false);
    });
}

function mudarPagina(pageId) {
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`.menu-item[data-page="${pageId}"]`).classList.add('active');

    document.getElementById('main-content').innerHTML = '';
    switch (pageId) {
        case 'dashboard':
            montarDashboard();
            break;
        case 'sugestoes-compra':
            montarTabelaSugestoesCompra();
            break;
        case 'transferencias':
            montarTabelaTransferencias();
            break;
        case 'oportunidades':
            montarTabelaOportunidades();
            break;
        case 'fornecedores':
            montarTabelaFornecedores();
            break;
        default:
            document.getElementById('main-content').innerHTML = '<h1 class="page-title">Em Construção...</h1>';
    }
}

function atualizarHoraAtualizacao() {
    const agora = new Date();
    document.querySelector('.user-info span').innerText = `Atualizado: ${agora.toLocaleString('pt-BR')}`;
}

function mostrarLoading(exibir) {
    if (exibir) {
        if (!document.getElementById('loading-overlay')) {
            const loading = document.createElement('div');
            loading.id = 'loading-overlay';
            loading.innerHTML = '<div class="spinner"></div>';
            document.body.appendChild(loading);
        }
        document.getElementById('loading-overlay').style.display = 'flex';
    } else {
        if (document.getElementById('loading-overlay')) {
            document.getElementById('loading-overlay').style.display = 'none';
        }
    }
}

// ------- MONTAGEM DOS PAINÉIS -------- //

function montarDashboard() {
    const container = document.getElementById('main-content');
    container.innerHTML = `
        <h1 class="page-title">Dashboard</h1>
        <div class="card-container">
            <div class="card">Vendas: ${window.dadosSistema.vendas.length}</div>
            <div class="card">Produtos em Estoque: ${window.dadosSistema.estoque.length}</div>
            <div class="card">Notas de Entrada: ${window.dadosSistema.nfEntrada.length}</div>
        </div>
        <div class="chart-container">
            <canvas id="chartVendas"></canvas>
        </div>
    `;
    desenharGraficoVendas();
}

function desenharGraficoVendas() {
    const ctx = document.getElementById('chartVendas').getContext('2d');
    const vendas = window.dadosSistema.vendas;

    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dadosMensais = Array(12).fill(0);

    vendas.forEach(venda => {
        const dataVenda = new Date(venda['Date Venda']);
        const mes = dataVenda.getMonth();
        dadosMensais[mes] += Number(venda['Quantidade Total'] || 0);
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [{
                label: 'Vendas por Mês',
                data: dadosMensais,
                backgroundColor: 'rgba(52, 152, 219, 0.6)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function montarTabelaSugestoesCompra() {
    const container = document.getElementById('main-content');
    container.innerHTML = `<h1 class="page-title">Sugestões de Compra</h1><p>Funcionalidade em desenvolvimento.</p>`;
}

function montarTabelaTransferencias() {
    const container = document.getElementById('main-content');
    container.innerHTML = `<h1 class="page-title">Transferências</h1><p>Funcionalidade em desenvolvimento.</p>`;
}

function montarTabelaOportunidades() {
    const container = document.getElementById('main-content');
    container.innerHTML = `<h1 class="page-title">Oportunidades</h1><p>Funcionalidade em desenvolvimento.</p>`;
}

function montarTabelaFornecedores() {
    const container = document.getElementById('main-content');
    container.innerHTML = `<h1 class="page-title">Fornecedores</h1><p>Funcionalidade em desenvolvimento.</p>`;
}
