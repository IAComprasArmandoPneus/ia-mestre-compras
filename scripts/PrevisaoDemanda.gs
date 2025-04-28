/**
 * Analisa padrões sazonais nas vendas
 * @param {Array} historicoVendas - Array de objetos com histórico de vendas
 * @return {Object} Fatores sazonais por mês
 */
function analisarSazonalidade(historicoVendas) {
  if (!historicoVendas || historicoVendas.length < 12) {
    var arrayVazio = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    return { fatores: arrayVazio, confiabilidade: 0 };
  }
  
  // Agrupar vendas por mês
  var vendasPorMes = [];
  var contadorMeses = [];
  
  for (var i = 0; i < 12; i++) {
    vendasPorMes[i] = 0;
    contadorMeses[i] = 0;
  }
  
  for (var i = 0; i < historicoVendas.length; i++) {
    var venda = historicoVendas[i];
    var data = new Date(venda['Date Venda']);
    var mes = data.getMonth();
    vendasPorMes[mes] += venda['Quantidade Total'];
    contadorMeses[mes]++;
  }
  
  // Calcular média mensal
  var mediasPorMes = [];
  for (var j = 0; j < vendasPorMes.length; j++) {
    mediasPorMes[j] = contadorMeses[j] > 0 ? vendasPorMes[j] / contadorMeses[j] : 0;
  }
  
  // Calcular média global
  var mediasValidas = [];
  for (var k = 0; k < mediasPorMes.length; k++) {
    if (mediasPorMes[k] > 0) {
      mediasValidas.push(mediasPorMes[k]);
    }
  }
  
  var somaMedias = 0;
  for (var m = 0; m < mediasValidas.length; m++) {
    somaMedias += mediasValidas[m];
  }
  
  var mediaGlobal = mediasValidas.length > 0 ? somaMedias / mediasValidas.length : 1;
  
  // Calcular fatores sazonais
  var fatoresSazonais = [];
  for (var n = 0; n < mediasPorMes.length; n++) {
    fatoresSazonais[n] = mediasPorMes[n] > 0 ? mediasPorMes[n] / mediaGlobal : 1;
  }
  
  // Calcular confiabilidade baseada na quantidade de dados
  var mesesComDados = 0;
  for (var p = 0; p < contadorMeses.length; p++) {
    if (contadorMeses[p] > 0) {
      mesesComDados++;
    }
  }
  
  var confiabilidade = Math.min(mesesComDados / 12, 1);
  
  return {
    fatores: fatoresSazonais,
    confiabilidade: confiabilidade
  };
}

/**
 * Calcula média móvel ponderada para previsão
 * @param {Array} historicoVendas - Array de objetos com histórico de vendas
 * @param {Date} dataAtual - Data atual
 * @return {Number} Média ponderada de vendas
 */
function calcularMediaMovelPonderada(historicoVendas, dataAtual) {
  // Pesos decrescentes: mais recentes têm mais peso
  var peso30d = 0.5;  // Últimos 30 dias: 50% do peso
  var peso60d = 0.3;  // 30-60 dias: 30% do peso
  var peso90d = 0.2;  // 60-90 dias: 20% do peso
  
  // Agrupar vendas por períodos
  var vendas30d = { total: 0, dias: 0 };
  var vendas60d = { total: 0, dias: 0 };
  var vendas90d = { total: 0, dias: 0 };
  
  for (var i = 0; i < historicoVendas.length; i++) {
    var venda = historicoVendas[i];
    var dataVenda = new Date(venda['Date Venda']);
    var diasDiferenca = Math.floor((dataAtual - dataVenda) / (1000 * 60 * 60 * 24));
    
    if (diasDiferenca <= 30) {
      vendas30d.total += venda['Quantidade Total'];
      vendas30d.dias = Math.max(vendas30d.dias, diasDiferenca);
    } else if (diasDiferenca <= 60) {
      vendas60d.total += venda['Quantidade Total'];
      vendas60d.dias = Math.max(vendas60d.dias, diasDiferenca - 30);
    } else if (diasDiferenca <= 90) {
      vendas90d.total += venda['Quantidade Total'];
      vendas90d.dias = Math.max(vendas90d.dias, diasDiferenca - 60);
    }
  }
  
  // Calcular média diária e projetar para 30 dias
  var mediaFinal = 0;
  var somaPesos = 0;
  
  if (vendas30d.dias > 0) {
    var mediaDiaria30d = vendas30d.total / vendas30d.dias;
    mediaFinal += mediaDiaria30d * 30 * peso30d;
    somaPesos += peso30d;
  }
  
  if (vendas60d.dias > 0) {
    var mediaDiaria60d = vendas60d.total / vendas60d.dias;
    mediaFinal += mediaDiaria60d * 30 * peso60d;
    somaPesos += peso60d;
  }
  
  if (vendas90d.dias > 0) {
    var mediaDiaria90d = vendas90d.total / vendas90d.dias;
    mediaFinal += mediaDiaria90d * 30 * peso90d;
    somaPesos += peso90d;
  }
  
  // Normalizar se não tivermos todos os períodos
  return somaPesos > 0 ? mediaFinal / somaPesos : 0;
}

