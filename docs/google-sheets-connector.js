/**
 * Classe para gerenciar conexões com o Google Sheets via Apps Script
 * Implementa padrões modernos de JavaScript e tratamento de erros
 */
const GoogleSheetsConnector = {
    // Substitua pelo ID de implantação do seu script
    urlBase: 'https://script.google.com/macros/s/AKfycbz0nDRIKbK5j-mgpArdzQ_WSx7RQUa-QUlD9fX0AHp2YPVHFxdz_knkNYOo_dnp4I73Zw/exec',
    
    /**
     * Inicializa o conector, verificando a conectividade
     * @returns {Promise} Promise resolvida quando a conexão for verificada
     */
    inicializar: async function() {
        console.log('Iniciando conector de Google Sheets...');
        try {
            // Teste básico de conectividade
            const resposta = await fetch(`${this.urlBase}?action=ping`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!resposta.ok) {
                throw new Error(`Erro de conectividade: ${resposta.status} ${resposta.statusText}`);
            }
            
            const dados = await resposta.json();
            console.log('Conector inicializado com sucesso:', dados);
            return dados;
        } catch (erro) {
            console.error('Erro ao inicializar conector:', erro);
            throw erro;
        }
    },
    
    /**
     * Obtém dados de vendas
     * @param {Object} filtros Filtros opcionais para os dados
     * @returns {Promise} Promise com os dados de vendas
     */
    obterDadosVendas: async function(filtros = {}) {
        try {
            let url = `${this.urlBase}?action=getVendas`;
            
            // Adicionar filtros à URL se fornecidos
            if (Object.keys(filtros).length > 0) {
                url += '&' + new URLSearchParams(filtros).toString();
            }
            
            const resposta = await fetch(url);
            
            if (!resposta.ok) {
                throw new Error(`Erro ao obter dados de vendas: ${resposta.status} ${resposta.statusText}`);
            }
            
            const dados = await resposta.json();
            
            if (dados.status === 'error') {
                throw new Error(dados.message || 'Erro desconhecido ao obter dados de vendas');
            }
            
            return dados.data;
        } catch (erro) {
            console.error('Erro ao obter dados de vendas:', erro);
            throw erro;
        }
    },
    
    /**
     * Obtém dados de estoque
     * @param {Object} filtros Filtros opcionais para os dados
     * @returns {Promise} Promise com os dados de estoque
     */
    obterDadosEstoque: async function(filtros = {}) {
        try {
            let url = `${this.urlBase}?action=getEstoque`;
            
            // Adicionar filtros à URL se fornecidos
            if (Object.keys(filtros).length > 0) {
                url += '&' + new URLSearchParams(filtros).toString();
            }
            
            const resposta = await fetch(url);
            
            if (!resposta.ok) {
                throw new Error(`Erro ao obter dados de estoque: ${resposta.status} ${resposta.statusText}`);
            }
            
            const dados = await resposta.json();
            
            if (dados.status === 'error') {
                throw new Error(dados.message || 'Erro desconhecido ao obter dados de estoque');
            }
            
            return dados.data;
        } catch (erro) {
            console.error('Erro ao obter dados de estoque:', erro);
            throw erro;
        }
    },
    
    /**
     * Obtém dados de notas fiscais de entrada
     * @param {Object} filtros Filtros opcionais para os dados
     * @returns {Promise} Promise com os dados de NF entrada
     */
    obterDadosNFEntrada: async function(filtros = {}) {
        try {
            let url = `${this.urlBase}?action=getNFEntrada`;
            
            // Adicionar filtros à URL se fornecidos
            if (Object.keys(filtros).length > 0) {
                url += '&' + new URLSearchParams(filtros).toString();
            }
            
            const resposta = await fetch(url);
            
            if (!resposta.ok) {
                throw new Error(`Erro ao obter dados de NF entrada: ${resposta.status} ${resposta.statusText}`);
            }
            
            const dados = await resposta.json();
            
            if (dados.status === 'error') {
                throw new Error(dados.message || 'Erro desconhecido ao obter dados de NF entrada');
            }
            
            return dados.data;
        } catch (erro) {
            console.error('Erro ao obter dados de NF entrada:', erro);
            throw erro;
        }
    },
    
    /**
     * Obtém recomendações geradas pelo algoritmo de IA
     * @returns {Promise} Promise com as recomendações
     */
    obterRecomendacoes: async function() {
        try {
            const resposta = await fetch(`${this.urlBase}?action=getRecomendacoes`);
            
            if (!resposta.ok) {
                throw new Error(`Erro ao obter recomendações: ${resposta.status} ${resposta.statusText}`);
            }
            
            const dados = await resposta.json();
            
            if (dados.status === 'error') {
                throw new Error(dados.message || 'Erro desconhecido ao obter recomendações');
            }
            
            return dados.data;
        } catch (erro) {
            console.error('Erro ao obter recomendações:', erro);
            throw erro;
        }
    },
    
    /**
     * Registra uma compra no sistema
     * @param {Object} dadosCompra Dados da compra a ser registrada
     * @returns {Promise} Promise com o resultado da operação
     */
    registrarCompra: async function(dadosCompra) {
        try {
            const resposta = await fetch(`${this.urlBase}?action=registrarCompra`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dados: JSON.stringify(dadosCompra)
                })
            });
            
            if (!resposta.ok) {
                throw new Error(`Erro ao registrar compra: ${resposta.status} ${resposta.statusText}`);
            }
            
            const dados = await resposta.json();
            
            if (dados.status === 'error') {
                throw new Error(dados.message || 'Erro desconhecido ao registrar compra');
            }
            
            return dados;
        } catch (erro) {
            console.error('Erro ao registrar compra:', erro);
            throw erro;
        }
    },
    
    /**
     * Registra uma transferência entre estabelecimentos
     * @param {Object} dadosTransferencia Dados da transferência a ser registrada
     * @returns {Promise} Promise com o resultado da operação
     */
    registrarTransferencia: async function(dadosTransferencia) {
        try {
            const resposta = await fetch(`${this.urlBase}?action=registrarTransferencia`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dados: JSON.stringify(dadosTransferencia)
                })
            });
            
            if (!resposta.ok) {
                throw new Error(`Erro ao registrar transferência: ${resposta.status} ${resposta.statusText}`);
            }
            
            const dados = await resposta.json();
            
            if (dados.status === 'error') {
                throw new Error(dados.message || 'Erro desconhecido ao registrar transferência');
            }
            
            return dados;
        } catch (erro) {
            console.error('Erro ao registrar transferência:', erro);
            throw erro;
        }
    },
    
    /**
     * Obtém análises de fornecedores
     * @param {Object} filtros Filtros opcionais para os dados
     * @returns {Promise} Promise com as análises de fornecedores
     */
    obterAnalisesFornecedores: async function(filtros = {}) {
        try {
            let url = `${this.urlBase}?action=getAnalisesFornecedores`;
            
            // Adicionar filtros à URL se fornecidos
            if (Object.keys(filtros).length > 0) {
                url += '&' + new URLSearchParams(filtros).toString();
            }
            
            const resposta = await fetch(url);
            
            if (!resposta.ok) {
                throw new Error(`Erro ao obter análises de fornecedores: ${resposta.status} ${resposta.statusText}`);
            }
            
            const dados = await resposta.json();
            
            if (dados.status === 'error') {
                throw new Error(dados.message || 'Erro desconhecido ao obter análises de fornecedores');
            }
            
            return dados.data;
        } catch (erro) {
            console.error('Erro ao obter análises de fornecedores:', erro);
            throw erro;
        }
    },
    
    /**
     * Obtém oportunidades de compra
     * @param {Object} filtros Filtros opcionais para os dados
     * @returns {Promise} Promise com as oportunidades de compra
     */
    obterOportunidadesCompra: async function(filtros = {}) {
        try {
            let url = `${this.urlBase}?action=getOportunidadesCompra`;
            
            // Adicionar filtros à URL se fornecidos
            if (Object.keys(filtros).length > 0) {
                url += '&' + new URLSearchParams(filtros).toString();
            }
            
            const resposta = await fetch(url);
            
            if (!resposta.ok) {
                throw new Error(`Erro ao obter oportunidades de compra: ${resposta.status} ${resposta.statusText}`);
            }
            
            const dados = await resposta.json();
            
            if (dados.status === 'error') {
                throw new Error(dados.message || 'Erro desconhecido ao obter oportunidades de compra');
            }
            
            return dados.data;
        } catch (erro) {
            console.error('Erro ao obter oportunidades de compra:', erro);
            throw erro;
        }
    },
    
    /**
     * Obtém sugestões de transferência
     * @param {Object} filtros Filtros opcionais para os dados
     * @returns {Promise} Promise com as sugestões de transferência
     */
    obterSugestoesTransferencia: async function(filtros = {}) {
        try {
            let url = `${this.urlBase}?action=getSugestoesTransferencia`;
            
            // Adicionar filtros à URL se fornecidos
            if (Object.keys(filtros).length > 0) {
                url += '&' + new URLSearchParams(filtros).toString();
            }
            
            const resposta = await fetch(url);
            
            if (!resposta.ok) {
                throw new Error(`Erro ao obter sugestões de transferência: ${resposta.status} ${resposta.statusText}`);
            }
            
            const dados = await resposta.json();
            
            if (dados.status === 'error') {
                throw new Error(dados.message || 'Erro desconhecido ao obter sugestões de transferência');
            }
            
            return dados.data;
        } catch (erro) {
            console.error('Erro ao obter sugestões de transferência:', erro);
            throw erro;
        }
    },
    
    /**
     * Atualiza o dashboard
     * @returns {Promise} Promise com o resultado da operação
     */
    atualizarDashboard: async function() {
        try {
            const resposta = await fetch(`${this.urlBase}?action=atualizarDashboard`);
            
            if (!resposta.ok) {
                throw new Error(`Erro ao atualizar dashboard: ${resposta.status} ${resposta.statusText}`);
            }
            
            const dados = await resposta.json();
            
            if (dados.status === 'error') {
                throw new Error(dados.message || 'Erro desconhecido ao atualizar dashboard');
            }
            
            return dados;
        } catch (erro) {
            console.error('Erro ao atualizar dashboard:', erro);
            throw erro;
        }
    }
};
