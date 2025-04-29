// /api/getRecomendacoes.js
import { google } from 'googleapis';
import { auth } from '../googleAuth'; // Ajustado caminho

const CACHE_TTL_MS = 5 * 60 * 1000; // Cache de 5 minutos
let cache = { timestamp: 0, data: [] };

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  const spreadsheetId = process.env.SHEET_ID;
  if (!spreadsheetId) {
    return res.status(500).json({ status: 'error', message: 'SHEET_ID não configurado no ambiente.' });
  }

  // Parâmetros de paginação e filtro opcional
  const { limit = 1000, offset = 0, status: statusFiltro } = req.query;

  // Se cache válido, responde mais rápido
  if (Date.now() - cache.timestamp < CACHE_TTL_MS && cache.data.length > 0) {
    const filtrado = aplicarFiltroStatus(cache.data, statusFiltro);
    return res.status(200).json({ status: 'success', data: paginar(filtrado, offset, limit) });
  }

  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const range = 'Sugestao_IA!A1:Z';

    const resposta = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const [cabecalho, ...linhas] = resposta.data.values || [];

    if (!cabecalho || linhas.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Nenhuma sugestão encontrada.' });
    }

    // Índices úteis
    const indices = construirIndices(cabecalho);

    // Conversão extintiva: linhas => objetos tratados
    const sugestoes = linhas.map(linha => transformarLinhaEmObjeto(linha, cabecalho, indices));

    // Ordenação Extintiva: prioridade alta primeiro
    sugestoes.sort((a, b) => (prioridades[a.status] || 999) - (prioridades[b.status] || 999));

    // Atualiza cache
    cache = { timestamp: Date.now(), data: sugestoes };

    const filtrado = aplicarFiltroStatus(sugestoes, statusFiltro);
    return res.status(200).json({ status: 'success', data: paginar(filtrado, offset, limit) });

  } catch (error) {
    console.error('Erro no getRecomendacoes.js:', error.message);
    return res.status(500).json({ status: 'error', message: error.message });
  }
}

// 🛠️ Helpers inteligentes
const prioridades = { 'Crítico': 1, 'Urgente': 2, 'Atenção': 3 };

function construirIndices(header) {
  const idx = {};
  header.forEach((col, i) => {
    const nome = col.trim().toLowerCase();
    if (nome.includes('qtd sugerida')) idx.qtdSugerida = i;
    if (nome.includes('status')) idx.status = i;
  });
  return idx;
}

function transformarLinhaEmObjeto(row, header, idx) {
  const obj = {};
  header.forEach((col, i) => {
    let valor = row[i] ?? '';
    const nomeCampo = camelCase(col);

    if (i === idx.qtdSugerida) {
      valor = parseFloat(valor.replace(',', '.')) || 0;
    } else if (col.toLowerCase().includes('preço') || col.toLowerCase().includes('custo')) {
      valor = parseFloat(valor.replace(',', '.')) || 0;
    } else if (col.toLowerCase().includes('data')) {
      valor = tratarData(valor);
    }

    obj[nomeCampo] = valor;
  });
  return obj;
}

function aplicarFiltroStatus(arr, filtro) {
  if (!filtro) return arr;
  const filtros = filtro.split(',').map(s => s.trim());
  return arr.filter(item => filtros.includes(item.status));
}

function paginar(arr, offset, limit) {
  const start = Number(offset) || 0;
  const end = start + (Number(limit) || 1000);
  return arr.slice(start, end);
}

function camelCase(texto) {
  return texto.toLowerCase().replace(/[^a-z0-9]+(.)/g, (_, c) => c.toUpperCase());
}

function tratarData(dataBr) {
  try {
    const partes = dataBr.split('/');
    if (partes.length === 3) {
      return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
    }
    return dataBr;
  } catch {
    return dataBr;
  }
}
