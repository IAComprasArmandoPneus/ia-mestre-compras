<!DOCTYPE html>
<html lang="pt-br">
<!-- Cabeçalho e estilos já definidos acima -->
<body>
    <!-- Cabeçalho e barra lateral já definidos acima -->
    <div class="main-content">
        <!-- Continuação da página dashboard -->
                    <div class="section-title">
                        <span class="section-title-icon">📈</span>
                        Análise de Vendas e Previsão
                    </div>
                    
                    <div class="chart-container">
                        <canvas id="salesChart"></canvas>
                    </div>
                    
                    <div class="section-title">
                        <span class="section-title-icon">💰</span>
                        Oportunidades de Compra
                    </div>
                    
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Cód Item</th>
                                    <th>Descrição</th>
                                    <th>Categoria</th>
                                    <th>Tipo Oportunidade</th>
                                    <th>Preço Médio</th>
                                    <th>Preço Atual</th>
                                    <th>Economia Potencial</th>
                                    <th>Qtd Sugerida</th>
                                    <th>Fornecedor</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="tabelaOportunidades">
                                <tr>
                                    <td>10532</td>
                                    <td>PNEU 225/45R17 MICHELIN PS4</td>
                                    <td>PNEUS <span class="badge badge-pneus">P</span></td>
                                    <td>Preço atual favorável</td>
                                    <td>R$ 980,00</td>
                                    <td>R$ 890,00</td>
                                    <td>R$ 1.800,00</td>
                                    <td>20</td>
                                    <td>Distribuidor XYZ</td>
                                    <td>
                                        <button class="action-btn" onclick="mostrarDetalhesOportunidade(10532)">Detalhes</button>
                                        <button class="action-btn green">Comprar</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>5678</td>
                                    <td>ÓLEO MOTOR CASTROL 5W30</td>
                                    <td>LUBRIFICANTES/ADITIVOS <span class="badge badge-lubrificantes">L</span></td>
                                    <td>Antecipação por tendência de alta</td>
                                    <td>R$ 35,00</td>
                                    <td>R$ 33,50</td>
                                    <td>R$ 900,00</td>
                                    <td>60</td>
                                    <td>Castrol Distribuidora</td>
                                    <td>
                                        <button class="action-btn" onclick="mostrarDetalhesOportunidade(5678)">Detalhes</button>
                                        <button class="action-btn green">Comprar</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Página: Sugestões de Compra -->
                <div class="page" id="page-sugestoes-compra">
                    <h1 class="page-title">Sugestões de Compra</h1>
                    
                    <div class="filters">
                        <div class="filter-group">
                            <label class="filter-label">Estabelecimento</label>
                            <select id="filtroEstabelecimentoCompra">
                                <option value="Todos">Todos</option>
                                <option value="MATRIZ">MATRIZ</option>
                                <option value="AFPNEUS">AFPNEUS</option>
                                <option value="BNH">BNH</option>
                                <option value="FILIAL 06">FILIAL 06</option>
                                <option value="FL03 CORON">FL03 CORON</option>
                                <option value="FL04 GUAR.">FL04 GUAR.</option>
                                <option value="FL05 ITAP">FL05 ITAP</option>
                                <option value="FL07">FL07</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">Categoria</label>
                            <select id="filtroCategoriaCompra">
                                <option value="Todas">Todas</option>
                                <option value="PNEUS">Pneus</option>
                                <option value="LUBRIFICANTES/ADITIVOS">Lubrificantes/Aditivos</option>
                                <option value="PEÇAS">Peças</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">Status</label>
                            <select id="filtroStatusCompra">
                                <option value="Todos">Todos</option>
                                <option value="Crítico">Crítico</option>
                                <option value="Urgente">Urgente</option>
                                <option value="Atenção">Atenção</option>
                                <option value="Normal">Normal</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">Pesquisar Item</label>
                            <input type="text" id="pesquisaItem" placeholder="Código ou descrição...">
                        </div>
                        
                        <button class="filter-button" id="btnAplicarFiltrosCompra">Aplicar</button>
                    </div>
                    
                    <div class="tabs">
                        <div class="tab active" data-tab="compraRegular">Regular</div>
                        <div class="tab" data-tab="compraOportunidade">Oportunidades</div>
                    </div>
                    
                    <div class="tab-content active" id="tab-compraRegular">
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Cód Item</th>
                                        <th>Descrição</th>
                                        <th>Categoria</th>
                                        <th>Estabelecimento</th>
                                        <th>Estoque Atual</th>
                                        <th>Estoque Mínimo</th>
                                        <th>Média Vendas (30d)</th>
                                        <th>Previsão Vendas (30d)</th>
                                        <th>Dias em Estoque</th>
                                        <th>Sugestão de Compra</th>
                                        <th>Melhor Fornecedor</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody id="tabelaSugestoesCompra">
                                    <!-- Dados serão carregados dinamicamente -->
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="pagination" id="paginacaoCompras">
                            <div class="pagination-item active">1</div>
                            <div class="pagination-item">2</div>
                            <div class="pagination-item">3</div>
                            <div class="pagination-item">4</div>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="tab-compraOportunidade">
                        <div class="alert alert-info">
                            <strong>Oportunidades de compra!</strong> Produtos com preços favoráveis ou com tendência de alta nos preços, recomendados para compra antecipada.
                        </div>
                        
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Cód Item</th>
                                        <th>Descrição</th>
                                        <th>Categoria</th>
                                        <th>Tipo Oportunidade</th>
                                        <th>Preço Médio</th>
                                        <th>Preço Atual</th>
                                        <th>Variação</th>
                                        <th>Estoque Atual</th>
                                        <th>Qtd Sugerida</th>
                                        <th>Economia Potencial</th>
                                        <th>Fornecedor</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody id="tabelaOportunidadesCompra">
                                    <!-- Dados serão carregados dinamicamente -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <!-- Página: Transferências -->
                <div class="page" id="page-transferencias">
                    <h1 class="page-title">Transferências Recomendadas</h1>
                    
                    <div class="filters">
                        <div class="filter-group">
                            <label class="filter-label">Origem</label>
                            <select id="filtroOrigem">
                                <option value="Todos">Todos</option>
                                <option value="MATRIZ">MATRIZ</option>
                                <option value="FILIAL 06">FILIAL 06</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">Destino</label>
                            <select id="filtroDestino">
                                <option value="Todos">Todos</option>
                                <option value="AFPNEUS">AFPNEUS</option>
                                <option value="BNH">BNH</option>
                                <option value="FL03 CORON">FL03 CORON</option>
                                <option value="FL04 GUAR.">FL04 GUAR.</option>
                                <option value="FL05 ITAP">FL05 ITAP</option>
                                <option value="FL07">FL07</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">Categoria</label>
                            <select id="filtroCategoriaTransf">
                                <option value="Todas">Todas</option>
                                <option value="PNEUS">Pneus</option>
                                <option value="LUBRIFICANTES/ADITIVOS">Lubrificantes/Aditivos</option>
                                <option value="PEÇAS">Peças</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">Status</label>
                            <select id="filtroStatusTransf">
                                <option value="Todos">Todos</option>
                                <option value="Crítico">Crítico</option>
                                <option value="Urgente">Urgente</option>
                                <option value="Recomendado">Recomendado</option>
                                <option value="Opcional">Opcional</option>
                            </select>
                        </div>
                        
                        <button class="filter-button" id="btnAplicarFiltrosTransf">Aplicar</button>
                    </div>
                    
                    <div class="alert alert-warning">
                        <strong>Nota:</strong> Apenas a MATRIZ pode transferir para todas as filiais. A FILIAL 06 transfere apenas pneus Michelin para outras unidades.
                    </div>
                    
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Cód Item</th>
                                    <th>Descrição</th>
                                    <th>Categoria</th>
                                    <th>Origem</th>
                                    <th>Estoque Origem</th>
                                    <th>Destino</th>
                                    <th>Estoque Destino</th>
                                    <th>Qtd Sugerida</th>
                                    <th>Dias Cobertura</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="tabelaTransferenciasCompleta">
                                <!-- Dados serão carregados dinamicamente -->
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="pagination" id="paginacaoTransferencias">
                        <div class="pagination-item active">1</div>
                        <div class="pagination-item">2</div>
                        <div class="pagination-item">3</div>
                    </div>
                </div>
                
                <!-- Página: Oportunidades -->
                <div class="page" id="page-oportunidades">
                    <h1 class="page-title">Oportunidades de Compra</h1>
                    
                    <div class="filters">
                        <div class="filter-group">
                            <label class="filter-label">Categoria</label>
                            <select id="filtroCategoriaOport">
                                <option value="Todas">Todas</option>
                                <option value="PNEUS">Pneus</option>
                                <option value="LUBRIFICANTES/ADITIVOS">Lubrificantes/Aditivos</option>
                                <option value="PEÇAS">Peças</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">Tipo de Oportunidade</label>
                            <select id="filtroTipoOport">
                                <option value="Todos">Todos</option>
                                <option value="Preço atual favorável">Preço atual favorável</option>
                                <option value="Antecipação por tendência de alta">Tendência de alta</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">Economia Mínima</label>
                            <input type="number" id="filtroEconomiaMin" min="0" step="100" placeholder="R$ 0,00">
                        </div>
                        
                        <button class="filter-button" id="btnAplicarFiltrosOport">Aplicar</button>
                    </div>
                    
                    <div class="card-container">
                        <div class="card">
                            <div class="card-header">
                                <span class="card-icon">💰</span>
                                Economia Potencial Total
                            </div>
                            <div class="stat">R$ 15.800,00</div>
                            <p>Total de economia identificada nas oportunidades</p>
                        </div>
                        
                        <div class="card">
                            <div class="card-header">
                                <span class="card-icon">📉</span>
                                Preços Favoráveis
                            </div>
                            <div class="stat">8</div>
                            <p>Produtos com preços abaixo da média histórica</p>
                        </div>
                        
                        <div class="card">
                            <div class="card-header">
                                <span class="card-icon">📈</span>
                                Tendência de Alta
                            </div>
                            <div class="stat">5</div>
                            <p>Produtos com tendência de aumento de preço</p>
                        </div>
                    </div>
                    
                    <div class="section-title">
                        <span class="section-title-icon">💰</span>
                        Lista de Oportunidades
                    </div>
                    
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Cód Item</th>
                                    <th>Descrição</th>
                                    <th>Categoria</th>
                                    <th>Tipo Oportunidade</th>
                                    <th>Preço Médio</th>
                                    <th>Preço Atual</th>
                                    <th>Economia/%</th>
                                    <th>Estoque Atual</th>
                                    <th>Consumo Mensal</th>
                                    <th>Qtd Sugerida</th>
                                    <th>Economia Potencial</th>
                                    <th>Fornecedor</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="tabelaOportunidadesCompleta">
                                <!-- Dados serão carregados dinamicamente -->
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Página: Análise de Fornecedores -->
                <div class="page" id="page-fornecedores">
                    <h1 class="page-title">Análise de Fornecedores</h1>
                    
                    <div class="filters">
                        <div class="filter-group">
                            <label class="filter-label">Fornecedor</label>
                            <select id="filtroFornecedor">
                                <option value="Todos">Todos</option>
                                <option value="Distribuidor XYZ">Distribuidor XYZ</option>
                                <option value="Continental Brasil">Continental Brasil</option>
                                <option value="Auto Peças Distribuidora">Auto Peças Distribuidora</option>
                                <option value="Castrol Distribuidora">Castrol Distribuidora</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">Categoria</label>
                            <select id="filtroCategoriaForn">
                                <option value="Todas">Todas</option>
                                <option value="PNEUS">Pneus</option>
                                <option value="LUBRIFICANTES/ADITIVOS">Lubrificantes/Aditivos</option>
                                <option value="PEÇAS">Peças</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">Classificação</label>
                            <select id="filtroClassificacao">
                                <option value="Todos">Todos</option>
                                <option value="Preferencial">Preferencial</option>
                                <option value="Recomendado">Recomendado</option>
                                <option value="Alternativo">Alternativo</option>
                                <option value="Não Recomendado">Não Recomendado</option>
                            </select>
                        </div>
                        
                        <button class="filter-button" id="btnAplicarFiltrosForn">Aplicar</button>
                    </div>
                    
                    <div class="section-title">
                        <span class="section-title-icon">🏭</span>
                        Comparativo de Fornecedores
                    </div>
                    
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Fornecedor</th>
                                    <th>Categorias</th>
                                    <th>Total Compras</th>
                                    <th>Preço Médio</th>
                                    <th>Prazo Entrega</th>
                                    <th>Última Compra</th>
                                    <th>Pontualidade</th>
                                    <th>Variação Preço</th>
                                    <th>Classificação</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="tabelaFornecedores">
                                <tr>
                                    <td>Distribuidor XYZ</td>
                                    <td>Pneus Michelin</td>
                                    <td>45</td>
                                    <td>R$ 850,00</td>
                                    <td>5 dias</td>
                                    <td>15/04/2025</td>
                                    <td>98%</td>
                                    <td>+1,2%</td>
                                    <td><span class="status status-good">Preferencial</span></td>
                                    <td>
                                        <button class="action-btn" onclick="mostrarDetalhesFornecedor('Distribuidor XYZ')">Detalhes</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Continental Brasil</td>
                                    <td>Pneus Continental</td>
                                    <td>35</td>
                                    <td>R$ 780,00</td>
                                    <td>7 dias</td>
                                    <td>10/04/2025</td>
                                    <td>95%</td>
                                    <td>+2,5%</td>
                                    <td><span class="status status-good">Preferencial</span></td>
                                    <td>
                                        <button class="action-btn" onclick="mostrarDetalhesFornecedor('Continental Brasil')">Detalhes</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Auto Peças Distribuidora</td>
                                    <td>Suspensão/Freios</td>
                                    <td>28</td>
                                    <td>R$ 320,00</td>
                                    <td>3 dias</td>
                                    <td>20/04/2025</td>
                                    <td>90%</td>
                                    <td>+3,8%</td>
                                    <td><span class="status status-warning">Alternativo</span></td>
                                    <td>
                                        <button class="action-btn" onclick="mostrarDetalhesFornecedor('Auto Peças Distribuidora')">Detalhes</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Castrol Distribuidora</td>
                                    <td>Óleos e Lubrificantes</td>
                                    <td>52</td>
                                    <td>R$ 38,50</td>
                                    <td>4 dias</td>
                                    <td>18/04/2025</td>
                                    <td>97%</td>
                                    <td>-0,5%</td>
                                    <td><span class="status status-good">Preferencial</span></td>
                                    <td>
                                        <button class="action-btn" onclick="mostrarDetalhesFornecedor('Castrol Distribuidora')">Detalhes</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="section-title">
                        <span class="section-title-icon">📊</span>
                        Análise de Preços
                    </div>
                    
                    <div class="chart-container">
                        <canvas id="priceChart"></canvas>
                    </div>
                </div>
                
                <!-- Modal de Detalhes do Item -->
                <div class="modal" id="modalDetalhesItem">
                    <div class="modal-content">
                        <div class="modal-header">
                            <div class="modal-title">Detalhes do Item</div>
                            <div class="modal-close" onclick="fecharModal('modalDetalhesItem')">&times;</div>
                        </div>
                        <div class="modal-body" id="modalDetalhesItemBody">
                            <!-- Conteúdo carregado dinamicamente -->
                        </div>
                        <div class="modal-footer">
                            <button class="action-btn" onclick="fecharModal('modalDetalhesItem')">Fechar</button>
                            <button class="action-btn green">Gerar Pedido</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Variáveis globais
        let currentPage = 'dashboard';
        
        // Inicialização
        document.addEventListener('DOMContentLoaded', function() {
            // Inicializar gráficos
            initCharts();
            
            // Adicionar event listeners
            initEventListeners();
        });
        
        // Inicialização de gráficos
        function initCharts() {
            // Gráfico de vendas
            const salesCtx = document.getElementById('salesChart').getContext('2d');
            const salesChart = new Chart(salesCtx, {
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
            
            // Inicializar outros gráficos quando necessário
            if (document.getElementById('priceChart')) {
                const priceCtx = document.getElementById('priceChart').getContext('2d');
                const priceChart = new Chart(priceCtx, {
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
        }
        
        // Inicialização de event listeners
        function initEventListeners() {
            // Menu de navegação
            document.querySelectorAll('.menu-item').forEach(item => {
                item.addEventListener('click', function() {
                    const pageId = this.getAttribute('data-page');
                    changePage(pageId);
                });
            });
            
            // Tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    const tabId = this.getAttribute('data-tab');
                    changeTab(tabId, this.parentNode);
                });
            });
            
            // Botão de atualização
            document.getElementById('btnAtualizar').addEventListener('click', function() {
                atualizarDados();
            });
            
            // Botões de filtro
            document.querySelectorAll('.filter-button').forEach(button => {
                button.addEventListener('click', function() {
                    aplicarFiltros(this.id);
                });
            });
            
            // Paginação
            document.querySelectorAll('.pagination-item').forEach(item => {
                item.addEventListener('click', function() {
                    mudarPagina(this);
                });
            });
        }
        
        // Função para mudar de página
        function changePage(pageId) {
            currentPage = pageId;
            
            // Atualizar menu
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('data-page') === pageId) {
                    item.classList.add('active');
                }
            });
            
            // Atualizar conteúdo
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            document.getElementById(`page-${pageId}`).classList.add('active');
            
            // Reinicializar gráficos se necessário
            if (pageId === 'fornecedores' && document.getElementById('priceChart')) {
                initCharts();
            }
        }
        
               
        // Função para mudar de tab
        function changeTab(tabId, tabContainer) {
            // Atualizar tabs
            tabContainer.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
                if (tab.getAttribute('data-tab') === tabId) {
                    tab.classList.add('active');
                }
            });
            
            // Atualizar conteúdo das tabs
            const parentElement = tabContainer.parentNode;
            parentElement.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
                if (content.id === `tab-${tabId}`) {
                    content.classList.add('active');
                }
            });
        }
        
        // Função para mudar de página na paginação
        function mudarPagina(elemento) {
            const paginationContainer = elemento.parentNode;
            paginationContainer.querySelectorAll('.pagination-item').forEach(item => {
                item.classList.remove('active');
            });
            elemento.classList.add('active');
            
            // Aqui seria implementada a lógica para carregar os dados da página selecionada
            carregarDadosPagina(elemento.innerText, paginationContainer.id);
        }
        
        // Função para carregar dados da página
        function carregarDadosPagina(numeroPagina, idPaginacao) {
            // Simulação de carga de dados
            console.log(`Carregando página ${numeroPagina} para ${idPaginacao}`);
            
            // Na implementação real, faria uma requisição para o backend
            // e atualizaria a tabela correspondente
        }
        
        // Função para aplicar filtros
        function aplicarFiltros(idBotao) {
            // Identificar qual conjunto de filtros está sendo aplicado
            let tipoFiltro = "";
            
            if (idBotao === "btnAplicarFiltros") {
                tipoFiltro = "dashboard";
            } else if (idBotao === "btnAplicarFiltrosCompra") {
                tipoFiltro = "compra";
            } else if (idBotao === "btnAplicarFiltrosTransf") {
                tipoFiltro = "transferencia";
            } else if (idBotao === "btnAplicarFiltrosOport") {
                tipoFiltro = "oportunidade";
            } else if (idBotao === "btnAplicarFiltrosForn") {
                tipoFiltro = "fornecedor";
            }
            
            // Coletar valores dos filtros
            const filtros = coletarFiltros(tipoFiltro);
            
            // Simular carregamento
            console.log(`Aplicando filtros para: ${tipoFiltro}`, filtros);
            
            // Exibir loading
            exibirLoading(true, tipoFiltro);
            
            // Simular tempo de processamento
            setTimeout(() => {
                // Ocultar loading
                exibirLoading(false, tipoFiltro);
                
                // Atualizar dados na interface
                atualizarDadosFiltrados(filtros, tipoFiltro);
            }, 1000);
        }
        
        // Função para coletar valores dos filtros
        function coletarFiltros(tipoFiltro) {
            const filtros = {};
            
            switch (tipoFiltro) {
                case "dashboard":
                    filtros.estabelecimento = document.getElementById("filtroEstabelecimento").value;
                    filtros.categoria = document.getElementById("filtroCategoria").value;
                    filtros.marca = document.getElementById("filtroMarca").value;
                    filtros.periodo = document.getElementById("filtroPeriodo").value;
                    break;
                case "compra":
                    filtros.estabelecimento = document.getElementById("filtroEstabelecimentoCompra").value;
                    filtros.categoria = document.getElementById("filtroCategoriaCompra").value;
                    filtros.status = document.getElementById("filtroStatusCompra").value;
                    filtros.pesquisa = document.getElementById("pesquisaItem").value;
                    break;
                case "transferencia":
                    filtros.origem = document.getElementById("filtroOrigem").value;
                    filtros.destino = document.getElementById("filtroDestino").value;
                    filtros.categoria = document.getElementById("filtroCategoriaTransf").value;
                    filtros.status = document.getElementById("filtroStatusTransf").value;
                    break;
                case "oportunidade":
                    filtros.categoria = document.getElementById("filtroCategoriaOport").value;
                    filtros.tipo = document.getElementById("filtroTipoOport").value;
                    filtros.economiaMin = document.getElementById("filtroEconomiaMin").value;
                    break;
                case "fornecedor":
                    filtros.fornecedor = document.getElementById("filtroFornecedor").value;
                    filtros.categoria = document.getElementById("filtroCategoriaForn").value;
                    filtros.classificacao = document.getElementById("filtroClassificacao").value;
                    break;
            }
            
            return filtros;
        }
        
        // Função para exibir/ocultar indicador de carregamento
        function exibirLoading(exibir, tipoConteudo) {
            // Na implementação real, adicionaria/removeria um elemento de loading
            console.log(`${exibir ? 'Exibindo' : 'Ocultando'} loading para ${tipoConteudo}`);
        }
        
        // Função para atualizar dados filtrados na interface
        function atualizarDadosFiltrados(filtros, tipoFiltro) {
            // Na implementação real, atualizaria as tabelas com os dados filtrados
            console.log(`Atualizando dados para ${tipoFiltro} com filtros:`, filtros);
        }
        
        // Função para atualizar todos os dados
        function atualizarDados() {
            // Exibir loading
            exibirLoading(true, "global");
            
            // Atualizar data/hora da atualização
            const agora = new Date();
            const dataFormatada = `${agora.getDate().toString().padStart(2, '0')}/${(agora.getMonth() + 1).toString().padStart(2, '0')}/${agora.getFullYear()} ${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;
            document.querySelector('.user-info span').textContent = `Última atualização: ${dataFormatada}`;
            
            // Simulação de requisição ao backend
            setTimeout(() => {
                // Ocultar loading
                exibirLoading(false, "global");
                
                // Atualizar cada componente da interface
                atualizarDashboard();
                atualizarSugestoesCompra();
                atualizarTransferencias();
                atualizarOportunidades();
                atualizarFornecedores();
                
                // Notificar usuário
                alert("Dados atualizados com sucesso!");
            }, 2000);
        }
        
        // Funções para atualizar cada componente da interface
        function atualizarDashboard() {
            // Atualizar cards
            document.querySelectorAll('#page-dashboard .card .stat').forEach((card, index) => {
                // Simulação de novos valores
                const valores = ["32", "18", "7", "+14%"];
                card.textContent = valores[index];
            });
            
            // Atualizar tabelas
            // Na implementação real, faria requisições ao backend
            console.log("Dashboard atualizado");
            
            // Atualizar gráficos
            initCharts();
        }
        
        function atualizarSugestoesCompra() {
            // Simulação de novos dados
            const dados = [
                {
                    codItem: "10532",
                    descricao: "PNEU 225/45R17 MICHELIN PS4",
                    categoria: "PNEUS",
                    estabelecimento: "MATRIZ",
                    estoqueAtual: 5,
                    estoqueMinimo: 10,
                    mediaVendas: 18,
                    previsaoVendas: 22,
                    diasEstoque: 8.3,
                    sugestaoCompra: 30,
                    melhorFornecedor: "Distribuidor XYZ",
                    status: "Crítico"
                },
                {
                    codItem: "8976",
                    descricao: "PNEU 195/55R16 CONTINENTAL",
                    categoria: "PNEUS",
                    estabelecimento: "FILIAL 06",
                    estoqueAtual: 3,
                    estoqueMinimo: 8,
                    mediaVendas: 12,
                    previsaoVendas: 15,
                    diasEstoque: 7.5,
                    sugestaoCompra: 20,
                    melhorFornecedor: "Continental Brasil",
                    status: "Crítico"
                }
            ];
            
            // Na implementação real, estes dados viriam do backend
            console.log("Sugestões de Compra atualizadas");
        }
        
        function atualizarTransferencias() {
            // Similar às funções anteriores
            console.log("Transferências atualizadas");
        }
        
        function atualizarOportunidades() {
            // Similar às funções anteriores
            console.log("Oportunidades atualizadas");
        }
        
        function atualizarFornecedores() {
            // Similar às funções anteriores
            console.log("Fornecedores atualizados");
        }
        
        // Funções para manipulação dos modais
        function mostrarDetalhesItem(codItem) {
            // Simular carregamento de dados do item
            const dados = {
                codItem: codItem,
                descricao: "PNEU 225/45R17 MICHELIN PS4",
                categoria: "PNEUS",
                estabelecimento: "MATRIZ",
                estoqueAtual: 5,
                estoqueMinimo: 10,
                mediaVendas: 18,
                previsaoVendas: 22,
                diasEstoque: 8.3,
                sugestaoCompra: 30,
                melhorFornecedor: "Distribuidor XYZ",
                ultimaCompra: "10/04/2025",
                precoMedio: "R$ 950,00",
                precoUltimaCompra: "R$ 980,00",
                tendenciaPreco: "+3.2%",
                historicoVendas: [
                    { mes: "Janeiro", quantidade: 20 },
                    { mes: "Fevereiro", quantidade: 18 },
                    { mes: "Março", quantidade: 22 },
                    { mes: "Abril", quantidade: 19 }
                ]
            };
            
            // Montar o conteúdo do modal
            const modalBody = document.getElementById('modalDetalhesItemBody');
            
            let html = `
                <div class="detail-row">
                    <div class="detail-label">Código do Item:</div>
                    <div class="detail-value">${dados.codItem}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Descrição:</div>
                    <div class="detail-value">${dados.descricao}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Categoria:</div>
                    <div class="detail-value">${dados.categoria}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Estabelecimento:</div>
                    <div class="detail-value">${dados.estabelecimento}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Estoque Atual:</div>
                    <div class="detail-value">${dados.estoqueAtual}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Estoque Mínimo:</div>
                    <div class="detail-value">${dados.estoqueMinimo}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Média de Vendas (30d):</div>
                    <div class="detail-value">${dados.mediaVendas}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Previsão de Vendas (30d):</div>
                    <div class="detail-value">${dados.previsaoVendas}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Dias em Estoque:</div>
                    <div class="detail-value">${dados.diasEstoque}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Sugestão de Compra:</div>
                    <div class="detail-value">${dados.sugestaoCompra}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Melhor Fornecedor:</div>
                    <div class="detail-value">${dados.melhorFornecedor}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Última Compra:</div>
                    <div class="detail-value">${dados.ultimaCompra}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Preço Médio:</div>
                    <div class="detail-value">${dados.precoMedio}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Preço Última Compra:</div>
                    <div class="detail-value">${dados.precoUltimaCompra}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Tendência de Preço:</div>
                    <div class="detail-value">${dados.tendenciaPreco}</div>
                </div>
            `;
            
            modalBody.innerHTML = html;
            
            // Exibir o modal
            document.getElementById('modalDetalhesItem').classList.add('active');
        }
        
        function mostrarDetalhesTransferencia(codItem, destino) {
            // Simular carregamento de dados da transferência
            const dados = {
                codItem: codItem,
                destino: destino,
                // Outros dados...
            };
            
            // Na implementação real, mostraria um modal com os detalhes
            console.log("Detalhes da transferência", dados);
        }
        
        function mostrarDetalhesOportunidade(codItem) {
            // Simular carregamento de dados da oportunidade
            const dados = {
                codItem: codItem,
                // Outros dados...
            };
            
            // Na implementação real, mostraria um modal com os detalhes
            console.log("Detalhes da oportunidade", dados);
        }
        
        function mostrarDetalhesFornecedor(fornecedor) {
            // Simular carregamento de dados do fornecedor
            const dados = {
                nome: fornecedor,
                // Outros dados...
            };
            
            // Na implementação real, mostraria um modal com os detalhes
            console.log("Detalhes do fornecedor", dados);
        }
        
        function fecharModal(idModal) {
            document.getElementById(idModal).classList.remove('active');
        }
        
        // Integração com o backend via API
        
        // Função para carregar dados das planilhas
        async function carregarDadosPlanilhas() {
            try {
                // Nesta implementação, vamos simular as chamadas à API
                // Na implementação real, estas seriam chamadas para a API Google Sheets
                
                // Simular carregamento do relatório de vendas
                const dadosVendas = await simulaRequisicaoAPI('getVendas');
                
                // Simular carregamento do estoque por estabelecimento
                const dadosEstoque = await simulaRequisicaoAPI('getEstoque');
                
                // Simular carregamento das notas fiscais de entrada
                const dadosNF = await simulaRequisicaoAPI('getNFEntrada');
                
                // Processar os dados com os algoritmos de IA
                processarDadosComIA(dadosVendas, dadosEstoque, dadosNF);
                
                return {
                    vendas: dadosVendas,
                    estoque: dadosEstoque,
                    nfEntrada: dadosNF
                };
            } catch (erro) {
                console.error("Erro ao carregar dados das planilhas:", erro);
                alert("Erro ao carregar dados. Verifique o console para mais detalhes.");
                return null;
            }
        }
        
        // Simulação de requisição à API
        function simulaRequisicaoAPI(endpoint) {
            return new Promise((resolve, reject) => {
                // Simular tempo de resposta
                setTimeout(() => {
                    // Dados simulados
                    let dadosSimulados = [];
                    
                    switch (endpoint) {
                        case 'getVendas':
                            dadosSimulados = [
                                { 'Date Venda': '2025-04-01', 'Estabelecimento': 'MATRIZ', 'Cód Item': '10532', 'Cód Fabricação': 'PS4-22545R17', 'Item': 'PNEU 225/45R17 MICHELIN PS4', 'Quantidade Total': 5, 'Faturamento': 5000 },
                                { 'Date Venda': '2025-04-05', 'Estabelecimento': 'MATRIZ', 'Cód Item': '10532', 'Cód Fabricação': 'PS4-22545R17', 'Item': 'PNEU 225/45R17 MICHELIN PS4', 'Quantidade Total': 3, 'Faturamento': 3000 },
                                { 'Date Venda': '2025-04-10', 'Estabelecimento': 'MATRIZ', 'Cód Item': '10532', 'Cód Fabricação': 'PS4-22545R17', 'Item': 'PNEU 225/45R17 MICHELIN PS4', 'Quantidade Total': 4, 'Faturamento': 4000 },
                                { 'Date Venda': '2025-04-15', 'Estabelecimento': 'MATRIZ', 'Cód Item': '10532', 'Cód Fabricação': 'PS4-22545R17', 'Item': 'PNEU 225/45R17 MICHELIN PS4', 'Quantidade Total': 6, 'Faturamento': 6000 }
                            ];
                            break;
                        case 'getEstoque':
                            dadosSimulados = [
                                { 'Linha Itens': 1, 'Cód Item': '10532', 'Cód Fabricação': 'PS4-22545R17', 'Item': 'PNEU 225/45R17 MICHELIN PS4', 'AFPNEUS': 3, 'BNH': 2, 'FILIAL 06': 8, 'FL03 CORON': 1, 'FL04 GUAR.': 4, 'FL05 ITAP': 2, 'FL07': 3, 'MATRIZ': 5 },
                                { 'Linha Itens': 2, 'Cód Item': '8976', 'Cód Fabricação': 'CONT-19555R16', 'Item': 'PNEU 195/55R16 CONTINENTAL', 'AFPNEUS': 2, 'BNH': 1, 'FILIAL 06': 3, 'FL03 CORON': 0, 'FL04 GUAR.': 2, 'FL05 ITAP': 1, 'FL07': 2, 'MATRIZ': 6 }
                            ];
                            break;
                        case 'getNFEntrada':
                            dadosSimulados = [
                                { 'dtalancto': '2025-03-15', 'Estabelecimento': 'MATRIZ', 'N.F (Compras)': '12345', 'Forncedor': 'Distribuidor XYZ', 'Cód Item': '10532', 'Cód Fabricação': 'PS4-22545R17', 'Marca': 'MICHELIN', 'Item': 'PNEU 225/45R17 MICHELIN PS4', 'Qtd Compra': 10, 'Custo de compra': 950 },
                                { 'dtalancto': '2025-04-10', 'Estabelecimento': 'MATRIZ', 'N.F (Compras)': '12346', 'Forncedor': 'Distribuidor XYZ', 'Cód Item': '10532', 'Cód Fabricação': 'PS4-22545R17', 'Marca': 'MICHELIN', 'Item': 'PNEU 225/45R17 MICHELIN PS4', 'Qtd Compra': 5, 'Custo de compra': 980 }
                            ];
                            break;
                        default:
                            reject(new Error(`Endpoint desconhecido: ${endpoint}`));
                            return;
                    }
                    
                    resolve(dadosSimulados);
                }, 500);
            });
        }
        
        // Função para processar dados com os algoritmos de IA
        function processarDadosComIA(dadosVendas, dadosEstoque, dadosNF) {
            // Na implementação real, aqui chamaria o módulo de IA
            // que foi desenvolvido anteriormente
            console.log("Processando dados com IA...");
            
            // Simular resultados processados
            const resultados = {
                recomendacoesCompra: [],
                transferencias: [],
                oportunidades: [],
                analisesFornecedores: []
            };
            
            // Atualizar a interface com os resultados
            atualizarInterfaceComResultadosIA(resultados);
        }
        
        // Função para atualizar interface com resultados da IA
        function atualizarInterfaceComResultadosIA(resultados) {
            // Na implementação real, atualizaria cada componente da interface
            // com base nos resultados processados pela IA
            console.log("Atualizando interface com resultados da IA...");
        }
        
        // Iniciar carregamento de dados ao iniciar a aplicação
        carregarDadosPlanilhas().then(dados => {
            if (dados) {
                console.log("Dados carregados com sucesso!");
            }
        });
    </script>
</body>
</html>
