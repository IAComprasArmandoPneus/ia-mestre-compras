// /api/getVendas.js
import { google } from 'googleapis';
import { auth } from '../../utils/googleAuth';

const CACHE_TTL_MS = 60 * 1000; // 1 minuto de cache
let vendasCache = {
  timestamp: 0,
  data: null,
};

/**
 * GET /api/getVendas?startDate=yyyy-mm-dd&endDate=yyyy-mm-dd&limit=100&page=1
 */
export default async function handler(req, res) {
  try {
    // 1) Filtragem via query params
    const { startDate, endDate, limit = 1000, page = 1 } = req.query;
    const start = startDate ? new Date(startDate) : null;
    const end   = endDate   ? new Date(endDate)   : null;

    // 2) Cache simples
    const now = Date.now();
    if (vendasCache.data && (now - vendasCache.timestamp) < CACHE_TTL_MS) {
      return filtrarEPaginar(vendasCache.data);
    }

    // 3) Busca no Google Sheets
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SHEET_ID;
    const range          = `${process.env.SHEET_TAB_VENDAS || 'RelatorioVendasIA'}!A1:Z`;
    const { data: { values = [] } } = await sheets.spreadsheets.values.get({ spreadsheetId, range });

    if (values.length < 2) {
      return res.status(404).json({ status: 'error', message: 'Sem dados de vendas.' });
    }

    const [header, ...rows] = values;
    const vendas = rows.map(row => {
      const obj = {};
      header.forEach((col, idx) => {
        let val = row[idx] ?? '';

        // Normalizações
        const lc = col.toLowerCase();
        if (lc.includes('date') || lc.includes('data')) {
          val = formatarData(val);
        }
        if (/quantidade|faturamento|valor|total/.test(lc)) {
          val = parseFloat(val.replace(',', '.')) || 0;
        }

        obj[col] = val;
      });
      return obj;
    });

    // 4) Extintiva: sinaliza itens com queda nos últimos 30 dias
    const hoje = new Date();
    vendas.forEach(v => {
      if (v['Date Venda']) {
        const dataVenda = new Date(v['Date Venda']);
        const dias = (hoje - dataVenda) / (1000*60*60*24);
        v.__extincao = dias > 30 ? '↓ tendência de queda' : '';
      }
    });

    // 5) Ordena por data desc
    vendas.sort((a,b) => new Date(b['Date Venda']) - new Date(a['Date Venda']));

    // 6) Atualiza cache
    vendasCache = { timestamp: now, data: vendas };

    return filtrarEPaginar(vendas);

  } catch (err) {
    console.error('getVendas.js error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }

  /** helper: aplica filtros de data e paginação */
  function filtrarEPaginar(all) {
    let filtered = all;
    if (start) filtered = filtered.filter(r => new Date(r['Date Venda']) >= start);
    if (end)   filtered = filtered.filter(r => new Date(r['Date Venda']) <= end);

    const lim  = parseInt(limit, 10);
    const pg   = Math.max(1, parseInt(page, 10));
    const slice = filtered.slice((pg-1)*lim, pg*lim);

    res.status(200).json({
      status: 'success',
      meta: {
        total: filtered.length,
        page: pg,
        limit: lim,
        pages: Math.ceil(filtered.length/lim),
      },
      data: slice
    });
  }
}

// Normaliza string de data (ISO ↔ dd/mm/yyyy)
function formatarData(str) {
  if (!str) return '';
  // já está em pt-BR?
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return str;
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString('pt-BR');
}
