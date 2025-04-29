const API_URL = 'https://ia-mestre-compras-lhgm.vercel.app/api';

const GoogleSheetsConnector = {
  inicializar: async function() {
    console.log('Iniciando conector da IA Mestre em Compras...');
    try {
      const resposta = await this._fetchComTimeout(`${API_URL}/ping`);
      const dados = await resposta.json();
      console.log('Conexão inicial OK ✅:', dados.status || 'Desconhecido');
      return dados;
    } catch (erro) {
      console.error('Erro na inicialização:', erro);
      throw erro;
    }
  },

  getVendas: function() {
    return this._executarRequisicao('/getVendas');
  },

  getEstoque: function() {
    return this._executarRequisicao('/getEstoque');
  },

  getNFEntrada: function() {
    return this._executarRequisicao('/getNFEntrada');
  },

  obterRecomendacoes: function() {
    return this._executarRequisicao('/getRecomendacoes');
  },

  obterSugestoesTransferencia: function() {
    return this._executarRequisicao('/getSugestoesTransferencia');
  },

  obterOportunidadesCompra: function() {
    return this._executarRequisicao('/getOportunidadesCompra');
  },

  obterAnalisesFornecedores: function() {
    return this._executarRequisicao('/getAnalisesFornecedores');
  },

  // Método centralizado para executar chamadas
  _executarRequisicao: async function(endpoint) {
    try {
      const resposta = await this._fetchComTimeout(`${API_URL}${endpoint}`);
      if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);
      
      const dados = await resposta.json();
      console.log(`✅ ${endpoint} carregado com sucesso (${(dados.data || []).length} registros)`);
      return dados.data || [];

    } catch (erro) {
      console.error(`🚨 Erro ao buscar ${endpoint}:`, erro.message);

      // Tenta uma vez novamente depois de 1 segundo
      await this._delay(1000);

      try {
        console.log(`Tentando novamente ${endpoint}...`);
        const respostaRetry = await this._fetchComTimeout(`${API_URL}${endpoint}`);
        const dadosRetry = await respostaRetry.json();
        console.log(`✅ ${endpoint} carregado na segunda tentativa`);
        return dadosRetry.data || [];
      } catch (erro2) {
        console.error(`❌ Falha definitiva em ${endpoint}:`, erro2.message);
        return []; // Evita quebrar a aplicação
      }
    }
  },

  // Fetch com timeout
  _fetchComTimeout: function(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Timeout de requisição'));
      }, timeout);

      fetch(url)
        .then(response => {
          clearTimeout(timer);
          resolve(response);
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  },

  // Função de delay
  _delay: function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

export { GoogleSheetsConnector };
