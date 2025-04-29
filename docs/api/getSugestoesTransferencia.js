// /api/getSugestoesTransferencia.js

import { google } from 'googleapis';
import { auth } from '../googleAuth'; // Caminho corrigido!

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutos
let cache = { time: 0, data: [] };

export default async function handler(req, res) {
  try {
    const diasPeriodo   = +(req.query.periodo  || 180);
    const diasProtecao  = +(req.query.protecao || 15);
    const destinosParam = req.query.destinos   || 'AFPNEUS,BNH,FL03 CORON,FL04 GUAR.,FL05 ITAP,FL07';
    const lojasDestino  = destinosParam.split(',').map(s => s.trim());
    const limit         = +(req.query.limit || 1000);
    const page          = Math.max(1, +(req.query.page || 1));

    if (Date.now() - cache.time < CACHE_TTL_MS) {
      return respond(cache.data);
    }

    // Busca direto no Google Sheets via Google API
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SHEET_ID;

    // Carregar estoque
    const estoqueResp = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'EstoquePorEstabelecimentoIA!A1:Z' });
    const vendasResp  = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'RelatorioVendasIA!A1:Z' });

    const [headerEstoque, ...rowsEstoque] = estoqueResp.data.values || [];
    const [headerVendas,  ...rowsVendas]  = vendasResp.data.values  || [];

    if (!headerEstoque || rowsEstoque.length === 0 || !headerVendas || rowsVendas.length === 0) {
      throw new Error('Erro ao carregar dados de estoque ou vendas.');
    }

    const estoque = rowsEstoque.map(row => Object.fromEntries(headerEstoque.map((col, idx) => [col, row[idx] ?? ''])));
    const vendas  = rowsVendas.map(row => Object.fromEntries(headerVendas.map((col, idx) => [col, row[idx] ?? ''])));

    const bySku = {};
    estoque.forEach(e => {
      const sku = e['Cód Item'];
      if (!bySku[sku]) bySku[sku] = {};
      bySku[sku][e['Nome Estabelecimento']] = parseFloat(e['Estoque Atual']?.replace(',', '.') || 0);
    });

    const sugestoes = [];

    for (const sku in bySku) {
      const giroML     = forecastDailySales(vendas, sku, diasPeriodo);
      const minEstoque = Math.ceil(giroML * diasProtecao);

      const matEst = bySku[sku]['MATRIZ']   || 0;
      const f6Est  = bySku[sku]['FILIAL 06'] || 0;

      for (const destino of lojasDestino) {
        const destEst = bySku[sku][destino] || 0;
        const isMichelin = sku.toUpperCase().includes('MICHELIN');
        const origem = isMichelin ? 'FILIAL 06' : 'MATRIZ';
        const orgEst = origem === 'MATRIZ' ? matEst : f6Est;

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

    sugestoes.sort((a, b) => {
      const prio = { 'Crítico': 1, 'Urgente': 2, 'Recomendado': 3, 'Opcional': 4 };
      return (prio[a.Status] - prio[b.Status]) || (b['Qtd Sugerida'] - a['Qtd Sugerida']);
    });

    cache = { time: Date.now(), data: sugestoes };
    return respond(sugestoes);

  } catch (error) {
    console.error('Erro em getSugestoesTransferencia.js:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }

  function respond(all) {
    const start = (page - 1) * limit;
    const paged = all.slice(start, start + limit);
    return res.status(200).json({
      status: 'success',
      meta: { total: all.length, pages: Math.ceil(all.length / limit), page, limit },
      data: paged
    });
  }
}

function forecastDailySales(vendas, sku, diasHist) {
  const hoje = new Date();
  const vendasSku = vendas
    .map(v => ({
      date: new Date(v['Date Venda'] || v['Data Venda']),
      qty: Number(v['Quantidade Total'] || 0)
    }))
    .filter(v => v.date instanceof Date && !isNaN(v.date.getTime()))
    .filter(v => v.date >= new Date(hoje.getTime() - diasHist * 24*60*60*1000) && v.qty > 0);

  if (!vendasSku.length) return 0;

  const dayMap = {};
  vendasSku.forEach(v => {
    const key = v.date.toISOString().slice(0,10);
    dayMap[key] = (dayMap[key] || 0) + v.qty;
  });

  const items = Object.entries(dayMap)
    .sort((a,b)=>a[0].localeCompare(b[0]))
    .map(([date, sum], i) => ({ x: i+1, y: sum }));

  const n = items.length;
  const meanX = items.reduce((s,i)=>s + i.x,0)/n;
  const meanY = items.reduce((s,i)=>s + i.y,0)/n;

  let cov=0, varX=0;
  items.forEach(i=>{
    cov  += (i.x-meanX)*(i.y-meanY);
    varX += (i.x-meanX)**2;
  });
  const slope = varX? cov/varX : 0;
  const intercept = meanY - slope*meanX;

  const pred = intercept + slope*(n+1);
  return Math.max(pred, 0);
}

function determinarStatus(dest, min) {
  if (dest <= 0) return 'Crítico';
  if (dest < min/2) return 'Urgente';
  if (dest < min)   return 'Recomendado';
  return 'Opcional';
}
