// /api/getRecomendacoes.js
import { google } from 'googleapis';
import { auth } from '../../utils/googleAuth';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min
let cache = { ts: 0, data: null };

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  const spreadsheetId = process.env.SHEET_ID;
  if (!spreadsheetId) {
    return res.status(500).json({ status: 'error', message: 'SHEET_ID não configurado' });
  }

  // Paginação opcional
  const { limit = 1000, offset = 0, status: statusFilter } = req.query;

  // Retorna do cache se ainda válido
  if (Date.now() - cache.ts < CACHE_TTL_MS && cache.data) {
    return res.status(200).json({ status: 'success', data: paginate(filterStatus(cache.data, statusFilter), offset, limit) });
  }

  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const range = 'Sugestao_IA!A1:Z';

    const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const [header, ...rows] = resp.data.values || [];

    if (!header || rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Nenhuma sugestão de compra encontrada.' });
    }

    // Pré-processa índices
    const idx = header.reduce((acc, col, i) => {
      const key = col.trim().toLowerCase();
      if (key === 'qtd sugerida')       acc.qtdSug = i;
      if (key === 'status')             acc.status = i;
      acc.cols[i] = col;
      return acc;
    }, { cols: [] });

    const recomendacoes = rows.map(row => {
      const item = {};
      header.forEach((col, i) => {
        let val = row[i] ?? '';
        if (i === idx.qtdSug) val = parseFloat(val.replace(',', '.')) || 0;
        // ... outros tratamentos específicos
        item[toCamelCase(col)] = val;
      });
      return item;
    });

    // Filtra e ordena
    let valid = filterStatus(recomendacoes, statusFilter);
    valid.sort((a, b) => prioridade[a.status] - prioridade[b.status]);

    // Atualiza cache
    cache = { ts: Date.now(), data: valid };

    // Retorna com paginação
    const paged = paginate(valid, offset, limit);
    res.status(200).json({ status: 'success', data: paged });
  } catch (err) {
    console.error('Erro em getRecomendacoes.js:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
}

// Helpers:
const prioridade = { 'Crítico': 1, 'Urgente': 2, 'Atenção': 3 };
function filterStatus(arr, statusFilter) {
  if (!statusFilter) return arr;
  const filtros = statusFilter.split(',');
  return arr.filter(item => filtros.includes(item.status));
}
function paginate(arr, offset, limit) {
  return arr.slice(Number(offset), Number(offset) + Number(limit));
}
function toCamelCase(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+(.)/g, (_, c) => c.toUpperCase());
}
