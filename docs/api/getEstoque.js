// /api/getEstoque.js

import { google } from 'googleapis';
import { auth } from '../googleAuth';

const CACHE_TTL_MS = 60 * 1000; // 1 minuto de cache em memória
let estoqueCache = { timestamp: 0, data: null };

export default async function handler(req, res) {
  try {
    // Query params para filtro e paginação
    const {
      estabelecimento,    // ex: ?estabelecimento=MATRIZ
      categoria,          // ex: ?categoria=PNEUS
      limit = 1000,
      page = 1
    } = req.query;

    const now = Date.now();
    // Retorna cache se válido
    if (estoqueCache.data && now - estoqueCache.timestamp < CACHE_TTL_MS) {
      return respond(estoqueCache.data);
    }

    // Busca no Google Sheets
    const sheets        = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SHEET_ID;
    const tab           = process.env.SHEET_TAB_ESTOQUE || 'EstoquePorEstabelecimentoIA';
    const range         = `${tab}!A1:Z`;

    const { data: { values = [] } } = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });

    if (values.length < 2) {
      return res.status(404).json({ status: 'error', message: 'Sem dados de estoque.' });
    }

    const [header, ...rows] = values;
    // Monta array de objetos normalizados
    const estoque = rows.map(row => {
      const obj = {};
      header.forEach((col, idx) => {
        let val = row[idx] ?? '';

        // Campos numéricos
        if (/estoque|saldo|quantidade/i.test(col)) {
          val = parseFloat(String(val).replace(',', '.')) || 0;
        }
        // Data (caso tenha alguma)
        if (/data/i.test(col)) {
          val = normalizeDate(val);
        }
        obj[col] = val;
      });
      return obj;
    });

    // Calcula 'Estoque Total' se não existir
    estoque.forEach(item => {
      if (item['Estoque Total'] == null) {
        const keys = Object.keys(item).filter(k => /estoque atual/i.test(k));
        item['Estoque Total'] = keys.reduce((sum, k) => sum + (item[k] || 0), 0);
      }
    });

    // Ordena pelo código do item
    estoque.sort((a, b) => {
      const aKey = String(a['Cód Item'] || '').padStart(10, ' ');
      const bKey = String(b['Cód Item'] || '').padStart(10, ' ');
      return aKey.localeCompare(bKey);
    });

    // Atualiza cache
    estoqueCache = { timestamp: now, data: estoque };

    return respond(estoque);

  } catch (err) {
    console.error('Erro em getEstoque.js:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }

  // --- Função interna para filtrar, paginar e responder ---
  function respond(all) {
    let filtered = all;

    if (estabelecimento) {
      filtered = filtered.filter(r =>
        String(r['Nome Estabelecimento'] || '')
          .toLowerCase()
          .includes(estabelecimento.toLowerCase())
      );
    }
    if (categoria) {
      filtered = filtered.filter(r =>
        String(r['Categoria'] || '')
          .toLowerCase()
          .includes(categoria.toLowerCase())
      );
    }

    const lim = parseInt(limit, 10);
    const pg  = Math.max(1, parseInt(page, 10));
    const start = (pg - 1) * lim;
    const paged = filtered.slice(start, start + lim);

    return res.status(200).json({
      status: 'success',
      meta: {
        total: filtered.length,
        pages: Math.ceil(filtered.length / lim),
        page: pg,
        limit: lim
      },
      data: paged
    });
  }
}

// Converte "dd/mm/yyyy" ou ISO → ISO (yyyy-mm-dd)
function normalizeDate(str) {
  if (!str) return '';
  // brasileiro
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [d, m, y] = str.split('/');
    return `${y}-${m}-${d}`;
  }
  const d = new Date(str);
  return isNaN(d) ? str : d.toISOString().slice(0, 10);
}
