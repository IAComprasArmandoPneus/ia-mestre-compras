// /api/getSugestoesTransferencia.js

import { getEstoque, getVendas } from '../../utils/sheets';

// Parâmetros de cache para reduzir chamadas ao Sheets
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutos
type Cache = { time: number; data: any[] };
let cache: Cache = { time: 0, data: [] };

export default async function handler(req, res) {
  try {
    // Lê query params para ajustar ML e regras
    const diasPeriodo   = +(req.query.periodo  || 180);
    const diasProtecao  = +(req.query.protecao || 15);
    const destinosParam = req.query.destinos   || 'AFPNEUS,BNH,FL03 CORON,FL04 GUAR.,FL05 ITAP,FL07';
    const lojasDestino  = destinosParam.split(',').map(s => s.trim());
    const limit         = +(req.query.limit || 1000);
    const page          = Math.max(1, +(req.query.page || 1));

    // Verifica cache
    if (Date.now() - cache.time < CACHE_TTL_MS) {
      return respond(cache.data);
    }

    // Carrega dados do Sheets
    const [estoque, vendas] = await Promise.all([ getEstoque(), getVendas() ]);
    if (!estoque || !vendas) throw new Error('Erro ao carregar dados de estoque ou vendas.');

    // Agrupa estoque por SKU × Loja
    const bySku: Record<string, Record<string, number>> = {};
    estoque.forEach(e => {
      const sku = e['Cód Item'];
      if (!bySku[sku]) bySku[sku] = {};
      bySku[sku][e['Nome Estabelecimento']] = e['Estoque Atual'] || 0;
    });

    const sugestoes: any[] = [];

    // Loop por cada SKU
    for (const sku in bySku) {
      const giroML     = forecastDailySales(vendas, sku, diasPeriodo);
      const minEstoque = Math.ceil(giroML * diasProtecao);

      const matEst = bySku[sku]['MATRIZ']   || 0;
      const f6Est  = bySku[sku]['FILIAL 06'] || 0;

      // Tenta cada destino
      for (const destino of lojasDestino) {
        const destEst = bySku[sku][destino] || 0;
        const isMichelin = sku.toUpperCase().includes('MICHELIN');
        const origem = isMichelin ? 'FILIAL 06' : 'MATRIZ';
        const orgEst = origem === 'MATRIZ' ? matEst : f6Est;

        // Protege estoque mínimo na origem
        if (orgEst <= minEstoque) continue;
        if (destEst >= minEstoque) continue;

        const needed = minEstoque - destEst;
        const qty    = Math.min(needed, orgEst - minEstoque);
        if (qty <= 0) continue;

        sugestoes.push({
          'Cód Item': sku,
          Origem: origem,
          Destino: destino,
          'Qtd Sugerida': qty,
          'Estoque Origem': orgEst,
          'Estoque Destino': destEst,
          'Previsão Diária (ML)': parseFloat(giroML.toFixed(2)),
          'Dias Cobertura': giroML > 0 ? Math.round((destEst + qty) / giroML) : 'N/D',
          Status: determinarStatus(destEst, minEstoque)
        });
      }
    }

    // Ordena por prioridade e quantidade decrescente
    sugestoes.sort((a, b) => {
      const prio = { 'Crítico': 1, 'Urgente': 2, 'Recomendado': 3, 'Opcional': 4 };
      return (prio[a.Status] - prio[b.Status]) || (b['Qtd Sugerida'] - a['Qtd Sugerida']);
    });

    // Atualiza cache e responde
    cache = { time: Date.now(), data: sugestoes };
    return respond(sugestoes);

  } catch (error) {
    console.error('Erro em getSugestoesTransferencia.js:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }

  // Função interna para paginação e resposta
  function respond(all: any[]) {
    const start = (page - 1) * limit;
    const paged = all.slice(start, start + limit);
    return res.status(200).json({
      status: 'success',
      meta: { total: all.length, pages: Math.ceil(all.length / limit), page, limit },
      data: paged
    });
  }
}

/**
 * Previsão de vendas diárias via regressão linear simples
 * @param {Array} vendas Todos os registros de vendas
 * @param {string} sku  SKU do produto
 * @param {number} diasHist Histórico em dias a utilizar
 * @returns {number} previsão de vendas média diária
 */
function forecastDailySales(vendas: any[], sku: string, diasHist: number): number {
  // Filtra vendas do SKU e últimos dias
  const hoje = new Date();
  const vendasSku = vendas
    .map(v => ({
      date: new Date(v['Date Venda'] || v['Data Venda']),
      qty: Number(v['Quantidade Total'] || 0)
    }))
    .filter(v => v.date instanceof Date && !isNaN(v.date.getTime()))
    .filter(v => v.date >= new Date(hoje.getTime() - diasHist * 24*60*60*1000) && v.qty > 0);

  if (!vendasSku.length) return 0;

  // Agrupa por dia e monta X e Y
  const dayMap: Record<string, number> = {};
  vendasSku.forEach(v => {
    const key = v.date.toISOString().slice(0,10);
    dayMap[key] = (dayMap[key] || 0) + v.qty;
  });

  const items = Object.entries(dayMap)
    .sort((a,b)=>a[0].localeCompare(b[0]))
    .map(([date, sum], i) => ({ x: i+1, y: sum }));

  // Calcula média X e Y
  const n = items.length;
  const meanX = items.reduce((s,i)=>s + i.x,0)/n;
  const meanY = items.reduce((s,i)=>s + i.y,0)/n;

  // Covariância e variância
  let cov=0, varX=0;
  items.forEach(i=>{
    cov  += (i.x-meanX)*(i.y-meanY);
    varX += (i.x-meanX)**2;
  });
  const slope = varX? cov/varX : 0;
  const intercept = meanY - slope*meanX;

  // Predição para o próximo dia (x = n+1)
  const pred = intercept + slope*(n+1);
  return Math.max(pred, 0);
}

// Determina status com base no estoque e mínimo
function determinarStatus(dest: number, min: number): string {
  if (dest <= 0) return 'Crítico';
  if (dest < min/2) return 'Urgente';
  if (dest < min)   return 'Recomendado';
  return 'Opcional';
}
