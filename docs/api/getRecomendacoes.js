// /api/getRecomendacoes.js
import { getEstoque, getVendas } from "../../utils/sheets";

export default async function handler(req, res) {
  try {
    const estoque = await getEstoque();
    const vendas = await getVendas();

    if (!estoque || !vendas) {
      return res.status(500).json({ status: 'error', message: 'Erro ao carregar dados.' });
    }

    // Funções auxiliares
    const calcularGiroDiario = (itemCod) => {
      const vendasItem = vendas.filter(v => v['Cód Item'] == itemCod);
      if (vendasItem.length === 0) return 0;

      const vendasTotal = vendasItem.reduce((sum, venda) => sum + (venda['Quantidade Total'] || 0), 0);
      const diasPeriodo = 180;
      return vendasTotal / diasPeriodo;
    };

    const calcularEstoqueMinimo = (giroDiario) => {
      const diasProtecao = 15;
      return Math.ceil(giroDiario * diasProtecao);
    };

    const recomendacoes = [];

    estoque.forEach(produto => {
      const codItem = produto['Cód Item'];
      const estoqueAtual = produto['Estoque Atual'] || 0;
      const giroDiario = calcularGiroDiario(codItem);
      const estoqueMinimo = calcularEstoqueMinimo(giroDiario);

      if (estoqueAtual < estoqueMinimo) {
        const qtdSugerida = Math.max(estoqueMinimo - estoqueAtual, 1);

        recomendacoes.push({
          'Cód Item': codItem,
          'Item': produto['Item'],
          'Categoria': produto['Categoria'],
          'Estabelecimento': produto['Nome Estabelecimento'],
          'Estoque Atual': estoqueAtual,
          'Estoque Mínimo': estoqueMinimo,
          'Média Vendas (30d)': Math.round(giroDiario * 30),
          'Previsão Vendas (30d)': Math.round(giroDiario * 30),
          'Dias em Estoque': giroDiario > 0 ? Math.round(estoqueAtual / giroDiario) : 'N/D',
          'Qtd Sugerida': qtdSugerida,
          'Melhor Fornecedor': '-', // Pode preencher depois puxando fornecedores
          'Status': determinarStatus(estoqueAtual, estoqueMinimo)
        });
      }
    });

    res.status(200).json({ status: 'success', data: recomendacoes });

  } catch (error) {
    console.error("Erro em getRecomendacoes:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}

// Função para determinar o status
function determinarStatus(estoqueAtual, estoqueMinimo) {
  if (estoqueAtual <= 0) return 'Crítico';
  if (estoqueAtual < estoqueMinimo / 2) return 'Urgente';
  if (estoqueAtual < estoqueMinimo) return 'Atenção';
  return 'Normal';
}
