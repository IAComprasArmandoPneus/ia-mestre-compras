/**
 * Calcula sugestões de transferência entre estabelecimentos
 * Respeita as regras: Matriz para todas, FILIAL 06 apenas pneus Michelin
 * @param {Array} dadosEstoque - Dados de estoque de todos estabelecimentos
 * @param {Array} vendasData - Dados históricos de vendas
 * @return {Array} Lista de transferências sugeridas
 */
function calcularTransferencias(dadosEstoque, vendasData) {
  var transferencias = [];
  var dataAtual = new Date();
  
  // Para cada produto no estoque
  for (var prodIndex = 0; prodIndex < dadosEstoque.length; prodIndex++) {
    var produto = dadosEstoque[prodIndex];
    var categoria = classificarProduto(produto);
    var estabelecimentos = [
      'AFPNEUS', 'BNH', 'FILIAL 06', 'FL03 CORON', 
      'FL04 GUAR.', 'FL05 ITAP', 'FL07', 'MATRIZ'
    ];
    
    // Calcular demanda por estabelecimento
    var demandaPorEstabelecimento = {};
    
    for (var estabIndex = 0; estabIndex < estabelecimentos.length; estabIndex++) {
      var estab = estabelecimentos[estabIndex];
      
      // Filtrar histórico de vendas do produto neste estabelecimento
      var historicoVendas = [];
      for (var vendaIndex = 0; vendaIndex < vendasData.length; vendaIndex++) {
        var venda = vendasData[vendaIndex];
        if ((venda['Cód Item'] === produto['Cód Item'] || 
            venda['Cód Fabricação'] === produto['Cód Fabricação']) && 
            venda.Estabelecimento === estab) {
          historicoVendas.push(venda);
        }
      }
      
      var previsaoDemanda = preverDemanda(historicoVendas, dataAtual, categoria);
      var mediaVendas = calcularMediaMovelPonderada(historicoVendas, dataAtual) / 30; // Média diária
      var estoqueAtual = produto[estab] || 0;
      var estoqueMinimo = calcularEstoqueMinimo(mediaVendas * 30, categoria);
      
      demandaPorEstabelecimento[estab] = {
        estabelecimento: estab,
        estoqueAtual: estoqueAtual,
        estoqueMinimo: estoqueMinimo,
        previsaoDemanda: previsaoDemanda,
        diasEstoque: estoqueAtual > 0 && mediaVendas > 0 ? estoqueAtual / mediaVendas : 999,
        necessidade: Math.max(0, previsaoDemanda + estoqueMinimo - estoqueAtual)
      };
    }
    
    // Verificar estabelecimentos com necessidade vs. excesso
    for (var destIndex = 0; destIndex < estabelecimentos.length; destIndex++) {
      var destino = estabelecimentos[destIndex];
      
      if (!demandaPorEstabelecimento[destino] || demandaPorEstabelecimento[destino].necessidade <= 0) {
        continue; // Este estabelecimento não precisa de transferência
      }
      
      // Verificar possíveis origens (Matriz ou Filial 06 para pneus Michelin)
      var origensPermitidas = ['MATRIZ'];
      var isPneuMichelin = produto.Item && 
                           produto.Item.toLowerCase().indexOf('pneu') !== -1 && 
                           produto.Item.toLowerCase().indexOf('michelin') !== -1;
      
      // Adicionar FILIAL 06 como origem apenas para pneus Michelin
      if (isPneuMichelin) {
        origensPermitidas.push('FILIAL 06');
      }
      
      // Avaliar cada origem possível
      for (var origIndex = 0; origIndex < origensPermitidas.length; origIndex++) {
        var origem = origensPermitidas[origIndex];
        
        if (origem === destino) continue; // Não transferir para o mesmo local
        
        var dadosOrigem = demandaPorEstabelecimento[origem];
        var dadosDestino = demandaPorEstabelecimento[destino];
        
        if (!dadosOrigem) continue; // Pular se não houver dados da origem
        
        // Verificar se origem tem estoque disponível para transferência
        var excessoOrigem = dadosOrigem.estoqueAtual - (dadosOrigem.previsaoDemanda + dadosOrigem.estoqueMinimo * 0.8);
        
        if (excessoOrigem > 0) {
          // Calcular quantidade a transferir
          var qtdSugerida = Math.min(excessoOrigem, dadosDestino.necessidade);
          
          if (qtdSugerida >= 1) {
            // Determinar criticalidade da transferência
            var status;
            if (dadosDestino.estoqueAtual === 0) {
              status = 'Crítico';
            } else if (dadosDestino.estoqueAtual < dadosDestino.estoqueMinimo * 0.5) {
              status = 'Urgente';
            } else if (dadosDestino.estoqueAtual < dadosDestino.estoqueMinimo) {
              status = 'Recomendado';
            } else {
              status = 'Opcional';
            }
            
            // Adicionar sugestão de transferência
            transferencias.push({
              'Cód Item': produto['Cód Item'],
              'Cód Fabricação': produto['Cód Fabricação'],
              'Item': produto.Item,
              'Categoria': categoria,
              'Origem': origem,
              'EstoqueOrigem': dadosOrigem.estoqueAtual,
              'Destino': destino,
              'EstoqueDestino': dadosDestino.estoqueAtual,
              'QtdSugerida': Math.ceil(qtdSugerida),
              'Dias Cobertura': Math.round(qtdSugerida / (dadosDestino.previsaoDemanda / 30)),
              'Status': status
            });
          }
        }
      }
    }
  }
  
  // Ordenar por criticalidade e depois por código do item
  transferencias.sort(function(a, b) {
    var prioridadeStatus = { 'Crítico': 0, 'Urgente': 1, 'Recomendado': 2, 'Opcional': 3 };
    var compStatus = prioridadeStatus[a.Status] - prioridadeStatus[b.Status];
    
    if (compStatus !== 0) return compStatus;
    return a['Cód Item'].toString().localeCompare(b['Cód Item'].toString());
  });
  
  return transferencias;
}

