// /api/getAnalisesFornecedores.js
import { getNFEntrada } from "../../utils/sheets";

export default async function handler(req, res) {
  try {
    const nfEntrada = await getNFEntrada();

    if (!nfEntrada || nfEntrada.length === 0) {
      return res.status(500).json({ status: 'error', message: 'Nenhuma nota fiscal de entrada encontrada.' });
    }

    const analises = {};

    nfEntrada.forEach(entrada => {
      const fornecedor = entrada['Forncedor'] || 'Desconhecido';
      const categoria = entrada['Categoria'] || 'Outros';
      const custo = parseFloat(entrada['Custo de compra'] || 0);
      const dataEntrada = new Date(entrada['Date (dtalancto)']);

      if (!analises[fornecedor]) {
        analises[fornecedor] = {
          nome: fornecedor,
          categorias: new Set(),
          compras: 0,
          precoTotal: 0,
          ultimaCompra: dataEntrada,
          totalValor: 0
        };
      }

      analises[fornecedor].categorias.add(categoria);
      analises[fornecedor].compras += 1;
      analises[fornecedor].precoTotal += custo;
      analises[fornecedor].totalValor += custo;

      if (dataEntrada > analises[fornecedor].ultimaCompra) {
        analises[fornecedor].ultimaCompra = dataEntrada;
      }
    });

    const resultado = Object.values(analises).map(forn => {
      const hoje = new Date();
      const diasDesdeUltimaCompra = Math.floor((hoje - forn.ultimaCompra) / (1000 * 60 * 60 * 24));

      return {
        nome: forn.nome,
        categoriasTexto: Array.from(forn.categorias).join(', '),
        compras: forn.compras,
        precoMedio: forn.compras > 0 ? forn.precoTotal / forn.compras : 0,
        leadTime: diasDesdeUltimaCompra < 10 ? 5 : 10, // Simula leadtime
        ultimaCompra: forn.ultimaCompra,
        recencia: diasDesdeUltimaCompra,
        valorTotal: forn.totalValor,
        classificacao: classificarFornecedor(forn.compras, diasDesdeUltimaCompra)
      };
    });

    res.status(200).json({ status: 'success', data: resultado });

  } catch (error) {
    console.error("Erro em getAnalisesFornecedores:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}

// Classifica fornecedor baseado em frequência de compras e recência
function classificarFornecedor(compras, recencia) {
  if (compras > 20 && recencia <= 30) return 'Preferencial';
  if (compras > 10 && recencia <= 60) return 'Recomendado';
  if (compras > 5) return 'Alternativo';
  return 'Não Recomendado';
}
