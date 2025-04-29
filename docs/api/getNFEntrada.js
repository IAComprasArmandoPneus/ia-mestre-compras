// /api/getNFEntrada.js

import { google } from 'googleapis';
import { auth } from '../../utils/googleAuth'; // Autenticação centralizada

export default async function handler(req, res) {
  try {
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.SHEET_ID;
    const range = 'NFEntrada_ProdutosIA!A1:Z'; // Mapeia apenas onde estão os dados

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const [header, ...rows] = response.data.values || [];

    if (!header || rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Sem dados de NF de entrada encontrados.' });
    }

    const entradas = rows.map((row) => {
      const obj = {};
      header.forEach((col, idx) => {
        let valor = row[idx] ?? '';

        // Conversões especiais
        if (col.toLowerCase().includes('data') || col.toLowerCase().includes('dtalancto')) {
          valor = valor ? tratarData(valor) : '';
        }
        if (col.toLowerCase().includes('custo') || col.toLowerCase().includes('preço')) {
          valor = parseFloat(valor.replace(',', '.')) || 0;
        }
        if (col.toLowerCase().includes('quantidade') || col.toLowerCase().includes('qtd')) {
          valor = parseFloat(valor.replace(',', '.')) || 0;
        }

        obj[col] = valor;
      });

      return obj;
    });

    const entradasOrdenadas = entradas.sort((a, b) => {
      const dataA = a['Date'] ? new Date(a['Date']) : new Date(0);
      const dataB = b['Date'] ? new Date(b['Date']) : new Date(0);
      return dataB - dataA; // Mais recentes primeiro
    });

    return res.status(200).json({ status: 'success', data: entradasOrdenadas });

  } catch (error) {
    console.error('Erro em getNFEntrada.js:', error.message);
    return res.status(500).json({ status: 'error', message: error.message });
  }
}

// Função para tratar datas que possam vir como "dd/mm/yyyy"
function tratarData(dataBr) {
  try {
    const partes = dataBr.split('/');
    if (partes.length === 3) {
      return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
    }
    return dataBr; // Se não der para tratar, devolve original
  } catch (e) {
    return dataBr;
  }
}