/**
 * Registra uma transferência entre estabelecimentos
 * @param {Object} dadosTransferencia - Dados da transferência
 */
function registrarTransferencia(dadosTransferencia) {
  // Validar dados necessários
  if (!dadosTransferencia.codItem || 
      !dadosTransferencia.origem || 
      !dadosTransferencia.destino || 
      !dadosTransferencia.quantidade) {
    throw new Error('Dados incompletos para registro de transferência');
  }
  
  // Atualizar estoque de acordo com a transferência
  atualizarEstoqueTransferencia(dadosTransferencia);
  
  // Registrar a transferência em um log
  registrarLogTransferencia(dadosTransferencia);
}

/**
 * Atualiza o estoque após uma transferência
 * @param {Object} dadosTransferencia - Dados da transferência
 */
function atualizarEstoqueTransferencia(dadosTransferencia) {
  var sheet = SpreadsheetApp.openById(ESTOQUE_SHEET_ID).getSheetByName('Estoque por Estabelecimento');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  // Encontrar o item no estoque
  for (var i = 1; i < data.length; i++) {
    var codItem = data[i][headers.indexOf('Cód Item')];
    var codFabricacao = data[i][headers.indexOf('Cód Fabricação')];
    
    if (codItem == dadosTransferencia.codItem || 
        (dadosTransferencia.codFabricacao && codFabricacao == dadosTransferencia.codFabricacao)) {
      
      // Encontrou o item, atualizar o estoque de origem e destino
      var colOrigem = headers.indexOf(dadosTransferencia.origem);
      var colDestino = headers.indexOf(dadosTransferencia.destino);
      
      if (colOrigem > -1 && colDestino > -1) {
        var estoqueOrigem = data[i][colOrigem] || 0;
        var estoqueDestino = data[i][colDestino] || 0;
        
        // Verificar se há estoque suficiente
        if (estoqueOrigem < parseInt(dadosTransferencia.quantidade)) {
          throw new Error('Estoque insuficiente para transferência');
        }
        
        // Atualizar valores
        var novoEstoqueOrigem = estoqueOrigem - parseInt(dadosTransferencia.quantidade);
        var novoEstoqueDestino = estoqueDestino + parseInt(dadosTransferencia.quantidade);
        
        // Atualizar a planilha
        sheet.getRange(i + 1, colOrigem + 1).setValue(novoEstoqueOrigem);
        sheet.getRange(i + 1, colDestino + 1).setValue(novoEstoqueDestino);
        
        break;
      }
    }
  }
}

/**
 * Registra um log de transferência
 * @param {Object} dadosTransferencia - Dados da transferência
 */
function registrarLogTransferencia(dadosTransferencia) {
  var ss = SpreadsheetApp.openById(VENDAS_SHEET_ID);
  var sheet = ss.getSheetByName('Log Transferências');
  
  // Criar planilha de log se não existir
  if (!sheet) {
    sheet = ss.insertSheet('Log Transferências');
    sheet.appendRow([
      'Data', 'Cód Item', 'Cód Fabricação', 'Item', 'Origem', 
      'Destino', 'Quantidade', 'Usuário'
    ]);
  }
  
  // Adicionar registro
  sheet.appendRow([
    new Date(),
    dadosTransferencia.codItem,
    dadosTransferencia.codFabricacao || '',
    dadosTransferencia.descricaoItem || '',
    dadosTransferencia.origem,
    dadosTransferencia.destino,
    parseInt(dadosTransferencia.quantidade),
    dadosTransferencia.usuario || 'Sistema'
  ]);
}
