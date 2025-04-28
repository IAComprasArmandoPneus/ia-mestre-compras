/**
 * Análise de oportunidades de compra com base em histórico de preços
 * @param {Array} historicoCompras - Histórico de compras (NF entrada)
 * @param {Array} estoqueData - Dados de estoque atual
 * @return {Array} Lista de oportunidades de compra
 */
function analisarOportunidadesCompra(historicoCompras, estoqueData) {
  if (!historicoCompras || historicoCompras.length === 0) {
    return [];
  }
  
  var oportunidades = [];
  var dataAtual = new Date();
  
  // Agrupar histórico de compras por produto
  var produtosAgrupados = {};
  
  for (var i = 0; i < historicoCompras.length; i++) {
    var compra = historicoCompras[i];
    var codItem = compra['Cód Item'];
    var codFabricacao = compra['Cód Fabricação'];
    var chave = codItem + '-' + codFabricacao;
    
    if (!produtosAgrupados[chave]) {
      produtosAgrupados[chave] = [];
    }
    
    produtosAgrupados[chave].push(compra);
  }
  
  // Analisar cada produto
  for (var chave in produtosAgrupados) {
    var comprasProduto = produtosAgrupados[chave];
    
    // Precisamos de pelo menos 3 compras para análise
    if (comprasProduto.length < 3) continue;
    
    // Extrair dados da primeira compra (para referência)
    var dadosProduto = {
      'Cód Item': comprasProduto[0]['Cód Item'],
      'Cód Fabricação': comprasProduto[0]['Cód Fabricação'],
      'Item': comprasProduto[0].Item,
    };
    
    // Encontrar dados de estoque atual
    var dadosEstoque = null;
    for (var j = 0; j < estoqueData.length; j++) {
      var item = estoqueData[j];
      if (item['Cód Item'] === dadosProduto['Cód Item'] || 
          item['Cód Fabricação'] === dadosProduto['Cód Fabricação']) {
        dadosEstoque = item;
        break;
      }
    }
    
    if (!dadosEstoque) continue;
    
    // Classificar produto
    var categoria = classificarProduto(dadosProduto);
    
    // Analisar preços históricos
    comprasProduto.sort(function(a, b) {
      return new Date(a.dtalancto) - new Date(b.dtalancto);
    });
    
    var precos = [];
    for (var k = 0; k < comprasProduto.length; k++) {
      var compraItem = comprasProduto[k];
      precos.push({
        data: new Date(compraItem.dtalancto),
        preco: compraItem['Custo de compra'],
        fornecedor: compraItem.Forncedor,
        quantidade: compraItem['Qtd Compra']
      });
    }
    
    // Calcular preço médio
    var somaPrecos = 0;
    for (var m = 0; m < precos.length; m++) {
      somaPrecos += precos[m].preco;
    }
    var precoMedio = somaPrecos / precos.length;
    
    // Analisar tendência de preços (últimos 6 meses vs anteriores)
    var seisAtras = new Date(dataAtual);
    seisAtras.setMonth(dataAtual.getMonth() - 6);
    
    var precosRecentes = [];
    var precosAnteriores = [];
    
    for (var p = 0; p < precos.length; p++) {
      var precoDado = precos[p];
      if (precoDado.data >= seisAtras) {
        precosRecentes.push(precoDado);
      } else {
        precosAnteriores.push(precoDado);
      }
    }
    
    var tendenciaPreco = 0;
    
    if (precosRecentes.length > 0 && precosAnteriores.length > 0) {
      var somaRecente = 0;
      for (var q = 0; q < precosRecentes.length; q++) {
        somaRecente += precosRecentes[q].preco;
      }
      var mediaRecente = somaRecente / precosRecentes.length;
      
      var somaAnterior = 0;
      for (var r = 0; r < precosAnteriores.length; r++) {
        somaAnterior += precosAnteriores[r].preco;
      }
      var mediaAnterior = somaAnterior / precosAnteriores.length;
      
      tendenciaPreco = ((mediaRecente / mediaAnterior) - 1) * 100;
    }
    
    // Verificar oportunidade de compra antecipada (tendência de alta de preços)
    if (tendenciaPreco > 5) {
      // Calcular estoque total atual
      var estoqueTotal = 0;
      var estabelecimentos = ['AFPNEUS', 'BNH', 'FILIAL 06', 'FL03 CORON', 
                             'FL04 GUAR.', 'FL05 ITAP', 'FL07', 'MATRIZ'];
      
      for (var s = 0; s < estabelecimentos.length; s++) {
        var estab = estabelecimentos[s];
        estoqueTotal += dadosEstoque[estab] || 0;
      }
      
      // Regras para oportunidade de compra
      var config = getConfigCategoria(categoria);
      
      // Calcular demanda mensal estimada com base nas últimas compras
      var qtdTotal = 0;
      var ultimasCompras = precos.slice(-6); // últimos 6 meses
      for (var t = 0; t < ultimasCompras.length; t++) {
        qtdTotal += ultimasCompras[t].quantidade;
      }
      var demandaMensalEstimada = qtdTotal / 6;
      
      // Verificar se vale a pena comprar antecipadamente
      if (estoqueTotal < demandaMensalEstimada * 3) { // Menos de 3 meses de estoque
        var percentualAumento = Math.round(tendenciaPreco * 10) / 10;
        
        oportunidades.push({
          'Cód Item': dadosProduto['Cód Item'],
          'Cód Fabricação': dadosProduto['Cód Fabricação'],
          'Item': dadosProduto.Item,
          'Categoria': categoria,
          'Estoque Total': estoqueTotal,
          'Consumo Mensal': Math.round(demandaMensalEstimada * 10) / 10,
          'Cobertura Atual': Math.round((estoqueTotal / demandaMensalEstimada) * 10) / 10,
          'Tendência Preço': '+' + percentualAumento + '%',
          'Preço Médio Atual': Math.round(precosRecentes[0].preco * 100) / 100,
          'Melhor Fornecedor': precosRecentes[0].fornecedor,
          'Qtd Sugerida': Math.ceil(demandaMensalEstimada * config.prazoRessuprimento / 30),
          'Economia Potencial': 'R$ ' + Math.round((precosRecentes[0].preco * (percentualAumento/100)) * demandaMensalEstimada * 3),
          'Tipo': 'Antecipação por tendência de alta'
        });
      }
    }
    
    // Verificar oportunidade por preço atual favorável (abaixo da média)
    if (precos.length > 0 && precos[precos.length - 1].preco < precoMedio * 0.9) {
      var precoAtual = precos[precos.length - 1].preco;
      var economia = Math.round((precoMedio - precoAtual) / precoMedio * 100);
      
      oportunidades.push({
        'Cód Item': dadosProduto['Cód Item'],
        'Cód Fabricação': dadosProduto['Cód Fabricação'],
        'Item': dadosProduto.Item,
        'Categoria': categoria,
        'Preço Médio Histórico': Math.round(precoMedio * 100) / 100,
        'Preço Atual': Math.round(precoAtual * 100) / 100,
        'Economia': economia + '%',
        'Melhor Fornecedor': precos[precos.length - 1].fornecedor,
        'Qtd Sugerida': Math.ceil(precos[precos.length - 1].quantidade * 1.5),
        'Economia Potencial': 'R$ ' + Math.round((precoMedio - precoAtual) * precos[precos.length - 1].quantidade * 1.5),
        'Tipo': 'Preço atual favorável'
      });
    }
  }
  
  return oportunidades;
}
