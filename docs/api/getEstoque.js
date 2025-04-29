// /api/getEstoque.js

import { google } from 'googleapis';
import { auth } from '../../utils/googleAuth'; // Autenticação centralizada

export default async function handler(req, res) {
  try {
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.SHEET_ID;
    const range = 'EstoquePorEstabelecimentoIA!A1:Z'; // Só vai até onde precisa, sem carregar lixo extra

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const [header, ...rows] = response.data.values || [];

    if (!header || rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Sem dados de estoque encontrados.' });
    }

    // Transformar linhas em objetos + limpar dados
    const estoque = rows.map((row) => {
      const obj = {};
      header.forEach((col, idx) => {
        obj[col] = row[idx] ?? '';

        // Se campo de número, trata corretamente
        if (
          col.toLowerCase().includes('estoque') ||
          col.toLowerCase().includes('saldo') ||
          col.toLowerCase().includes('quantidade')
        ) {
          obj[col] = parseFloat(obj[col]?.replace(',', '.')) || 0;
        }
      });
      return obj;
    });

    // Extintivo: calcula automaticamente estoque total se não existir
    estoque.forEach((item) => {
      if (!item['Estoque Total']) {
        const chavesEstoque = Object.keys(item).filter(key => key.toLowerCase().includes('estoque atual'));
        item['Estoque Total'] = chavesEstoque.reduce((soma, key) => soma + (parseFloat(item[key]) || 0), 0);
      }
    });

    // Organizar estoque por Cód Item
    const estoqueOrdenado = estoque.sort((a, b) => (a['Cód Item'] || '').localeCompare(b['Cód Item'] || ''));

    return res.status(200).json({ status: 'success', data: estoqueOrdenado });

  } catch (error) {
    console.error('Erro em getEstoque.js:', error.message);
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
