/**
 * Configurações para categorias de produtos e algoritmos IA
 */

// Configuração para PNEUS
var CONFIG_PNEUS = {
  prazoRessuprimento: 45,         // Dias para planejamento
  coeficienteEstoqueMin: 1.5,     // Multiplica média mensal
  loteMinimo: 4,                  // Mínimo de itens por compra
  margemSeguranca: 0.2,           // 20% adicional
  cicloRevisao: 15,               // Dias para revisar
  pesoSazonalidade: 0.25,         // Impacto da sazonalidade
  vidaUtilEstoque: 1095           // 3 anos
};

// Configuração para LUBRIFICANTES/ADITIVOS
var CONFIG_LUBRIFICANTES = {
  prazoRessuprimento: 30,         // Dias para planejamento
  coeficienteEstoqueMin: 1.2,     // Multiplica média mensal
  loteMinimo: 6,                  // Mínimo de itens por compra
  margemSeguranca: 0.15,          // 15% adicional
  cicloRevisao: 10,               // Dias para revisar
  pesoSazonalidade: 0.1,          // Impacto da sazonalidade
  vidaUtilEstoque: 730            // 2 anos
};

// Configuração para PEÇAS
var CONFIG_PECAS = {
  prazoRessuprimento: 20,         // Dias para planejamento
  coeficienteEstoqueMin: 1.0,     // Multiplica média mensal 
  loteMinimo: 1,                  // Mínimo de itens por compra
  margemSeguranca: 0.1,           // 10% adicional
  cicloRevisao: 7,                // Dias para revisar 
  pesoSazonalidade: 0.05,         // Impacto da sazonalidade
  vidaUtilEstoque: 1825           // 5 anos
};

/**
 * Obtém a configuração apropriada para uma categoria
 * @param {String} categoria - Nome da categoria
 * @return {Object} Configuração da categoria
 */
function getConfigCategoria(categoria) {
  if (categoria === 'PNEUS') {
    return CONFIG_PNEUS;
  } else if (categoria === 'LUBRIFICANTES/ADITIVOS') {
    return CONFIG_LUBRIFICANTES;
  } else {
    return CONFIG_PECAS;
  }
}

/**
 * IDs das planilhas
 */
var VENDAS_SHEET_ID = '1Wm9TdTPAMY89SgFz98kFlywkqJ41pWI_';
var ESTOQUE_SHEET_ID = '1HSsZtCU4S32X274CuFusOI-jTC1fKbl7';
var NF_ENTRADA_SHEET_ID = '115p0LOJLX7un46GMM1Ak6T7IGp7Fi3bo';

/**
 * Função de utilidade para adicionar zero à esquerda em números menores que 10
 * @param {Number} num - Número para formatar
 * @return {String} Número formatado com zero à esquerda se necessário
 */
function padZero(num) {
  return num < 10 ? '0' + num : num.toString();
}
