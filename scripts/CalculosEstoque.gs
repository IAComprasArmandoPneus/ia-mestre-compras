/**
 * Calcula o estoque mínimo ideal para um produto
 * @param {Number} mediaVendas - Média de vendas mensais
 * @param {String} categoria - Categoria do produto
 * @param {Number} leadTime - Tempo de entrega do fornecedor (dias)
 * @return {Number} Estoque mínimo recomendado
 */
function calcularEstoqueMinimo(mediaVendas, categoria, leadTime) {
  // Atribuir valor padrão para leadTime se não fornecido
  leadTime = leadTime || 0;
  
  // Obter configuração da categoria
  var config = getConfigCategoria(categoria);
  
  // Ajustar para o lead time do fornecedor
  var leadTimeFactor = leadTime > 0 ? (leadTime / 30) : (config.prazoRessuprimento / 30);
  
  // Calcular estoque mínimo: média diária × dias de cobertura × coeficiente segurança
  var mediaDiaria = mediaVendas / 30;
  var diasCobertura = leadTime > 0 ? leadTime : config.prazoRessuprimento;
  
  return Math.ceil(mediaDiaria * diasCobertura * config.coeficienteEstoqueMin);
}

/**
 * Calcula a quantidade ótima de compra (Lote Econômico)
 * @param {Number} demandaAnual - Demanda anual estimada
 * @param {Number} custoEmissao - Custo de emissão de pedido
 * @param {Number} custoArmazenagem - Custo de armazenagem por unidade
 * @param {String} categoria - Categoria do produto
 * @return {Number} Quantidade ótima de compra
 */
function calcularLoteEconomico(demandaAnual, custoEmissao, custoArmazenagem, categoria) {
  // Para simplicidade, usando valores padrão se não fornecidos
  custoEmissao = custoEmissao || 50; // R$ 50 por pedido
  custoArmazenagem = custoArmazenagem || 0.2; // 20% do valor ao ano
  
  // Fórmula do lote econômico (EOQ - Economic Order Quantity)
  var eoq = Math.sqrt((2 * demandaAnual * custoEmissao) / custoArmazenagem);
  
  // Ajustar pelo lote mínimo da categoria
  var config = getConfigCategoria(categoria);
  
  return Math.max(config.loteMinimo, Math.ceil(eoq));
}

/**
 * Calcula a quantidade sugerida para compra
 * @param {Number} estoqueAtual - Estoque atual
 * @param {Number} estoqueMinimo - Estoque mínimo calculado
 * @param {Number} previsaoDemanda - Previsão de demanda para próximo período
 * @param {String} categoria - Categoria do produto
 * @param {Number} leadTime - Tempo de entrega do fornecedor (dias)
 * @return {Number} Quantidade sugerida para compra
 */
function calcularQuantidadeCompra(estoqueAtual, estoqueMinimo, previsaoDemanda, categoria, leadTime) {
  // Atribuir valor padrão para leadTime se não fornecido
  leadTime = leadTime || 0;
  
  // Obter configuração da categoria
  var config = getConfigCategoria(categoria);
  
  // Calcular necessidade básica: cobertura para previsão + estoque mínimo - estoque atual
  var necessidade = previsaoDemanda + estoqueMinimo - estoqueAtual;
  
  // Ajustar para o lead time se fornecido
  if (leadTime > 0) {
    var fatorLeadTime = leadTime / 30; // Proporção do mês
    necessidade = necessidade * (1 + (fatorLeadTime - 1) * 0.5);
  }
  
  // Aplicar margem de segurança específica da categoria
  necessidade = necessidade * (1 + config.margemSeguranca);
  
  // Garantir lote mínimo
  return Math.max(config.loteMinimo, Math.ceil(necessidade));
}
