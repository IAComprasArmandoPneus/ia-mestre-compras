/**
 * Avalia e pontua fornecedores com base no histórico
 * @param {Array} historicoCompras - Histórico de compras (NF entrada)
 * @param {String} codItem - Código do item
 * @param {String} codFabricacao - Código de fabricação
 * @return {Array} Lista de fornecedores pontuados
 */
function avaliarFornecedores(historicoCompras, codItem, codFabricacao) {
  if (!historicoCompras || historicoCompras.length === 0) {
    return [];
  }
  
  // Filtrar compras do mesmo produto
  var comprasProduto = [];
  for (var h = 0; h < historicoCompras.length; h++) {
    var compra = historicoCompras[h];
    if (compra['Cód Item'] === codItem || compra['Cód Fabricação'] === codFabricacao) {
      comprasProduto.push(compra);
    }
  }
  
  if (comprasProduto.length === 0) {
    return [];
  }
  
  // Agrupar análise por fornecedor
  var fornecedores = {};
  var dataAtual = new Date();
  
  for (var i = 0; i < comprasProduto.length; i++) {
    var compra = comprasProduto[i];
    var fornecedor = compra.Forncedor;
    var dataCompra = new Date(compra.dtalancto);
    var diasAtraso = 0; // Idealmente, seria calculado com base em algum campo de prazo previsto
    
    if (!fornecedores[fornecedor]) {
      fornecedores[fornecedor] = {
        nome: fornecedor,
        compras: 0,
        valorTotal: 0,
        qtdTotal: 0,
        ultimaCompra: new Date(0),
        precoMedio: 0,
        variacaoPreco: 0,
        pontualidade: 100, // Percentual de pontualidade
        leadTime: 0,       // Dias médios para entrega
        precosPorData: []  // Lista para análise de variação
      };
    }
    
    var dadosFornecedor = fornecedores[fornecedor];
    
    // Atualizar estatísticas
    dadosFornecedor.compras++;
    dadosFornecedor.valorTotal += compra['Custo de compra'] * compra['Qtd Compra'];
    dadosFornecedor.qtdTotal += compra['Qtd Compra'];
    
    // Registrar preço para análise de variação
    dadosFornecedor.precosPorData.push({
      data: dataCompra,
      preco: compra['Custo de compra']
    });
    
    // Atualizar última compra
    if (dataCompra > dadosFornecedor.ultimaCompra) {
      dadosFornecedor.ultimaCompra = dataCompra;
    }
    
    // Atualizar pontualidade se tivéssemos dados de atraso
    if (diasAtraso > 0) {
      dadosFornecedor.pontualidade = ((dadosFornecedor.pontualidade * (dadosFornecedor.compras - 1)) + 
        (diasAtraso === 0 ? 100 : Math.max(0, 100 - diasAtraso * 5))) / dadosFornecedor.compras;
    }
  }
  
  // Calcular métricas adicionais para cada fornecedor
  var fornecedoresArray = [];
  
  for (var fornecedorKey in fornecedores) {
    var fornecedor = fornecedores[fornecedorKey];
    
    // Preço médio
    fornecedor.precoMedio = fornecedor.valorTotal / fornecedor.qtdTotal;
    
    // Calcular variação de preço (últimos 3 meses vs anteriores)
    if (fornecedor.precosPorData.length > 1) {
      fornecedor.precosPorData.sort(function(a, b) {
        return b.data - a.data; // Mais recente primeiro
      });
      
      var precosRecentes = [];
      var precosAnteriores = [];
      
      for (var j = 0; j < fornecedor.precosPorData.length; j++) {
        var precoDado = fornecedor.precosPorData[j];
        var diasDesdeCompra = (dataAtual - precoDado.data) / (1000 * 60 * 60 * 24);
        
        if (diasDesdeCompra <= 90) {
          precosRecentes.push(precoDado.preco);
        } else {
          precosAnteriores.push(precoDado.preco);
        }
      }
      
      if (precosRecentes.length > 0 && precosAnteriores.length > 0) {
        var somaRecente = 0;
        for (var k = 0; k < precosRecentes.length; k++) {
          somaRecente += precosRecentes[k];
        }
        var mediaRecente = somaRecente / precosRecentes.length;
        
        var somaAnterior = 0;
        for (var m = 0; m < precosAnteriores.length; m++) {
          somaAnterior += precosAnteriores[m];
        }
        var mediaAnterior = somaAnterior / precosAnteriores.length;
        
        fornecedor.variacaoPreco = ((mediaRecente / mediaAnterior) - 1) * 100;
      }
    }
    
    // Calcular recência (dias desde última compra)
    fornecedor.recencia = Math.floor((dataAtual - fornecedor.ultimaCompra) / (1000 * 60 * 60 * 24));
    
    // Calcular pontuação global
    var pontuacaoPreco = 100 - Math.min(100, Math.abs(fornecedor.variacaoPreco) * 2);
    var pontuacaoRecencia = Math.max(0, 100 - (fornecedor.recencia / 3.65)); // 0 pontos após 1 ano
    var pontuacaoFrequencia = Math.min(100, fornecedor.compras * 10); // Máximo com 10 compras
    
    // Pesos para cada fator
    fornecedor.pontuacao = (pontuacaoPreco * 0.4) + 
                          (fornecedor.pontualidade * 0.3) + 
                          (pontuacaoRecencia * 0.2) + 
                          (pontuacaoFrequencia * 0.1);
                          
    // Classificação do fornecedor                      
    if (fornecedor.pontuacao >= 85) {
      fornecedor.classificacao = 'Preferencial';
    } else if (fornecedor.pontuacao >= 70) {
      fornecedor.classificacao = 'Recomendado';
    } else if (fornecedor.pontuacao >= 50) {
      fornecedor.classificacao = 'Alternativo';
    } else {
      fornecedor.classificacao = 'Não Recomendado';
    }
    
    fornecedoresArray.push(fornecedor);
  }
  
  // Ordenar por pontuação (do maior para o menor)
  fornecedoresArray.sort(function(a, b) {
    return b.pontuacao - a.pontuacao;
  });
  
  return fornecedoresArray;
}
