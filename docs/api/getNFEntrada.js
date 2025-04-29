// /api/getNFEntrada.js

import { google } from 'googleapis';
import { auth } from '../../utils/googleAuth';

const CACHE_TTL_MS = 60 * 1000; // cache de 1 minuto
let nfCache = { timestamp: 0, data: null };

export default async function handler(req, res) {
  try {
    // Query params para filtro e paginação
    const { startDate, endDate, limit = 1000, page = 1 } = req.query;
    const start = startDate ? new Date(startDate) : null;
    const end   = endDate   ? new Date(endDate)   : null;

    // Se cache válido, reutiliza
    const now = Date.now();
    if (nfCache.data && (now - nfCache.timestamp) < CACHE_TTL_MS) {
      return filterAndPaginate(nfCache.data);
    }

    // Busca no Google Sheets
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SHEET_ID;
    const tab            = process.env.SHEET_TAB_NF || 'NFEntrada_ProdutosIA';
    const range          = `${tab}!A1:Z`;

    const { data: { values = [] } } = await sheets.spreadsheets.values.get({
      spreadsheetId, range
    });

    if (values.length < 2) {
      return res.status(404).json({ status: 'error', message: 'Sem NF de entrada.' });
    }

    const [header, ...rows] = values;
    const entradas = rows.map(row => {
      const obj = {};
      header.forEach((col, idx) => {
        let val = row[idx] ?? '';

        // Data: detecta colunas com "data" ou "dtalancto"
        if (/data|dtalancto/i.test(col)) {
          val = normalizeDate(val);
        }
        // Numéricos: custo, preço, quantidade, qtd
        if (/custo|preço|quantidade|qtd/i.test(col)) {
          val = parseFloat(val.replace(',', '.')) || 0;
        }
        obj[col] = val;
      });
      return obj;
    });

    // Ordena pelo campo de data mais recente (procura qualquer coluna de data)
    const dateKey = header.find(h => /dtalancto|data/i.test(h)) || header[0];
    entradas.sort((a, b) => new Date(b[dateKey] || 0) - new Date(a[dateKey] || 0));

    // Atualiza cache
    nfCache = { timestamp: now, data: entradas };

    return filterAndPaginate(entradas);

  } catch (err) {
    console.error('getNFEntrada.js error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }

  // --- Helpers ---

  function filterAndPaginate(all) {
    let filtered = all;
    if (start) filtered = filtered.filter(r => new Date(r[dateKey] || 0) >= start);
    if (end)   filtered = filtered.filter(r => new Date(r[dateKey] || 0) <= end);

    const lim = parseInt(limit, 10);
    const pg  = Math.max(1, parseInt(page, 10));
    const slice = filtered.slice((pg - 1) * lim, pg * lim);

    return res.status(200).json({
      status: 'success',
      meta: {
        total: filtered.length,
        pages: Math.ceil(filtered.length / lim),
        page: pg,
        limit: lim
      },
      data: slice
    });
  }
}

// Converte "dd/mm/yyyy" ↔ ISO
function normalizeDate(str) {
  if (!str) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [d, m, y] = str.split('/');
    return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
  const d = new Date(str);
  return isNaN(d) ? str : d.toISOString().slice(0,10);
}
