// /api/getSugestoesTransferencia.js
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
      const diasPeriodo = 180; // Usando média dos últimos 180 dias
      return vendasTotal / diasPeriodo;
    };

    const calcularEstoqueMinimo = (giroDiario) => {
      const diasProtecao = 15; // Queremos estoque para pelo menos 15 dias
      return Math.ceil(giroDiario * diasProtecao);
    };

    const lojasDestino = ["AFPNEUS", "BNH", "FL03 CORON", "FL04 GUAR.", "FL05 ITAP", "FL07"];

    // Processar transferências
    const sugestoes = [];

    // Agrupar estoque por item
    const agrupado = {};
    estoque.forEach(e => {
      if (!agrupado[e['Cód Item']]) {
        agrupado[e['Cód Item']] = {};
      }
      agrupado[e['Cód Item']][e['Nome Estabelecimento']] = e['Estoque Atual'] || 0;
    });

    for (const codItem in agrupado) {
      const estoquePorLoja = agrupado[codItem];
      const giroDiario = calcularGiroDiario(codItem);
      const estoqueMinimo = calcularEstoqueMinimo(giroDiario);

      const estoqueMatriz = estoquePorLoja['MATRIZ'] || 0;
      const estoqueFilial06 = estoquePorLoja['FILIAL 06'] || 0;

      for (const destino of lojasDestino) {
        const estoqueDestino = estoquePorLoja[destino] || 0;

        // Definir Origem
        let origem = null;
        if (codItem.includes('MICHELIN')) {
          origem = 'FILIAL 06';
          if (estoqueFilial06 <= estoqueMinimo) continue; // Protege estoque mínimo da Filial 06
        } else {
          origem = 'MATRIZ';
          if (estoqueMatriz <= estoqueMinimo) continue; // Protege estoque mínimo da Matriz
        }

        // Verificar necessidade de transferência
        if (estoqueDestino < estoqueMinimo) {
          const quantidadeNecessaria = estoqueMinimo - estoqueDestino;
          const estoqueDisponivelOrigem = origem === 'MATRIZ' ? estoqueMatriz : estoqueFilial06;
          const qtdSugerida = Math.min(quantidadeNecessaria, estoqueDisponivelOrigem - estoqueMinimo);

          if (qtdSugerida > 0) {
            sugestoes.push({
              'Cód Item': codItem,
              'Origem': origem,
              'Destino': destino,
              'Qtd Sugerida': qtdSugerida,
              'Estoque Origem': estoqueDisponivelOrigem,
              'Estoque Destino': estoqueDestino,
              'Dias Cobertura': giroDiario > 0 ? Math.round((estoqueDestino + qtdSugerida) / giroDiario) : 'N/D',
              'Status': determinarStatus(estoqueDestino, estoqueMinimo)
            });
          }
        }
      }
    }

    res.status(200).json({ status: 'success', data: sugestoes });

  } catch (error) {
    console.error("Erro em getSugestoesTransferencia:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}

// Função para determinar o status baseado no estoque
function determinarStatus(estoqueDestino, estoqueMinimo) {
  if (estoqueDestino <= 0) return 'Crítico';
  if (estoqueDestino < estoqueMinimo / 2) return 'Urgente';
  if (estoqueDestino < estoqueMinimo) return 'Recomendado';
  return 'Opcional';
}
