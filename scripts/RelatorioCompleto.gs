/**
 * Gera um relatório completo de recomendações de compra
 * @param {Array} vendasData - Dados históricos de vendas
 * @param {Array} estoqueData - Dados de estoque atual
 * @param {Array} nfEntradaData - Dados de compras (NF entrada)
 * @return {Object} Relatório completo com recomendações
 */
function gerarRelatorioCompleto(vendasData, estoqueData, nfEntradaData) {
  var dataAtual = new Date();
  
  // 1. Recomendações regulares de compra
  var recomendacoesRegulares = [];
  
  // Processar cada item de estoque
  for (var i = 0; i < estoqueData.length; i++) {
    var produto = estoqueData[i];
    var codItem = produto['Cód Item'];
    var codFabricacao = produto['Cód Fabricação'];
    var descricaoItem = produto.Item;
    
    // Classificar produto por categoria
    var categoria = classificarProduto(produto);
    
    // Para cada estabelecimento, calcular necessidade de compra
    var estabelecimentos = [
      'AFPNEUS', 'BNH', 'FILIAL 06', 'FL03 CORON', 
      'FL04 GUAR.', 'FL05 ITAP', 'FL07', 'MATRIZ'
    ];
    
    for (var j = 0; j < estabelecimentos.length; j++) {
      var estabelecimento = estabelecimentos[j];
      
      // Verificar estoque atual
      var estoqueAtual = produto[estabelecimento] || 0;
      
      // Filtrar histórico de vendas deste produto neste estabelecimento
      var historicoVendas = [];
      for (var k = 0; k < vendasData.length; k++) {
        var venda = vendasData[k];
        if ((venda['Cód Item'] === codItem || venda['Cód Fabricação'] === codFabricacao) && 
            venda.Estabelecimento === estabelecimento) {
          historicoVendas.push(venda);
        }
      }
      
      // Filtrar histórico de compras deste produto
      var historicoCompras = [];
      for (var m = 0; m < nfEntradaData.length; m++) {
        var compra = nfEntradaData[m];
        if (compra['Cód Item'] === codItem || compra['Cód Fabricação'] === codFabricacao) {
          historicoCompras.push(compra);
        }
      }
      
      // Calcular média de vendas (últimos 30 dias)
      var mediaVendas30d = calcularMediaMovelPonderada(historicoVendas, dataAtual);
      
      // Previsão de vendas para próximos 30 dias
      var previsaoDemanda = preverDemanda(historicoVendas, dataAtual, categoria);
      
      // Calcular estoque mínimo
      var estoqueMinimo = calcularEstoqueMinimo(mediaVendas30d, categoria);
      
      // Verificar se precisa comprar
      var necessidadeCompra = previsaoDemanda + estoqueMinimo - estoqueAtual;
      
      // Se precisar comprar, calcular quantidade e recomendar compra
      if (necessidadeCompra > 0) {
        var qtdSugerida = calcularQuantidadeCompra(
          estoqueAtual, estoqueMinimo, previsaoDemanda, categoria
        );
        
        // Avaliar fornecedores
        var fornecedoresAvaliados = avaliarFornecedores(
          historicoCompras, codItem, codFabricacao
        );
        
        var melhorFornecedor = fornecedoresAvaliados.length > 0 
          ? fornecedoresAvaliados[0].nome 
          : 'N/A';
          
        // Determinar status da recomendação
        var status = 'Normal';
        if (estoqueAtual === 0) {
          status = 'Crítico';
        } else if (estoqueAtual < estoqueMinimo * 0.5) {
          status = 'Urgente';
        } else if (estoqueAtual < estoqueMinimo) {
          status = 'Atenção';
        }
        
        // Calcular dias em estoque
        var diasEstoque = mediaVendas30d > 0 
          ? Math.round((estoqueAtual / (mediaVendas30d / 30)) * 10) / 10 
          : 999;
          
        recomendacoesRegulares.push({
          'Cód Item': codItem,
          'Cód Fabricação': codFabricacao,
          'Item': descricaoItem,
          'Categoria': categoria,
          'Estabelecimento': estabelecimento,
          'Estoque Atual': estoqueAtual,
          'Estoque Mínimo': Math.round(estoqueMinimo),
          'Média Vendas (30d)': Math.round(mediaVendas30d * 100) / 100,
          'Previsão Vendas (30d)': previsaoDemanda,
          'Dias em Estoque': diasEstoque,
          'Qtd Sugerida': Math.max(1, Math.round(qtdSugerida)),
          'Melhor Fornecedor': melhorFornecedor,
          'Status': status,
          'Data Análise': dataAtual.getFullYear() + '-' + 
                          padZero(dataAtual.getMonth() + 1) + '-' + 
                          padZero(dataAtual.getDate())
        });
      }
    }
  }
  
  // 2. Calcular transferências recomendadas
  var transferencias = calcularTransferencias(estoqueData, vendasData);
  
  // 3. Analisar oportunidades de compra
  var oportunidades = analisarOportunidadesCompra(nfEntradaData, estoqueData);
  
  // 4. Gerar métricas gerais
  var metricas = {
    totalItensCriticos: 0,
    totalItensUrgentes: 0,
    totalItensAtencao: 0,
    totalTransferencias: transferencias.length,
    totalOportunidades: oportunidades.length,
    dataAnalise: dataAtual.getFullYear() + '-' + 
                padZero(dataAtual.getMonth() + 1) + '-' + 
                padZero(dataAtual.getDate()),
    resumoCategoria: {
      'PNEUS': 0,
      'LUBRIFICANTES/ADITIVOS': 0,
      'PEÇAS': 0
    }
  };
  
  // Contar itens por status e categoria
  for (var n = 0; n < recomendacoesRegulares.length; n++) {
    var rec = recomendacoesRegulares[n];
    if (rec.Status === 'Crítico') {
      metricas.totalItensCriticos++;
    } else if (rec.Status === 'Urgente') {
      metricas.totalItensUrgentes++;
    } else if (rec.Status === 'Atenção') {
      metricas.totalItensAtencao++;
    }
    
    if (rec.Categoria === 'PNEUS') {
      metricas.resumoCategoria['PNEUS']++;
    } else if (rec.Categoria === 'LUBRIFICANTES/ADITIVOS') {
      metricas.resumoCategoria['LUBRIFICANTES/ADITIVOS']++;
    } else if (rec.Categoria === 'PEÇAS') {
      metricas.resumoCategoria['PEÇAS']++;
    }
  }
  
  // 5. Montar relatório completo
  return {
    metricas: metricas,
    recomendacoesCompra: recomendacoesRegulares.sort(function(a, b) {
      var prioridadeStatus = { 'Crítico': 0, 'Urgente': 1, 'Atenção': 2, 'Normal': 3 };
      return prioridadeStatus[a.Status] - prioridadeStatus[b.Status];
    }),
    transferencias: transferencias,
    oportunidades: oportunidades
  };
}
