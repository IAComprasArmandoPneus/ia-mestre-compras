// Adicione isso ao início do app.js para diagnóstico
console.log("Iniciando diagnóstico de conexão...");

// Função para testar a conectividade com o Google Sheets
async function testConnection() {
  try {
    console.log("Tentando conectar ao Google Sheets...");
    const response = await fetch(GoogleSheetsConnector.urlBase + "?action=ping");
    const data = await response.json();
    console.log("Resposta do servidor:", data);
    return data;
  } catch (error) {
    console.error("Erro ao conectar:", error);
    document.body.innerHTML += `
      <div style="position: fixed; top: 0; left: 0; right: 0; background: #e74c3c; color: white; padding: 10px; text-align: center;">
        Erro de conexão: ${error.message}. Verifique o console para mais detalhes.
      </div>
    `;
    return null;
  }
}

// Executar teste de conexão
testConnection().then(result => {
  if (result && result.status === 'success') {
    console.log("Conexão estabelecida com sucesso!");
  } else {
    console.error("Falha na conexão:", result);
  }
});

/**
 * Script principal da aplicação IA Mestre em Compras
 * Gerencia a interface e integração com GoogleSheetsConnector
 */

// Configurações globais
const App = {
    currentPage: 'dashboard',
    isLoading: false,
    dataCache: {
        vendas: null,
        estoque: null,
        nfEntrada: null,
        recomendacoes: null,
        fornecedores: null,
        oportunidades: null,
        transferencias: null
    },
    charts: {},
    
    /**
     * Inicializa a aplicação
     */
    init: async function() {
        console.log('Inicializando aplicação...');
        
        try {
            // Inicializar componentes da UI
            this.initEventListeners();
            this.initPageNavigation();
            
            // Inicializar conector do Google Sheets
            await GoogleSheetsConnector.inicializar();
            
            // Carregar os dados iniciais
            await this.loadInitialData();
            
            // Renderizar tela inicial (dashboard)
            this.changePage('dashboard');
            
            console.log('Aplicação inicializada com sucesso!');
        } catch (erro) {
            console.error('Erro ao inicializar aplicação:', erro);
            this.showError('Erro ao inicializar aplicação', erro.message);
        }
    },
    
    /**
     * Configura os event listeners dos elementos da interface
     */
    initEventListeners: function() {
        // Menu de navegação
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const pageId = item.getAttribute('data-page');
                this.changePage(pageId);
            });
        });
        
        // Tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                this.changeTab(tabId, tab.parentNode);
            });
        });
        
        // Botão de atualização
        document.getElementById('btnAtualizar').addEventListener('click', () => {
            this.refreshData();
        });
        
        // Botões de filtro
        document.querySelectorAll('.filter-button').forEach(button => {
            button.addEventListener('click', () => {
                this.applyFilters(button.id);
            });
        });
        
        // Paginação
        document.querySelectorAll('.pagination-item').forEach(item => {
            item.addEventListener('click', () => {
                this.changePage(item);
            });
        });
        
        // Fechar modais
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                const modalId = closeBtn.closest('.modal').id;
                this.closeModal(modalId);
            });
        });
    },
    
    /**
     * Configura a navegação entre páginas
     */
    initPageNavigation: function() {
        // Verificar parâmetros da URL para navegação direta
        const params = new URLSearchParams(window.location.search);
        const page = params.get('page');
        
        if (page) {
            this.changePage(page);
        }
    },
    
    /**
     * Carrega os dados iniciais para a aplicação
     */
    loadInitialData: async function() {
        try {
            this.showLoading(true, 'global');
            
            // Carregar dados em paralelo para melhor performance
            const [vendasData, estoqueData, nfEntradaData] = await Promise.all([
                GoogleSheetsConnector.obterDadosVendas(),
                GoogleSheetsConnector.obterDadosEstoque(),
                GoogleSheetsConnector.obterDadosNFEntrada()
            ]);
            
            // Armazenar no cache
            this.dataCache.vendas = vendasData;
            this.dataCache.estoque = estoqueData;
            this.dataCache.nfEntrada = nfEntradaData;
            
            // Atualizar timestamp
            this.updateLastRefreshTime();
            
            this.showLoading(false, 'global');
            
            return true;
        } catch (erro) {
            this.showLoading(false, 'global');
            console.error('Erro ao carregar dados iniciais:', erro);
            this.showError('Erro ao carregar dados', erro.message);
            return false;
        }
    },
    
    /**
     * Atualiza todos os dados da aplicação
     */
    refreshData: async function() {
        try {
            this.showLoading(true, 'global');
            
            // Atualizar os dados em paralelo
            const [vendasData, estoqueData, nfEntradaData, recomendacoes] = await Promise.all([
                GoogleSheetsConnector.obterDadosVendas(),
                GoogleSheetsConnector.obterDadosEstoque(),
                GoogleSheetsConnector.obterDadosNFEntrada(),
                GoogleSheetsConnector.obterRecomendacoes()
            ]);
            
            // Atualizar cache
            this.dataCache.vendas = vendasData;
            this.dataCache.estoque = estoqueData;
            this.dataCache.nfEntrada = nfEntradaData;
            this.dataCache.recomendacoes = recomendacoes;
            
            // Atualizar a interface com novos dados
            this.updateDashboard();
            this.updateSugestoesCompra();
            this.updateTransferencias();
            this.updateOportunidades();
            this.updateFornecedores();
            
            // Atualizar timestamp
            this.updateLastRefreshTime();
            
            this.showLoading(false, 'global');
            
            // Notificar usuário
            this.showSuccess('Dados atualizados com sucesso!');
        } catch (erro) {
            this.showLoading(false, 'global');
            console.error('Erro ao atualizar dados:', erro);
            this.showError('Erro ao atualizar dados', erro.message);
        }
    },
    
    /**
     * Atualiza o timestamp da última atualização
     */
    updateLastRefreshTime: function() {
        const agora = new Date();
        const dataFormatada = `${agora.getDate().toString().padStart(2, '0')}/${(agora.getMonth() + 1).toString().padStart(2, '0')}/${agora.getFullYear()} ${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;
        document.querySelector('.user-info span').textContent = `Última atualização: ${dataFormatada}`;
    },
    
    /**
     * Muda para uma página específica
     * @param {String} pageId - ID da página para exibir
     */
    changePage: function(pageId) {
        this.currentPage = pageId;
        
        // Atualizar destaque no menu
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-page') === pageId) {
                item.classList.add('active');
            }
        });
        
        // Atualizar conteúdo visível
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        const pageElement = document.getElementById(`page-${pageId}`);
        if (pageElement) {
            pageElement.classList.add('active');
            
            // Carregar dados específicos da página se necessário
            this.loadPageData(pageId);
        }
        
        // Atualizar URL para permitir navegação direta
        const url = new URL(window.location);
        url.searchParams.set('page', pageId);
        window.history.pushState({}, '', url);
    },
    
    /**
     * Carrega dados específicos para cada página
     * @param {String} pageId - ID da página atual
     */
    loadPageData: async function(pageId) {
        try {
            switch (pageId) {
                case 'dashboard':
                    if (!this.charts.salesChart) {
                        this.initCharts();
                    }
                    this.updateDashboard();
                    break;
                    
                case 'sugestoes-compra':
                    this.showLoading(true, 'sugestoes');
                    if (!this.dataCache.recomendacoes) {
                        this.dataCache.recomendacoes = await GoogleSheetsConnector.obterRecomendacoes();
                    }
                    this.updateSugestoesCompra();
                    this.showLoading(false, 'sugestoes');
                    break;
                    
                case 'transferencias':
                    this.showLoading(true, 'transferencias');
                    if (!this.dataCache.transferencias) {
                        this.dataCache.transferencias = await GoogleSheetsConnector.obterSugestoesTransferencia();
                    }
                    this.updateTransferencias();
                    this.showLoading(false, 'transferencias');
                    break;
                    
                case 'oportunidades':
                    this.showLoading(true, 'oportunidades');
                    if (!this.dataCache.oportunidades) {
                        this.dataCache.oportunidades = await GoogleSheetsConnector.obterOportunidadesCompra();
                    }
                    this.updateOportunidades();
                    this.showLoading(false, 'oportunidades');
                    break;
                    
                case 'fornecedores':
                    this.showLoading(true, 'fornecedores');
                    if (!this.dataCache.fornecedores) {
                        this.dataCache.fornecedores = await GoogleSheetsConnector.obterAnalisesFornecedores();
                    }
                    this.updateFornecedores();
                    if (!this.charts.priceChart && document.getElementById('priceChart')) {
                        this.initCharts();
                    }
                    this.showLoading(false, 'fornecedores');
                    break;
            }
        } catch (erro) {
            this.showLoading(false, pageId);
            console.error(`Erro ao carregar dados para a página ${pageId}:`, erro);
            this.showError(`Erro ao carregar dados para ${pageId}`, erro.message);
        }
    },
    
    /**
     * Alterna entre abas dentro de uma página
     * @param {String} tabId - ID da aba para exibir
     * @param {HTMLElement} tabContainer - Container das abas
     */
    changeTab: function(tabId, tabContainer) {
        // Atualizar abas
        tabContainer.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-tab') === tabId) {
                tab.classList.add('active');
            }
        });
        
        // Atualizar conteúdo das abas
        const parentElement = tabContainer.parentNode;
        parentElement.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.id === `tab-${tabId}`) {
                content.classList.add('active');
            }
        });
        
        // Carregar dados específicos da aba se necessário
        this.loadTabData(tabId);
    },
    
    /**
     * Carrega dados específicos para cada aba
     * @param {String} tabId - ID da aba atual
     */
    loadTabData: async function(tabId) {
        // Implementação para carregar dados específicos de cada aba
        switch (tabId) {
            case 'compraRegular':
                // Carregar dados de compras regulares
                break;
                
            case 'compraOportunidade':
                // Carregar dados de oportunidades
                if (!this.dataCache.oportunidades) {
                    this.showLoading(true, 'oportunidades');
                    this.dataCache.oportunidades = await GoogleSheetsConnector.obterOportunidadesCompra();
                    this.updateOportunidadesCompra();
                    this.showLoading(false, 'oportunidades');
                }
                break;
        }
    },
    
    /**
     * Aplica filtros específicos de cada página
     * @param {String} filterId - ID do botão de filtro clicado
     */
    applyFilters: function(filterId) {
        // Identificar qual conjunto de filtros está sendo aplicado
        let tipoFiltro = "";
        
        if (filterId === "btnAplicarFiltros") {
            tipoFiltro = "dashboard";
        } else if (filterId === "btnAplicarFiltrosCompra") {
            tipoFiltro = "compra";
        } else if (filterId === "btnAplicarFiltrosTransf") {
            tipoFiltro = "transferencia";
        } else if (filterId === "btnAplicarFiltrosOport") {
            tipoFiltro = "oportunidade";
        } else if (filterId === "btnAplicarFiltrosForn") {
            tipoFiltro = "fornecedor";
        }
        
        // Coletar valores dos filtros
        const filtros = this.collectFilters(tipoFiltro);
        
        // Exibir loading
        this.showLoading(true, tipoFiltro);
        
        // Aplicar filtros e atualizar dados (com pequeno delay para mostrar loading)
        setTimeout(() => {
            this.updateFilteredData(filtros, tipoFiltro);
            this.showLoading(false, tipoFiltro);
        }, 300);
    },
    
    /**
     * Coleta valores dos filtros
     * @param {String} tipoFiltro - Tipo de filtro a ser coletado
     * @returns {Object} Objeto com os valores dos filtros
     */
    collectFilters: function(tipoFiltro) {
        const filtros = {};
        
        switch (tipoFiltro) {
            case "dashboard":
                filtros.estabelecimento = document.getElementById("filtroEstabelecimento")?.value;
                filtros.categoria = document.getElementById("filtroCategoria")?.value;
                filtros.marca = document.getElementById("filtroMarca")?.value;
                filtros.periodo = document.getElementById("filtroPeriodo")?.value;
                break;
            case "compra":
                filtros.estabelecimento = document.getElementById("filtroEstabelecimentoCompra")?.value;
                filtros.categoria = document.getElementById("filtroCategoriaCompra")?.value;
                filtros.status = document.getElementById("filtroStatusCompra")?.value;
                filtros.pesquisa = document.getElementById("pesquisaItem")?.value;
                break;
            case "transferencia":
                filtros.origem = document.getElementById("filtroOrigem")?.value;
                filtros.destino = document.getElementById("filtroDestino")?.value;
                filtros.categoria = document.getElementById("filtroCategoriaTransf")?.value;
                filtros.status = document.getElementById("filtroStatusTransf")?.value;
                break;
            case "oportunidade":
                filtros.categoria = document.getElementById("filtroCategoriaOport")?.value;
                filtros.tipo = document.getElementById("filtroTipoOport")?.value;
                filtros.economiaMin = document.getElementById("filtroEconomiaMin")?.value;
                break;
            case "fornecedor":
                filtros.fornecedor = document.getElementById("filtroFornecedor")?.value;
                filtros.categoria = document.getElementById("filtroCategoriaForn")?.value;
                filtros.classificacao = document.getElementById("filtroClassificacao")?.value;
                break;
        }
        
        return filtros;
    },
    
    /**
     * Atualiza os dados na interface após aplicação de filtros
     * @param {Object} filtros - Filtros aplicados
     * @param {String} tipoFiltro - Tipo de dados sendo filtrados
     */
    updateFilteredData: function(filtros, tipoFiltro) {
        switch (tipoFiltro) {
            case "dashboard":
                this.updateDashboard(filtros);
                break;
            case "compra":
                this.updateSugestoesCompra(filtros);
                break;
            case "transferencia":
                this.updateTransferencias(filtros);
                break;
            case "oportunidade":
                this.updateOportunidades(filtros);
                break;
            case "fornecedor":
                this.updateFornecedores(filtros);
                break;
        }
    },
    
    /**
     * Inicializa os gráficos da aplicação
     */
    initCharts: function() {
        // Gráfico de vendas
        const salesChartElement = document.getElementById('salesChart');
        if (salesChartElement) {
            const ctx = salesChartElement.getContext('2d');
            this.charts.salesChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                    datasets: [{
                        label: 'Vendas Realizadas',
                        data: [65, 59, 80, 81, 56, 55, 70, 75, 82, 80, 90, 95],
                        backgroundColor: 'rgba(40, 116, 166, 0.2)',
                        borderColor: 'rgba(40, 116, 166, 1)',
                        borderWidth: 2,
                        tension: 0.3
                    }, {
                        label: 'Previsão de Vendas',
                        data: [null, null, null, null, null, null, null, null, null, null, 95, 105],
                        backgroundColor: 'rgba(243, 156, 18, 0.2)',
                        borderColor: 'rgba(243, 156, 18, 1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
        // Gráfico de preços de fornecedores
        const priceChartElement = document.getElementById('priceChart');
        if (priceChartElement) {
            const ctx = priceChartElement.getContext('2d');
            this.charts.priceChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Distribuidor XYZ', 'Continental Brasil', 'Auto Peças Distribuidora', 'Castrol Distribuidora'],
                    datasets: [{
                        label: 'Variação de Preço (%)',
                        data: [1.2, 2.5, 3.8, -0.5],
                        backgroundColor: [
                            'rgba(52, 152, 219, 0.7)',
                            'rgba(52, 152, 219, 0.7)',
                            'rgba(52, 152, 219, 0.7)',
                            'rgba(46, 204, 113, 0.7)'
                        ],
                        borderColor: [
                            'rgba(52, 152, 219, 1)',
                            'rgba(52, 152, 219, 1)',
                            'rgba(52, 152, 219, 1)',
                            'rgba(46, 204, 113, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Variação de Preço (%)'
                            }
                        }
                    }
                }
            });
        }
    },
    
    /**
     * Atualiza os dados do Dashboard
     * @param {Object} filtros - Filtros opcionais para os dados
     */
    updateDashboard: function(filtros = {}) {
        // Verificar se temos os dados necessários
        if (!this.dataCache.recomendacoes) {
            // Carregar recomendações se ainda não estiverem disponíveis
            this.showLoading(true, 'dashboard');
            GoogleSheetsConnector.obterRecomendacoes()
                .then(data => {
                    this.dataCache.recomendacoes = data;
                    this.updateDashboardData(filtros);
                    this.showLoading(false, 'dashboard');
                })
                .catch(erro => {
                    console.error('Erro ao obter dados para dashboard:', erro);
                    this.showError('Erro ao carregar dashboard', erro.message);
                    this.showLoading(false, 'dashboard');
                });
            return;
        }
        
        this.updateDashboardData(filtros);
    },
    
    /**
     * Atualiza os dados do Dashboard com base nos dados disponíveis
     * @param {Object} filtros - Filtros opcionais para os dados
     */
    updateDashboardData: function(filtros = {}) {
        // Atualizar cartas informativas (cards)
        // Na implementação real, estes valores viriam dos dados obtidos da API
        document.querySelectorAll('#page-dashboard .card .stat').forEach((card, index) => {
            // Valores mockados para exemplo
            const valores = ["32", "18", "7", "+14%"];
            card.textContent = valores[index];
        });
        
        // Atualizar tabela de oportunidades
        const tabelaOportunidades = document.getElementById('tabelaOportunidades');
        if (tabelaOportunidades && this.dataCache.oportunidades) {
            // Limitar para as 5 melhores oportunidades
            const melhoresOportunidades = this.dataCache.oportunidades.slice(0, 5);
            
            // Limpar tabela existente
            tabelaOportunidades.innerHTML = '';
            
            // Adicionar novas linhas
            melhoresOportunidades.forEach(oportunidade => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${oportunidade['Cód Item']}</td>
                    <td>${oportunidade.Item}</td>
                    <td>${oportunidade.Categoria} <span class="badge badge-${oportunidade.Categoria.toLowerCase().includes('pneu') ? 'pneus' : (oportunidade.Categoria.toLowerCase().includes('lubrificante') ? 'lubrificantes' : 'pecas')}">${oportunidade.Categoria.charAt(0)}</span></td>
                    <td>${oportunidade.Tipo}</td>
                    <td>R$ ${typeof oportunidade['Preço Médio Histórico'] === 'undefined' ? '0,00' : oportunidade['Preço Médio Histórico'].toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                    <td>R$ ${typeof oportunidade['Preço Atual'] === 'undefined' ? '0,00' : oportunidade['Preço Atual'].toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                    <td>${oportunidade['Economia Potencial']}</td>
                    <td>${oportunidade['Qtd Sugerida']}</td>
                    <td>${oportunidade['Melhor Fornecedor']}</td>
                    <td>
                        <button class="action-btn" onclick="App.showItemDetails('${oportunidade['Cód Item']}')">Detalhes</button>
                        <button class="action-btn green">Comprar</button>
                    </td>
                `;
                tabelaOportunidades.appendChild(row);
            });
        }
        
        // Atualizar gráficos com dados reais
        this.updateCharts();
    },
    
    /**
     * Atualiza as sugestões de compra
     * @param {Object} filtros - Filtros opcionais para os dados
     */
    updateSugestoesCompra: function(filtros = {}) {
        if (!this.dataCache.recomendacoes) {
            return;
        }
        
        const tabelaSugestoesCompra = document.getElementById('tabelaSugestoesCompra');
        if (!tabelaSugestoesCompra) {
            return;
        }
        
        // Aplicar filtros se houver
        let recomendacoes = this.dataCache.recomendacoes.recomendacoesCompra || [];
        
        if (filtros) {
            // Filtrar por estabelecimento
            if (filtros.estabelecimento && filtros.estabelecimento !== 'Todos') {
                recomendacoes = recomendacoes.filter(rec => rec.Estabelecimento === filtros.estabelecimento);
            }
            
            // Filtrar por categoria
            if (filtros.categoria && filtros.categoria !== 'Todas') {
                recomendacoes = recomendacoes.filter(rec => rec.Categoria === filtros.categoria);
            }
            
            // Filtrar por status
            if (filtros.status && filtros.status !== 'Todos') {
                recomendacoes = recomendacoes.filter(rec => rec.Status === filtros.status);
            }
            
            // Filtrar por pesquisa
            if (filtros.pesquisa) {
                const termoPesquisa = filtros.pesquisa.toLowerCase();
                recomendacoes = recomendacoes.filter(rec => 
                    (rec['Cód Item'] && rec['Cód Item'].toString().toLowerCase().includes(termoPesquisa)) ||
                    (rec.Item && rec.Item.toLowerCase().includes(termoPesquisa))
                );
            }
        }
        
        // Limpar tabela existente
        tabelaSugestoesCompra.innerHTML = '';
        
        // Verificar se há dados para exibir
        if (recomendacoes.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="13" class="text-center">Nenhum item encontrado com os filtros aplicados</td>`;
            tabelaSugestoesCompra.appendChild(row);
            return;
        }
        
        // Adicionar novas linhas
        recomendacoes.forEach(rec => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${rec['Cód Item']}</td>
                <td>${rec.Item}</td>
                <td>${rec.Categoria} <span class="badge badge-${rec.Categoria.toLowerCase().includes('pneu') ? 'pneus' : (rec.Categoria.toLowerCase().includes('lubrificante') ? 'lubrificantes' : 'pecas')}">${rec.Categoria.charAt(0)}</span></td>
                <td>${rec.Estabelecimento}</td>
                <td>${rec['Estoque Atual']}</td>
                <td>${rec['Estoque Mínimo']}</td>
                <td>${rec['Média Vendas (30d)']}</td>
                <td>${rec['Previsão Vendas (30d)']}</td>
                <td>${rec['Dias em Estoque']}</td>
                <td>${rec['Qtd Sugerida']}</td>
                <td>${rec['Melhor Fornecedor']}</td>
                <td><span class="status status-${rec.Status === 'Crítico' ? 'danger' : (rec.Status === 'Urgente' ? 'warning' : 'good')}">${rec.Status}</span></td>
                <td>
                    <button class="action-btn" onclick="App.showItemDetails('${rec['Cód Item']}')">Detalhes</button>
                    <button class="action-btn green">Comprar</button>
                </td>
            `;
            tabelaSugestoesCompra.appendChild(row);
        });
    },
    
    /**
     * Atualiza as transferências recomendadas
     * @param {Object} filtros - Filtros opcionais para os dados
     */
    updateTransferencias: function(filtros = {}) {
        // Verificar se temos dados de transferências
        if (!this.dataCache.transferencias && !this.dataCache.recomendacoes) {
            return;
        }
        
        let transferencias = this.dataCache.transferencias || 
                             (this.dataCache.recomendacoes ? this.dataCache.recomendacoes.transferencias : []);
        
        const tabelaTransferencias = document.getElementById('tabelaTransferenciasCompleta');
        if (!tabelaTransferencias) {
            return;
        }
        
        // Aplicar filtros se houver
        if (filtros) {
            // Filtrar por origem
            if (filtros.origem && filtros.origem !== 'Todos') {
                transferencias = transferencias.filter(transfer => transfer.Origem === filtros.origem);
            }
            
            // Filtrar por destino
            if (filtros.destino && filtros.destino !== 'Todos') {
                transferencias = transferencias.filter(transfer => transfer.Destino === filtros.destino);
            }
            
            // Filtrar por categoria
            if (filtros.categoria && filtros.categoria !== 'Todas') {
                transferencias = transferencias.filter(transfer => transfer.Categoria === filtros.categoria);
            }
            
            // Filtrar por status
            if (filtros.status && filtros.status !== 'Todos') {
                transferencias = transferencias.filter(transfer => transfer.Status === filtros.status);
            }
        }
        
        // Limpar tabela existente
        tabelaTransferencias.innerHTML = '';
        
        // Verificar se há dados para exibir
        if (transferencias.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="11" class="text-center">Nenhuma transferência encontrada com os filtros aplicados</td>`;
            tabelaTransferencias.appendChild(row);
            return;
        }
        
        // Adicionar novas linhas
        transferencias.forEach(transfer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transfer['Cód Item']}</td>
                <td>${transfer.Item}</td>
                <td>${transfer.Categoria} <span class="badge badge-${transfer.Categoria.toLowerCase().includes('pneu') ? 'pneus' : (transfer.Categoria.toLowerCase().includes('lubrificante') ? 'lubrificantes' : 'pecas')}">${transfer.Categoria.charAt(0)}</span></td>
                <td>${transfer.Origem}</td>
                <td>${transfer.EstoqueOrigem}</td>
                <td>${transfer.Destino}</td>
                <td>${transfer.EstoqueDestino}</td>
                <td>${transfer.QtdSugerida}</td>
                <td>${transfer['Dias Cobertura']}</td>
                <td><span class="status status-${transfer.Status === 'Crítico' ? 'danger' : (transfer.Status === 'Urgente' ? 'warning' : 'good')}">${transfer.Status}</span></td>
                <td>
                    <button class="action-btn" onclick="App.showTransferDetails('${transfer['Cód Item']}', '${transfer.Destino}')">Detalhes</button>
                    <button class="action-btn green">Transferir</button>
                </td>
            `;
            tabelaTransferencias.appendChild(row);
        });
    },
    
    /**
     * Atualiza as oportunidades de compra
     * @param {Object} filtros - Filtros opcionais para os dados
     */
    updateOportunidades: function(filtros = {}) {
        // Verificar se temos dados de oportunidades
        if (!this.dataCache.oportunidades && !this.dataCache.recomendacoes) {
            return;
        }
        
        let oportunidades = this.dataCache.oportunidades || 
                           (this.dataCache.recomendacoes ? this.dataCache.recomendacoes.oportunidades : []);
        
        const tabelaOportunidades = document.getElementById('tabelaOportunidadesCompleta');
        if (!tabelaOportunidades) {
            return;
        }
        
        // Aplicar filtros se houver
        if (filtros) {
            // Filtrar por categoria
            if (filtros.categoria && filtros.categoria !== 'Todas') {
                oportunidades = oportunidades.filter(oport => oport.Categoria === filtros.categoria);
            }
            
            // Filtrar por tipo de oportunidade
            if (filtros.tipo && filtros.tipo !== 'Todos') {
                oportunidades = oportunidades.filter(oport => oport.Tipo === filtros.tipo);
            }
            
            // Filtrar por economia mínima
            if (filtros.economiaMin && !isNaN(parseFloat(filtros.economiaMin))) {
                const minValor = parseFloat(filtros.economiaMin);
                oportunidades = oportunidades.filter(oport => {
                    const economia = parseFloat(oport['Economia Potencial'].replace(/[^0-9,.-]/g, '').replace(',', '.'));
                    return !isNaN(economia) && economia >= minValor;
                });
            }
        }
        
        // Limpar tabela existente
        tabelaOportunidades.innerHTML = '';
        
        // Verificar se há dados para exibir
        if (oportunidades.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="13" class="text-center">Nenhuma oportunidade encontrada com os filtros aplicados</td>`;
            tabelaOportunidades.appendChild(row);
            return;
        }
        
        // Adicionar novas linhas
        oportunidades.forEach(oport => {
            const row = document.createElement('tr');
            
            // Formatar valores
            const precoMedio = typeof oport['Preço Médio Histórico'] !== 'undefined' ? 
                `R$ ${oport['Preço Médio Histórico'].toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 
                (typeof oport['Preço Médio'] !== 'undefined' ? 
                    `R$ ${oport['Preço Médio'].toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 'N/A');
                    
            const precoAtual = typeof oport['Preço Atual'] !== 'undefined' ? 
                `R$ ${oport['Preço Atual'].toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 'N/A';
                
            const economia = oport['Economia'] || oport['Tendência Preço'] || 'N/A';
            
            const estoqueAtual = oport['Estoque Total'] || 'N/A';
            const consumoMensal = oport['Consumo Mensal'] || 'N/A';
            
            row.innerHTML = `
                <td>${oport['Cód Item']}</td>
                <td>${oport.Item}</td>
                <td>${oport.Categoria} <span class="badge badge-${oport.Categoria.toLowerCase().includes('pneu') ? 'pneus' : (oport.Categoria.toLowerCase().includes('lubrificante') ? 'lubrificantes' : 'pecas')}">${oport.Categoria.charAt(0)}</span></td>
                <td>${oport.Tipo}</td>
                <td>${precoMedio}</td>
                <td>${precoAtual}</td>
                <td>${economia}</td>
                <td>${estoqueAtual}</td>
                <td>${consumoMensal}</td>
                <td>${oport['Qtd Sugerida']}</td>
                <td>${oport['Economia Potencial']}</td>
                <td>${oport['Melhor Fornecedor']}</td>
                <td>
                    <button class="action-btn" onclick="App.showOpportunityDetails('${oport['Cód Item']}')">Detalhes</button>
                    <button class="action-btn green">Comprar</button>
                </td>
            `;
            tabelaOportunidades.appendChild(row);
        });
        
        // Atualizar resumo de economia potencial
        this.updateSavingSummary(oportunidades);
    },
    
    /**
     * Atualiza o resumo de economia potencial nas oportunidades
     * @param {Array} oportunidades - Lista de oportunidades
     */
    updateSavingSummary: function(oportunidades) {
        // Calcular economia potencial total
        let economiaPotencialTotal = 0;
        let precosFavoraveis = 0;
        let tendenciaAlta = 0;
        
        oportunidades.forEach(oport => {
            // Extrair valor numérico da economia potencial
            const economiaStr = oport['Economia Potencial'].replace(/[^0-9,.-]/g, '').replace(',', '.');
            const economia = parseFloat(economiaStr);
            
            if (!isNaN(economia)) {
                economiaPotencialTotal += economia;
            }
            
            // Contar tipos de oportunidades
            if (oport.Tipo === 'Preço atual favorável') {
                precosFavoraveis++;
            } else if (oport.Tipo === 'Antecipação por tendência de alta') {
                tendenciaAlta++;
            }
        });
        
        // Atualizar estatísticas na UI
        const cards = document.querySelectorAll('#page-oportunidades .card .stat');
        if (cards.length >= 3) {
            cards[0].textContent = `R$ ${Math.round(economiaPotencialTotal).toLocaleString('pt-BR')}`;
            cards[1].textContent = precosFavoraveis.toString();
            cards[2].textContent = tendenciaAlta.toString();
        }
    },
    
    /**
     * Atualiza a análise de fornecedores
     * @param {Object} filtros - Filtros opcionais para os dados
     */
    updateFornecedores: function(filtros = {}) {
        // Verificar se temos dados de fornecedores
        if (!this.dataCache.fornecedores) {
            this.showLoading(true, 'fornecedores');
            GoogleSheetsConnector.obterAnalisesFornecedores(filtros)
                .then(data => {
                    this.dataCache.fornecedores = data;
                    this.updateFornecedoresUI(data, filtros);
                    this.showLoading(false, 'fornecedores');
                })
                .catch(erro => {
                    console.error('Erro ao obter dados de fornecedores:', erro);
                    this.showError('Erro ao carregar dados de fornecedores', erro.message);
                    this.showLoading(false, 'fornecedores');
                });
            return;
        }
        
        this.updateFornecedoresUI(this.dataCache.fornecedores, filtros);
    },
    
    /**
     * Atualiza a interface de fornecedores com os dados obtidos
     * @param {Array} fornecedores - Lista de fornecedores
     * @param {Object} filtros - Filtros aplicados
     */
    updateFornecedoresUI: function(fornecedores, filtros = {}) {
        const tabelaFornecedores = document.getElementById('tabelaFornecedores');
        if (!tabelaFornecedores) {
            return;
        }
        
        // Aplicar filtros se houver
        let dadosFiltrados = [...fornecedores];
        
        if (filtros) {
            // Filtrar por fornecedor
            if (filtros.fornecedor && filtros.fornecedor !== 'Todos') {
                dadosFiltrados = dadosFiltrados.filter(forn => forn.nome === filtros.fornecedor);
            }
            
            // Filtrar por categoria
            if (filtros.categoria && filtros.categoria !== 'Todas') {
                dadosFiltrados = dadosFiltrados.filter(forn => 
                    forn.categoriasTexto && forn.categoriasTexto.includes(filtros.categoria)
                );
            }
            
            // Filtrar por classificação
            if (filtros.classificacao && filtros.classificacao !== 'Todos') {
                dadosFiltrados = dadosFiltrados.filter(forn => forn.classificacao === filtros.classificacao);
            }
        }
        
        // Limpar tabela existente
        tabelaFornecedores.innerHTML = '';
        
        // Verificar se há dados para exibir
        if (dadosFiltrados.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="10" class="text-center">Nenhum fornecedor encontrado com os filtros aplicados</td>`;
            tabelaFornecedores.appendChild(row);
            return;
        }
        
        // Adicionar novas linhas
        dadosFiltrados.forEach(forn => {
            const row = document.createElement('tr');
            
            // Formatar valores
            const dataUltimaCompra = new Date(forn.ultimaCompra);
            const ultimaCompraFormatada = `${dataUltimaCompra.getDate().toString().padStart(2, '0')}/${(dataUltimaCompra.getMonth() + 1).toString().padStart(2, '0')}/${dataUltimaCompra.getFullYear()}`;
            
            const precoMedio = typeof forn.precoMedio !== 'undefined' ? 
                `R$ ${forn.precoMedio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 'N/A';
                
            const variacaoPreco = typeof forn.variacaoPreco !== 'undefined' ? 
                `${forn.variacaoPreco > 0 ? '+' : ''}${forn.variacaoPreco.toFixed(1)}%` : 'N/A';
            
            row.innerHTML = `
                <td>${forn.nome}</td>
                <td>${forn.categoriasTexto || 'N/A'}</td>
                <td>${forn.compras}</td>
                <td>${precoMedio}</td>
                <td>${forn.leadTime || '5-7'} dias</td>
                <td>${ultimaCompraFormatada}</td>
                <td>${forn.pontualidade ? forn.pontualidade.toFixed(0) : '95'}%</td>
                <td>${variacaoPreco}</td>
                <td><span class="status status-${forn.classificacao === 'Preferencial' || forn.classificacao === 'Recomendado' ? 'good' : (forn.classificacao === 'Alternativo' ? 'warning' : 'danger')}">${forn.classificacao}</span></td>
                <td>
                    <button class="action-btn" onclick="App.showSupplierDetails('${forn.nome}')">Detalhes</button>
                </td>
            `;
            tabelaFornecedores.appendChild(row);
        });
        
        // Atualizar gráfico de preços
        this.updatePriceChart(dadosFiltrados);
    },
    
    /**
     * Atualiza o gráfico de preços dos fornecedores
     * @param {Array} fornecedores - Lista de fornecedores
     */
    updatePriceChart: function(fornecedores) {
        if (!this.charts.priceChart) {
            return;
        }
        
        // Limitar para os 5 principais fornecedores
        const topFornecedores = fornecedores.slice(0, 5);
        
        // Preparar dados para o gráfico
        const labels = topFornecedores.map(forn => forn.nome);
        const variacoes = topFornecedores.map(forn => forn.variacaoPreco || 0);
        
        // Definir cores baseadas na variação
        const backgroundColors = variacoes.map(variacao => 
            variacao < 0 ? 'rgba(46, 204, 113, 0.7)' : 'rgba(52, 152, 219, 0.7)'
        );
        
        const borderColors = variacoes.map(variacao => 
            variacao < 0 ? 'rgba(46, 204, 113, 1)' : 'rgba(52, 152, 219, 1)'
        );
        
        // Atualizar dados do gráfico
        this.charts.priceChart.data.labels = labels;
        this.charts.priceChart.data.datasets[0].data = variacoes;
        this.charts.priceChart.data.datasets[0].backgroundColor = backgroundColors;
        this.charts.priceChart.data.datasets[0].borderColor = borderColors;
        
        // Atualizar gráfico
        this.charts.priceChart.update();
    },
    
    /**
     * Atualiza os gráficos com dados reais
     */
    updateCharts: function() {
        // Atualizar gráfico de vendas com dados reais
        if (this.charts.salesChart && this.dataCache.vendas) {
            // Implementação real: analisar dados de vendas por mês e atualizar gráfico
            // Para este exemplo, mantemos os dados mockados
            this.charts.salesChart.update();
        }
    },
    
    /**
     * Exibe um modal com detalhes do item
     * @param {String} codItem - Código do item
     */
    showItemDetails: function(codItem) {
        // Buscar dados do item
        let item = null;
        
        // Procurar nos dados de recomendações
        if (this.dataCache.recomendacoes && this.dataCache.recomendacoes.recomendacoesCompra) {
            item = this.dataCache.recomendacoes.recomendacoesCompra.find(rec => rec['Cód Item'] == codItem);
        }
        
        // Se não encontrar, procurar nos dados de estoque
        if (!item && this.dataCache.estoque) {
            item = this.dataCache.estoque.find(est => est['Cód Item'] == codItem);
        }
        
        if (!item) {
            this.showError('Item não encontrado', `Não foi possível encontrar detalhes para o item ${codItem}`);
            return;
        }
        
        // Buscar dados de vendas do item
        const vendasItem = this.dataCache.vendas ? 
            this.dataCache.vendas.filter(venda => venda['Cód Item'] == codItem) : [];
        
        // Buscar dados de compras do item
        const comprasItem = this.dataCache.nfEntrada ? 
            this.dataCache.nfEntrada.filter(compra => compra['Cód Item'] == codItem) : [];
        
        // Montar o conteúdo do modal
        const modalBody = document.getElementById('modalDetalhesItemBody');
        if (!modalBody) return;
        
        // Calcular dados adicionais
        const ultimaCompra = comprasItem.length > 0 ? 
            comprasItem.sort((a, b) => new Date(b.dtalancto) - new Date(a.dtalancto))[0] : null;
            
        const precoMedio = comprasItem.length > 0 ?
            comprasItem.reduce((sum, compra) => sum + compra['Custo de compra'], 0) / comprasItem.length : 0;
            
        const precoUltimaCompra = ultimaCompra ? ultimaCompra['Custo de compra'] : 0;
        
        const tendenciaPreco = precoMedio > 0 && precoUltimaCompra > 0 ?
            ((precoUltimaCompra / precoMedio) - 1) * 100 : 0;
        
        // Montar HTML dos detalhes
        let html = `
            <div class="detail-row">
                <div class="detail-label">Código do Item:</div>
                <div class="detail-value">${item['Cód Item']}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Descrição:</div>
                <div class="detail-value">${item.Item}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Categoria:</div>
                <div class="detail-value">${item.Categoria}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Estabelecimento:</div>
                <div class="detail-value">${item.Estabelecimento || 'Todos'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Estoque Atual:</div>
                <div class="detail-value">${item['Estoque Atual'] || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Estoque Mínimo:</div>
                <div class="detail-value">${item['Estoque Mínimo'] || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Média de Vendas (30d):</div>
                <div class="detail-value">${item['Média Vendas (30d)'] || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Previsão de Vendas (30d):</div>
                <div class="detail-value">${item['Previsão Vendas (30d)'] || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Dias em Estoque:</div>
                <div class="detail-value">${item['Dias em Estoque'] || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Sugestão de Compra:</div>
                <div class="detail-value">${item['Qtd Sugerida'] || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Melhor Fornecedor:</div>
                <div class="detail-value">${item['Melhor Fornecedor'] || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Última Compra:</div>
                <div class="detail-value">${ultimaCompra ? new Date(ultimaCompra.dtalancto).toLocaleDateString('pt-BR') : 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Preço Médio:</div>
                <div class="detail-value">R$ ${precoMedio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Preço Última Compra:</div>
                <div class="detail-value">R$ ${precoUltimaCompra.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Tendência de Preço:</div>
                <div class="detail-value">${tendenciaPreco > 0 ? '+' : ''}${tendenciaPreco.toFixed(1)}%</div>
            </div>
        `;
        
        modalBody.innerHTML = html;
        
        // Exibir o modal
        document.getElementById('modalDetalhesItem').classList.add('active');
    },
    
    /**
     * Exibe um modal com detalhes da transferência
     * @param {String} codItem - Código do item
     * @param {String} destino - Estabelecimento de destino
     */
    showTransferDetails: function(codItem, destino) {
        // Implementar visualização de detalhes da transferência
        // Similar ao showItemDetails, mas focado em dados de transferência
        
        this.showInfo(`Detalhes da transferência para o item ${codItem} com destino ${destino}`);
    },
    
    /**
     * Exibe um modal com detalhes da oportunidade
     * @param {String} codItem - Código do item
     */
    showOpportunityDetails: function(codItem) {
        // Implementar visualização de detalhes da oportunidade
        // Similar ao showItemDetails, mas focado em dados de oportunidade
        
        this.showInfo(`Detalhes da oportunidade para o item ${codItem}`);
    },
    
    /**
     * Exibe um modal com detalhes do fornecedor
     * @param {String} fornecedor - Nome do fornecedor
     */
    showSupplierDetails: function(fornecedor) {
        // Implementar visualização de detalhes do fornecedor
        
        this.showInfo(`Detalhes do fornecedor ${fornecedor}`);
    },
    
    /**
     * Fecha um modal específico
     * @param {String} modalId - ID do modal a ser fechado
     */
    closeModal: function(modalId) {
        document.getElementById(modalId).classList.remove('active');
    },
    
    /**
     * Exibe ou oculta indicador de carregamento
     * @param {Boolean} exibir - True para exibir, false para ocultar
     * @param {String} tipoConteudo - Tipo de conteúdo sendo carregado
     */
    showLoading: function(exibir, tipoConteudo) {
        // Implementação do indicador de loading
        // Aqui você pode ter diferentes áreas de loading para diferentes partes da aplicação
        const loadingGlobal = document.getElementById('loading-global');
        
        if (loadingGlobal) {
            if (exibir) {
                loadingGlobal.classList.add('active');
            } else {
                loadingGlobal.classList.remove('active');
            }
        }
        
        // Loadings específicos por seção
        const loadingElement = document.getElementById(`loading-${tipoConteudo}`);
        if (loadingElement) {
            if (exibir) {
                loadingElement.classList.add('active');
            } else {
                loadingElement.classList.remove('active');
            }
        }
    },
    
    /**
     * Exibe uma mensagem de erro
     * @param {String} titulo - Título do erro
     * @param {String} mensagem - Mensagem detalhada
     */
    showError: function(titulo, mensagem) {
        // Criar elemento de alerta
        const alertElement = document.createElement('div');
        alertElement.className = 'alert alert-error';
        alertElement.innerHTML = `<strong>${titulo}</strong> ${mensagem}`;
        
        // Adicionar ao container de alertas
        const alertContainer = document.getElementById('alert-container');
        if (alertContainer) {
            alertContainer.appendChild(alertElement);
            
            // Remover após 5 segundos
            setTimeout(() => {
                alertElement.style.opacity = '0';
                setTimeout(() => {
                    alertContainer.removeChild(alertElement);
                }, 300);
            }, 5000);
        } else {
            // Fallback para alert nativo
            console.error(titulo, mensagem);
            alert(`${titulo}: ${mensagem}`);
        }
    },
    
    /**
     * Exibe uma mensagem de sucesso
     * @param {String} mensagem - Mensagem de sucesso
     */
    showSuccess: function(mensagem) {
        // Criar elemento de alerta
        const alertElement = document.createElement('div');
        alertElement.className = 'alert alert-success';
        alertElement.innerHTML = mensagem;
        
        // Adicionar ao container de alertas
        const alertContainer = document.getElementById('alert-container');
        if (alertContainer) {
            alertContainer.appendChild(alertElement);
            
            // Remover após 3 segundos
            setTimeout(() => {
                alertElement.style.opacity = '0';
                setTimeout(() => {
                    alertContainer.removeChild(alertElement);
                }, 300);
            }, 3000);
        } else {
            // Fallback para alert nativo
            alert(mensagem);
        }
    },
    
    /**
     * Exibe uma mensagem informativa
     * @param {String} mensagem - Mensagem informativa
     */
    showInfo: function(mensagem) {
        // Criar elemento de alerta
        const alertElement = document.createElement('div');
        alertElement.className = 'alert alert-info';
        alertElement.innerHTML = mensagem;
        
        // Adicionar ao container de alertas
        const alertContainer = document.getElementById('alert-container');
        if (alertContainer) {
            alertContainer.appendChild(alertElement);
            
            // Remover após 4 segundos
            setTimeout(() => {
                alertElement.style.opacity = '0';
                setTimeout(() => {
                    alertContainer.removeChild(alertElement);
                }, 300);
            }, 4000);
        } else {
            // Fallback para alert nativo
            alert(mensagem);
        }
    }
};

// Inicializar a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Exportar App para uso global
window.App = App;

// Adicione esta função ao app.js
function activateEmergencyMode() {
  console.log("Ativando modo de emergência...");
  
  // Remover loadings
  document.querySelectorAll('.loading').forEach(el => el.style.display = 'none');
  
  // Mostrar mensagem ao usuário
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.innerHTML = `
      <div style="background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
        <h3>Modo de Emergência Ativado</h3>
        <p>Não foi possível estabelecer conexão com o servidor de dados. Estamos operando no modo offline.</p>
        <p>Por favor, verifique:</p>
        <ul>
          <li>Se o ID de implantação do Google Apps Script está correto</li>
          <li>Se o Google Apps Script está publicado como aplicativo da web</li>
          <li>Se as permissões de acesso ao Google Sheets estão configuradas corretamente</li>
        </ul>
        <button onclick="location.reload()" style="background: #721c24; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;">
          Tentar Novamente
        </button>
      </div>
    `;
  }
}

// Adicione um timeout para ativar o modo de emergência se não conseguir carregar os dados
setTimeout(() => {
  const loadingElements = document.querySelectorAll('.loading');
  const isStillLoading = Array.from(loadingElements).some(el => 
    el.style.display !== 'none' && el.classList.contains('active')
  );
  
  if (isStillLoading) {
    activateEmergencyMode();
  }
}, 10000); // 10 segundos
