// /api/getOportunidadesCompra.js
import { google } from 'googleapis';
import { auth } from '../googleAuth'; // ou '../script/googleAuth' se estiver no docs/script

export default async function handler(req, res) {
  try {
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.SHEET_ID;

    // Buscar dados de Estoque
    const estoqueResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'EstoquePorEstabelecimentoIA!A1:Z',
    });

    const [estoqueHeader, ...estoqueRows] = estoqueResponse.data.values || [];

    if (!estoqueHeader || estoqueRows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Sem dados de estoque encontrados.' });
    }

    // Normalizar dados de estoque
    const estoque = estoqueRows.map((row) => {
      const obj = {};
      estoqueHeader.forEach((col, idx) => {
        let valor = row[idx] ?? '';
        if (col.toLowerCase().includes('estoque') || col.toLowerCase().includes('quantidade')) {
          valor = parseFloat(valor.replace(',', '.')) || 0;
        }
        obj[col] = valor;
      });
      return obj;
    });

    const oportunidades = [];

    estoque.forEach(produto => {
      const codItem = produto['Cód Item'];
      const estoqueAtual = produto['Estoque Atual'] || 0;

      // 🧠 Simula inteligência de preço
      const precoMedio = gerarPrecoMedioAleatorio();
      const precoAtual = gerarPrecoAtualAleatorio(precoMedio);

      const economiaPercentual = precoMedio > 0 ? ((precoMedio - precoAtual) / precoMedio) * 100 : 0;

      // 🔥 Critério de oportunidade: economia acima de 5%
      if (economiaPercentual > 5) {
        oportunidades.push({
          'Cód Item': codItem,
          'Item': produto['Item'],
          'Categoria': produto['Categoria'],
          'Tipo': economiaPercentual > 10 ? 'Preço atual favorável' : 'Antecipação por tendência de alta',
          'Preço Médio Histórico': precoMedio.toFixed(2),
          'Preço Atual': precoAtual.toFixed(2),
          'Economia/%': `${economiaPercentual.toFixed(1)}%`,
          'Qtd Sugerida': Math.max(2, Math.round(Math.random() * 5)),
          'Melhor Fornecedor': '-', // Pode integrar com dados reais depois
        });
      }
    });

    return res.status(200).json({ status: 'success', data: oportunidades });

  } catch (error) {
    console.error("Erro em getOportunidadesCompra:", error.message);
    return res.status(500).json({ status: 'error', message: error.message });
  }
}

// 📈 Simula Preço Médio
function gerarPrecoMedioAleatorio() {
  return Math.random() * (500 - 100) + 100; // De R$100 até R$500
}

// 📉 Simula Preço Atual com variação controlada
function gerarPrecoAtualAleatorio(precoMedio) {
  const variacao = (Math.random() * 0.15) - 0.05; // Varia de -5% até +10%
  return precoMedio * (1 + variacao);
}
