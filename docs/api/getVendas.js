import { google } from 'googleapis';
import { auth } from '../utils/googleAuth';

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache = { ts: 0, data: null };

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }
  const sheetId = process.env.SHEET_ID;
  if (!sheetId) {
    return res.status(500).json({ status: 'error', message: 'SHEET_ID não configurado' });
  }
  if (Date.now() - cache.ts < CACHE_TTL_MS && cache.data) {
    return res.status(200).json({ status: 'success', data: cache.data });
  }
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Vendas!A1:Z'
    });
    const [header, ...rows] = resp.data.values || [];
    if (!header || rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Nenhuma venda encontrada.' });
    }
    const data = rows.map(row => {
      const obj = {};
      header.forEach((col, idx) => obj[col] = row[idx] ?? '');
      return obj;
    });
    cache = { ts: Date.now(), data };
    res.status(200).json({ status: 'success', data });
  } catch (e) {
    console.error('Erro getVendas:', e);
    res.status(500).json({ status: 'error', message: e.message });
  }
}
