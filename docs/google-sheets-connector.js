/**
 * Módulo de Conexão com Google Sheets
 * 
 * Este módulo facilita a integração entre o sistema IA Mestre em Compras
 * e as planilhas do Google Sheets que contêm os dados operacionais.
 */

const GoogleSheetsConnector = {
  // Configurações e IDs das planilhas
  config: {
    apiUrl: 'https://script.google.com/macros/s/AKfycbyAgume_XQT7idBi8eBePUI2wljm53uNqtwrxY_fD3fjftAv91Rf2KCcYU0v0Lf2Qxvjg/exec',
    planilhas: {
      vendas: '1Wm9TdTPAMY89SgFz98kFlywkqJ41pWI_',
      estoque: '1HSsZtCU4S32X274CuFusOI-jTC1fKbl7',
      nfEntrada: '115p0LOJLX7un46GMM1Ak6T7IGp7Fi3bo'
    }
  },
  
  /**
   * Inicializa o conector com configurações customizadas (opcional)
   * @param {Object} customConfig - Configurações personalizadas
   */
  inicializar(customConfig = null) {
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }
    
    console.log('GoogleSheetsConnector inicializado com sucesso!');
    return this;
  },
  
  /**
   * Realiza uma requisição para a API do Google Sheets
   * @param {String} action - Ação a ser executada
   * @param {Object} params - Parâmetros adicionais
   * @return {Promise} Promessa com os dados da resposta
   */
  async fazerRequisicao(action, params = {}) {
    try {
      const url = new URL(this.config.apiUrl);
      url.searchParams.append('action', action);
      
      // Adicionar parâmetros adicionais
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(`Erro na API: ${data.message}`);
      }
      
      return data.data;
    } catch (error) {
      console.error('Erro ao fazer requisição para Google Sheets:', error);
      throw error;
    }
  },
  
  /**
   * Obtém os dados do relatório de vendas
   * @param {Object} filtros - Filtros opcionais a serem aplicados
   * @return {Promise} Promessa com os dados de vendas
   */
  async obterDadosVendas(filtros = {}) {
    return this.fazerRequisicao('getVendas', filtros);
  },
  
  /**
   * Obtém os dados de estoque por estabelecimento
   * @param {Object} filtros - Filtros opcionais a serem aplicados
   * @return {Promise} Promessa com os dados de estoque
   */
  async obterDadosEstoque(filtros = {}) {
    return this.fazerRequisicao('getEstoque', filtros);
  },
  
  /**
   * Obtém os dados de notas fiscais de entrada
   * @param {Object} filtros - Filtros opcionais a serem aplicados
   * @return {Promise} Promessa com os dados de compras
   */
  async obterDadosNFEntrada(filtros = {}) {
    return this.fazerRequisicao('getNFEntrada', filtros);
  },
  
  /**
   * Obtém recomendações geradas pela IA
   * @return {Promise} Promessa com as recomendações de compra
   */
  async obterRecomendacoes() {
    return this.fazerRequisicao('getRecomendacoes');
  },
  
  /**
   * Solicita geração de novas recomendações baseadas nos dados atuais
   * @return {Promise} Promessa com status da operação
   */
  async gerarNovasRecomendacoes() {
    try {
      const resultado = await this.fazerRequisicao('triggerRecomendacoes');
      return {
        sucesso: true,
        mensagem: 'Recomendações geradas com sucesso',
        dados: resultado
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: `Erro ao gerar recomendações: ${error.message}`,
        erro: error
      };
    }
  },
  
  /**
   * Registra uma compra realizada no sistema
   * @param {Object} dadosCompra - Dados da compra a ser registrada
   * @return {Promise} Promessa com status da operação
   */
  async registrarCompra(dadosCompra) {
    try {
      const resultado = await this.fazerRequisicao('registrarCompra', {
        dados: JSON.stringify(dadosCompra)
      });
      
      return {
        sucesso: true,
        mensagem: 'Compra registrada com sucesso',
        dados: resultado
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: `Erro ao registrar compra: ${error.message}`,
        erro: error
      };
    }
  },
  
  /**
   * Registra uma transferência realizada no sistema
   * @param {Object} dadosTransferencia - Dados da transferência
   * @return {Promise} Promessa com status da operação
   */
  async registrarTransferencia(dadosTransferencia) {
    try {
      const resultado = await this.fazerRequisicao('registrarTransferencia', {
        dados: JSON.stringify(dadosTransferencia)
      });
      
      return {
        sucesso: true,
        mensagem: 'Transferência registrada com sucesso',
        dados: resultado
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: `Erro ao registrar transferência: ${error.message}`,
        erro: error
      };
    }
  },
  
  /**
   * Obtém análises e estatísticas de fornecedores
   * @param {Object} filtros - Filtros opcionais
   * @return {Promise} Promessa com dados de fornecedores
   */
  async obterAnalisesFornecedores(filtros = {}) {
    return this.fazerRequisicao('getAnalisesFornecedores', filtros);
  },
  
  /**
   * Obtém histórico de compras por período
   * @param {String} dataInicio - Data de início (formato YYYY-MM-DD)
   * @param {String} dataFim - Data de fim (formato YYYY-MM-DD)
   * @return {Promise} Promessa com histórico de compras
   */
  async obterHistoricoCompras(dataInicio, dataFim) {
    return this.fazerRequisicao('
