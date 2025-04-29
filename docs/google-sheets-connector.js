const API_URL = 'https://ia-mestre-compras-lhgm.vercel.app/api';

const GoogleSheetsConnector = {
  inicializar: async function() {
    console.log('Iniciando conector da IA Mestre Compras...');
    try {
      const resposta = await fetch(`${API_URL}/ping`);
      const dados = await resposta.json();
      console.log('Conexão bem-sucedida:', dados);
      return dados;
    } catch (erro) {
      console.error('Erro ao inicializar o conector:', erro);
      throw erro;
    }
  },

  getVendas: async function() {
    try {
      const resposta = await fetch(`${API_URL}/getVendas`);
      const dados = await resposta.json();
      return dados.data || [];
    } catch (erro) {
      console.error('Erro ao obter vendas:', erro);
      throw erro;
    }
  },

  getEstoque: async function() {
    try {
      const resposta = await fetch(`${API_URL}/getEstoque`);
      const dados = await resposta.json();
      return dados.data || [];
    } catch (erro) {
      console.error('Erro ao obter estoque:', erro);
      throw erro;
    }
  },

  getNFEntrada: async function() {
    try {
      const resposta = await fetch(`${API_URL}/getNFEntrada`);
      const dados = await resposta.json();
      return dados.data || [];
    } catch (erro) {
      console.error('Erro ao obter notas fiscais de entrada:', erro);
      throw erro;
    }
  },

  obterRecomendacoes: async function() {
    try {
      const resposta = await fetch(`${API_URL}/getRecomendacoes`);
      const dados = await resposta.json();
      return dados.data || [];
    } catch (erro) {
      console.error('Erro ao obter recomendações de compra:', erro);
      throw erro;
    }
  },

  obterSugestoesTransferencia: async function() {
    try {
      const resposta = await fetch(`${API_URL}/getSugestoesTransferencia`);
      const dados = await resposta.json();
      return dados.data || [];
    } catch (erro) {
      console.error('Erro ao obter sugestões de transferência:', erro);
      throw erro;
    }
  },

  obterOportunidadesCompra: async function() {
    try {
      const resposta = await fetch(`${API_URL}/getOportunidadesCompra`);
      const dados = await resposta.json();
      return dados.data || [];
    } catch (erro) {
      console.error('Erro ao obter oportunidades de compra:', erro);
      throw erro;
    }
  },

  obterAnalisesFornecedores: async function() {
    try {
      const resposta = await fetch(`${API_URL}/getAnalisesFornecedores`);
      const dados = await resposta.json();
      return dados.data || [];
    } catch (erro) {
      console.error('Erro ao obter análise de fornecedores:', erro);
      throw erro;
    }
  }
};

export { GoogleSheetsConnector };
