const API_URL = 'https://ia-mestre-compras-lhgm.vercel.app/api';

const googleSheetsConnector = {
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
      console.log('Dados de Vendas:', dados);
      return dados;
    } catch (erro) {
      console.error('Erro ao obter vendas:', erro);
      throw erro;
    }
  },

  // Você pode criar métodos para outras APIs depois:
  // getEstoque, getNFEntrada, etc
};