/**
 * Calcula a tendência de crescimento/decréscimo nas vendas
 * @param {Array} historicoVendas - Array de objetos com histórico de vendas
 * @param {Date} dataAtual - Data atual
 * @return {Number} Percentual de tendência (-100 a +100)
 */
function calcularTendencia(historicoVendas, dataAtual) {
  if (historicoVendas.length < 60) {
    return 0; // Dados insuficientes
  }
  
  // Agrupar por meses recentes
  var ultimoMes = {
    vendas: 0,
    qtd: 0
  };
  
  var mesesAnteriores = {
    vendas: 0,
    qtd: 0
  };
  
  for (var i = 0; i < historicoVendas.length; i++) {
    var venda = historicoVendas[i];
    var dataVenda = new Date(venda['Date Venda']);
    var diasDiferenca = Math.floor((dataAtual - dataVenda) / (1000 * 60 * 60 * 24));
    
    if (diasDiferenca <= 30) {
      ultimoMes.vendas += venda['Quantidade Total'];
      ultimoMes.qtd++;
    } else if (diasDiferenca <= 90) {
      mesesAnteriores.vendas += venda['Quantidade Total'];
      mesesAnteriores.qtd++;
    }
  }
  
  // Calcular médias mensais
  var mediaUltimoMes = ultimoMes.qtd > 0 ? ultimoMes.vendas / ultimoMes.qtd : 0;
  var mediaMesesAnteriores = mesesAnteriores.qtd > 0 ? mesesAnteriores.vendas / mesesAnteriores.qtd : 0;
  
  // Calcular percentual de variação
  if (mediaMesesAnteriores > 0 && mediaUltimoMes > 0) {
    var variacao = ((mediaUltimoMes / mediaMesesAnteriores) - 1) * 100;
    // Limitar a tendência a valores razoáveis (-50% a +50%)
    return Math.max(-50, Math.min(50, variacao));
  }
  
  return 0;
}

/**
 * Calcula a previsão de demanda usando múltiplos métodos
 * @param {Array} historicoVendas - Array de objetos com histórico de vendas
 * @param {Date} dataAtual - Data atual
 * @param {String} categoria - Categoria do produto
 * @return {Number} Previsão de demanda para 30 dias
 */
function preverDemanda(historicoVendas, dataAtual, categoria) {
  if (!historicoVendas || historicoVendas.length === 0) {
    return 0;
  }
  
  // 1. Média Móvel Ponderada (últimos 90 dias)
  var previsaoMediaMovel = calcularMediaMovelPonderada(historicoVendas, dataAtual);
  
  // 2. Análise de Sazonalidade
  var sazonalidade = analisarSazonalidade(historicoVendas);
  var mesAtual = dataAtual.getMonth();
  var fatorSazonal = sazonalidade.fatores[mesAtual];
  
  // 3. Análise de Tendência
  var tendencia = calcularTendencia(historicoVendas, dataAtual);
  
  // 4. Combinar previsões com pesos diferentes por categoria
  var configCategoria = getConfigCategoria(categoria);
  var pesoSazonalidade = configCategoria.pesoSazonalidade * sazonalidade.confiabilidade;
  
  // Previsão final combinada
  var previsaoFinal = previsaoMediaMovel * (1 + (tendencia / 100));
  
  // Aplicar fator sazonal apenas se tivermos confiança na sazonalidade
  if (sazonalidade.confiabilidade > 0.5) {
    previsaoFinal = previsaoFinal * (1 - pesoSazonalidade + (pesoSazonalidade * fatorSazonal));
  }
  
  // Aplicar margem de segurança baseada na categoria
  previsaoFinal = previsaoFinal * (1 + configCategoria.margemSeguranca);
  
  return Math.ceil(previsaoFinal);
}
