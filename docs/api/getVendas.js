// /api/getVendas.js

import { google } from 'googleapis';
import { auth } from '../../utils/googleAuth'; // Reutilizamos a autenticação centralizada!

export default async function handler(req, res) {
  try {
    const sheets = google.sheets({ version: 'v4', auth });

    // Nome da planilha e da aba
    const spreadsheetId = process.env.SHEET_ID;
    const range = 'RelatorioVendasIA!A1:Z'; // Otimizado: só puxa A-Z (não carrega lixo além disso)

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const [header, ...rows] = response.data.values || [];

    if (!header || rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Sem dados de vendas encontrados.' });
    }

    // Extintivo: Transformar linhas em objetos + normalizar datas e campos numéricos
    const vendas = rows.map((row) => {
      const obj = {};
      header.forEach((col, idx) => {
        obj[col] = row[idx] ?? '';

        // Inteligência Extintiva: se for campo de data, normaliza
        if (col.toLowerCase().includes('date') || col.toLowerCase().includes('data')) {
          obj[col] = formatarDataGoogle(obj[col]);
        }

        // Se campo de número, tenta converter
        if (col.toLowerCase().includes('quantidade') || col.toLowerCase().includes('faturamento') || col.toLowerCase().includes('valor')) {
          obj[col] = parseFloat(obj[col]?.replace(',', '.')) || 0;
        }
      });
      return obj;
    });

    // Extintivo: resposta ordenada por Data Venda decrescente, se existir
    const vendasOrdenadas = vendas.sort((a, b) => {
      const dataA = new Date(a['Date Venda'] || a['Data Venda'] || '2000-01-01');
      const dataB = new Date(b['Date Venda'] || b['Data Venda'] || '2000-01-01');
      return dataB - dataA;
    });

    return res.status(200).json({ status: 'success', data: vendasOrdenadas });
  } catch (error) {
    console.error('Erro em getVendas.js:', error.message);
    return res.status(500).json({ status: 'error', message: error.message });
  }
}

// 🛠️ Função auxiliar para normalizar data
function formatarDataGoogle(dataString) {
  if (!dataString) return '';
  
  // Se vier em formato brasileiro já (dd/mm/yyyy), mantém
  if (dataString.includes('/')) return dataString;

  // Se vier em formato ISO (yyyy-mm-dd ou timestamp)
  try {
    const data = new Date(dataString);
    if (isNaN(data)) return dataString;
    return data.toLocaleDateString('pt-BR');
  } catch {
    return dataString;
  }
}
