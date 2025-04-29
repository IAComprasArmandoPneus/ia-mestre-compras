// /api/getOportunidadesCompra.js
import { getEstoque, getVendas } from "../../utils/sheets";

export default async function handler(req, res) {
  try {
    const estoque = await getEstoque();
    const vendas = await getVendas();

    if (!estoque || !vendas) {
      return res.status(500).json({ status: 'error', message: 'Erro ao carregar dados.' });
    }

    const oportunidades = [];

    estoque.forEach(produto => {
      const codItem = produto['Cód Item'];
      const estoqueAtual = produto['Estoque Atual'] || 0;

      // Simular preço médio histórico e preço atual
      const precoMedio = gerarPrecoMedioAleatorio();
      const precoAtual = gerarPrecoAtualAleatorio(precoMedio);

      const economiaPercentual = precoMedio > 0 ? ((precoMedio - precoAtual) / precoMedio) * 100 : 0;

      if (economiaPercentual > 5) { // Só oportunidades com economia acima de 5%
        oportunidades.push({
          'Cód Item': codItem,
          'Item': produto['Item'],
          'Categoria': produto['Categoria'],
          'Tipo': economiaPercentual > 10 ? 'Preço atual favorável' : 'Antecipação por tendência de alta',
          'Preço Médio Histórico': precoMedio.toFixed(2),
          'Preço Atual': precoAtual.toFixed(2),
          'Economia/%': `${economiaPercentual.toFixed(1)}%`,
          'Qtd Sugerida': Math.max(2, Math.round(Math.random() * 5)),
          'Melhor Fornecedor': '-', // Pode ser integrado depois
        });
      }
    });

    res.status(200).json({ status: 'success', data: oportunidades });

  } catch (error) {
    console.error("Erro em getOportunidadesCompra:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}

// Simula preços médios
function gerarPrecoMedioAleatorio() {
  return Math.random() * (500 - 100) + 100; // Entre R$100 e R$500
}

// Simula preços atuais com variação
function gerarPrecoAtualAleatorio(precoMedio) {
  const variacao = (Math.random() * 0.15) - 0.05; // -5% a +10%
  return precoMedio * (1 + variacao);
}
