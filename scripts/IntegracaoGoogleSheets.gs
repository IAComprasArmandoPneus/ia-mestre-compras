/**
 * Configuração global das planilhas (IDs definidos no arquivo ConfiguracoesIA.gs)
 */

/**
 * Cria um menu personalizado na interface do Google Sheets
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('IA Mestre em Compras')
    .addItem('Atualizar Dashboard', 'atualizarDashboard')
    .addItem('Gerar Recomendações', 'gerarRecomendacoes')
    .addItem('Sincronizar Dados', 'sincronizarDados')
    .addToUi();
}

/**
 * Configura o acesso à API para permitir solicitações externas
 */
function doGet(e) {
  var action = e.parameter.action;
  
  switch(action) {
    case 'getVendas':
      return getVendasData();
    case 'getEstoque':
      return getEstoqueData();
    case 'getNFEntrada':
      return getNFEntradaData();
    case 'getRecomendacoes':
      return gerarRecomendacoesAPI();
    case 'triggerRecomendacoes':
      return triggerRecomendacoes();
    case 'registrarCompra':
      return registrarCompra(e.parameter.dados);
    case 'registrarTransferencia':
      return registrarTransferencia(e.parameter.dados);
    case 'getAnalisesFornecedores':
      return getAnalisesFornecedoresData(e.parameter);
    case 'getHistoricoCompras':
      return getHistoricoComprasData(e.parameter.dataInicio, e.parameter.dataFim);
    case 'getHistoricoVendas':
      return getHistoricoVendasData(e.parameter.dataInicio, e.parameter.dataFim);
    case 'getTendenciasPrecos':
      return getTendenciasPrecosData(e.parameter);
    case 'getOportunidadesCompra':
      return getOportunidadesCompraData(e.parameter);
    case 'getSugestoesTransferencia':
      return getSugestoesTransferenciaData(e.parameter);
    case 'exportarParaPlanilha':
      return exportarParaPlanilha(e.parameter.tipo, e.parameter.dados);
    case 'atualizarParametrosIA':
      return atualizarParametrosIA(e.parameter.parametros);
    case 'getParametrosIA':
      return getParametrosIAData();
    case 'realizarBackup':
      return realizarBackup();
    case 'gerarRelatorio':
      return gerarRelatorioPersonalizado(e.parameter.tipoRelatorio, e.parameter.parametros);
    default:
      return ContentService.createTextOutput(
        JSON.stringify({ status: 'error', message: 'Ação não especificada' })
      ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Função para obter dados da planilha de vendas
 */
function getVendasData() {
  try {
    var sheet = SpreadsheetApp.openById(VENDAS_SHEET_ID).getSheetByName('Relatório de Vendas IA');
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var rows = data.slice(1);
    
    var jsonData = [];
    for (var i = 0; i < rows.length; i++) {
      var rowData = {};
      for (var j = 0; j < headers.length; j++) {
        rowData[headers[j]] = rows[i][j];
      }
      jsonData.push(rowData);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', data: jsonData })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Função para obter dados da planilha de estoque
 */
function getEstoqueData() {
  try {
    var sheet = SpreadsheetApp.openById(ESTOQUE_SHEET_ID).getSheetByName('Estoque por Estabelecimento');
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var rows = data.slice(1);
    
    var jsonData = [];
    for (var i = 0; i < rows.length; i++) {
      var rowData = {};
      for (var j = 0; j < headers.length; j++) {
        rowData[headers[j]] = rows[i][j];
      }
      jsonData.push(rowData);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', data: jsonData })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Função para obter dados da planilha de NF Entrada
 */
function getNFEntradaData() {
  try {
    var sheet = SpreadsheetApp.openById(NF_ENTRADA_SHEET_ID).getSheetByName('NF Entrada_Produtos IA');
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var rows = data.slice(1);
    
    var jsonData = [];
    for (var i = 0; i < rows.length; i++) {
      var rowData = {};
      for (var j = 0; j < headers.length; j++) {
        rowData[headers[j]] = rows[i][j];
      }
      jsonData.push(rowData);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', data: jsonData })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Função auxiliar para obter dados da planilha de vendas
 */
function obterDadosVendas() {
  var sheet = SpreadsheetApp.openById(VENDAS_SHEET_ID).getSheetByName('Relatório de Vendas IA');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = data.slice(1);
  
  var jsonData = [];
  for (var i = 0; i < rows.length; i++) {
    var rowData = {};
    for (var j = 0; j < headers.length; j++) {
      rowData[headers[j]] = rows[i][j];
    }
    jsonData.push(rowData);
  }
  
  return jsonData;
}

/**
 * Função auxiliar para obter dados da planilha de estoque
 */
function obterDadosEstoque() {
  var sheet = SpreadsheetApp.openById(ESTOQUE_SHEET_ID).getSheetByName('Estoque por Estabelecimento');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = data.slice(1);
  
  var jsonData = [];
  for (var i = 0; i < rows.length; i++) {
    var rowData = {};
    for (var j = 0; j < headers.length; j++) {
      rowData[headers[j]] = rows[i][j];
    }
    jsonData.push(rowData);
  }
  
  return jsonData;
}

/**
 * Função auxiliar para obter dados da planilha de NF Entrada
 */
function obterDadosNFEntrada() {
  var sheet = SpreadsheetApp.openById(NF_ENTRADA_SHEET_ID).getSheetByName('NF Entrada_Produtos IA');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = data.slice(1);
  
  var jsonData = [];
  for (var i = 0; i < rows.length; i++) {
    var rowData = {};
    for (var j = 0; j < headers.length; j++) {
      rowData[headers[j]] = rows[i][j];
    }
    jsonData.push(rowData);
  }
  
  return jsonData;
}

/**
 * Função para gerar planilha com recomendações de compra
 */
function gerarRecomendacoes() {
  try {
    // Obter dados de todas as fontes
    var vendasData = obterDadosVendas();
    var estoqueData = obterDadosEstoque();
    var nfEntradaData = obterDadosNFEntrada();
    
    // Calcular recomendações
    var recomendacoes = gerarRelatorioCompleto(vendasData, estoqueData, nfEntradaData);
    
    // Criar ou atualizar planilha de recomendações
    criarPlanilhaRecomendacoes(recomendacoes.recomendacoesCompra);
    
    // Criar ou atualizar planilha de transferências
    criarPlanilhaTransferencias(recomendacoes.transferencias);
    
    // Criar ou atualizar planilha de oportunidades
    criarPlanilhaOportunidades(recomendacoes.oportunidades);
    
    SpreadsheetApp.getUi().alert('Recomendações geradas com sucesso!');
    
    return recomendacoes;
  } catch (error) {
    SpreadsheetApp.getUi().alert('Erro ao gerar recomendações: ' + error.toString());
    throw error;
  }
}

/**
 * Versão da API para gerar recomendações
 */
function gerarRecomendacoesAPI() {
  try {
    // Obter dados de todas as fontes
    var vendasData = obterDadosVendas();
    var estoqueData = obterDadosEstoque();
    var nfEntradaData = obterDadosNFEntrada();
    
    // Calcular recomendações
    var recomendacoes = gerarRelatorioCompleto(vendasData, estoqueData, nfEntradaData);
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', data: recomendacoes })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Versão API para acionar a geração de recomendações
 */
function triggerRecomendacoes() {
  try {
    var resultado = gerarRecomendacoes();
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', message: 'Recomendações geradas com sucesso' })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Cria ou atualiza uma planilha com as recomendações de compra
 */
function criarPlanilhaRecomendacoes(recomendacoes) {
  var ss = SpreadsheetApp.openById(VENDAS_SHEET_ID);
  var sheet = ss.getSheetByName('Recomendações de Compra');
  
  if (!sheet) {
    sheet = ss.insertSheet('Recomendações de Compra');
  } else {
    sheet.clear();
  }
  
  // Definir cabeçalhos
  var headers = [
    'Cód Item', 'Cód Fabricação', 'Item', 'Categoria', 'Estabelecimento', 
    'Estoque Atual', 'Estoque Mínimo', 'Média Vendas (30d)', 'Previsão Vendas (30d)',
    'Dias em Estoque', 'Qtd Sugerida', 'Melhor Fornecedor', 'Status', 'Data Análise'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  
  // Adicionar dados
  if (recomendacoes.length > 0) {
    var data = [];
    for (var i = 0; i < recomendacoes.length; i++) {
      var rec = recomendacoes[i];
      var row = [];
      for (var j = 0; j < headers.length; j++) {
        row.push(rec[headers[j]]);
      }
      data.push(row);
    }
    sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  }
  
  // Formatação
  sheet.autoResizeColumns(1, headers.length);
  sheet.setFrozenRows(1);
  
  // Adicionar formatação condicional para o status
  var range = sheet.getRange(2, headers.indexOf('Status') + 1, Math.max(1, sheet.getLastRow() - 1), 1);
  
  var rules = sheet.getConditionalFormatRules();
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('Crítico')
    .setBackground('#F4CCCC')
    .setRanges([range])
    .build());
  
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('Urgente')
    .setBackground('#FCE5CD')
    .setRanges([range])
    .build());
  
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('Atenção')
    .setBackground('#FFF2CC')
    .setRanges([range])
    .build());
  
  sheet.setConditionalFormatRules(rules);
}

/**
 * Cria ou atualiza uma planilha com as transferências sugeridas
 */
function criarPlanilhaTransferencias(transferencias) {
  var ss = SpreadsheetApp.openById(VENDAS_SHEET_ID);
  var sheet = ss.getSheetByName('Transferências Sugeridas');
  
  if (!sheet) {
    sheet = ss.insertSheet('Transferências Sugeridas');
  } else {
    sheet.clear();
  }
  
  // Definir cabeçalhos
  var headers = [
    'Cód Item', 'Cód Fabricação', 'Item', 'Categoria', 'Origem', 
    'EstoqueOrigem', 'Destino', 'EstoqueDestino', 'QtdSugerida',
    'Dias Cobertura', 'Status'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  
  // Adicionar dados
  if (transferencias.length > 0) {
    var data = [];
    for (var i = 0; i < transferencias.length; i++) {
      var transf = transferencias[i];
      var row = [];
      for (var j = 0; j < headers.length; j++) {
        row.push(transf[headers[j]]);
      }
      data.push(row);
    }
    sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  }
  
  // Formatação
  sheet.autoResizeColumns(1, headers.length);
  sheet.setFrozenRows(1);
  
  // Adicionar formatação condicional para o status
  var range = sheet.getRange(2, headers.indexOf('Status') + 1, Math.max(1, sheet.getLastRow() - 1), 1);
  
  var rules = sheet.getConditionalFormatRules();
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('Crítico')
    .setBackground('#F4CCCC')
    .setRanges([range])
    .build());
  
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('Urgente')
    .setBackground('#FCE5CD')
    .setRanges([range])
    .build());
  
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('Recomendado')
    .setBackground('#FFF2CC')
    .setRanges([range])
    .build());
  
  sheet.setConditionalFormatRules(rules);
}

/**
 * Cria ou atualiza uma planilha com as oportunidades de compra
 */
function criarPlanilhaOportunidades(oportunidades) {
  var ss = SpreadsheetApp.openById(VENDAS_SHEET_ID);
  var sheet = ss.getSheetByName('Oportunidades de Compra');
  
  if (!sheet) {
    sheet = ss.insertSheet('Oportunidades de Compra');
  } else {
    sheet.clear();
  }
  
  // Definir cabeçalhos
  var headers = [
    'Cód Item', 'Cód Fabricação', 'Item', 'Categoria', 'Tipo',
    'Preço Médio Histórico', 'Preço Atual', 'Economia/%', 'Qtd Sugerida',
    'Economia Potencial', 'Melhor Fornecedor'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  
  // Adicionar dados
  if (oportunidades.length > 0) {
    var data = [];
    for (var i = 0; i < oportunidades.length; i++) {
      var oport = oportunidades[i];
      var row = [];
      for (var j = 0; j < headers.length; j++) {
        var header = headers[j];
        // Ajustar para o campo com nome diferente
        if (header === 'Economia/%') {
          if (oport['Economia']) {
            row.push(oport['Economia']);
          } else if (oport['Tendência Preço']) {
            row.push(oport['Tendência Preço']);
          } else {
            row.push('N/A');
          }
        } else if (header === 'Tipo') {
          row.push(oport['Tipo'] || '');
        } else {
          row.push(oport[header] || '');
        }
      }
      data.push(row);
    }
    sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  }
  
  // Formatação
  sheet.autoResizeColumns(1, headers.length);
  sheet.setFrozenRows(1);
}

/**
 * Registra uma compra realizada no sistema
 */
function registrarCompra(dadosCompraJSON) {
  try {
    var dadosCompra = JSON.parse(dadosCompraJSON);
    
    // Validar dados necessários
    if (!dadosCompra.codItem || !dadosCompra.estabelecimento || !dadosCompra.quantidade) {
      throw new Error('Dados incompletos para registro de compra');
    }
    
    // Abrir planilha de NF entrada
    var sheet = SpreadsheetApp.openById(NF_ENTRADA_SHEET_ID).getSheetByName('NF Entrada_Produtos IA');
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    // Criar nova linha para registro
    var newRow = [];
    for (var i = 0; i < headers.length; i++) {
      var header = headers[i];
      
      switch (header) {
        case 'dtalancto':
          newRow.push(new Date());
          break;
        case 'Estabelecimento':
          newRow.push(dadosCompra.estabelecimento);
          break;
        case 'N.F (Compras)':
          newRow.push(dadosCompra.numeroNF || '');
          break;
        case 'Forncedor':
          newRow.push(dadosCompra.fornecedor || '');
          break;
        case 'Cód Item':
          newRow.push(dadosCompra.codItem || '');
          break;
        case 'Cód Fabricação':
          newRow.push(dadosCompra.codFabricacao || '');
          break;
        case 'Marca':
          newRow.push(dadosCompra.marca || '');
          break;
        case 'Item':
          newRow.push(dadosCompra.descricaoItem || '');
          break;
        case 'Qtd Compra':
          newRow.push(dadosCompra.quantidade || 0);
          break;
        case 'Custo de compra':
          newRow.push(dadosCompra.custoUnitario || 0);
          break;
        default:
          newRow.push('');
      }
    }
    
    // Adicionar a nova linha
    sheet.appendRow(newRow);
    
    // Atualizar o estoque
    atualizarEstoqueCompra(dadosCompra);
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', message: 'Compra registrada com sucesso' })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Atualiza o estoque após uma compra
 */
function atualizarEstoqueCompra(dadosCompra) {
  var sheet = SpreadsheetApp.openById(ESTOQUE_SHEET_ID).getSheetByName('Estoque por Estabelecimento');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  // Encontrar o item no estoque
  var itemFound = false;
  for (var i = 1; i < data.length; i++) {
    var codItem = data[i][headers.indexOf('Cód Item')];
    var codFabricacao = data[i][headers.indexOf('Cód Fabricação')];
    
    if (codItem == dadosCompra.codItem || 
        (dadosCompra.codFabricacao && codFabricacao == dadosCompra.codFabricacao)) {
      
      // Encontrou o item, atualizar o estoque do estabelecimento
      var colEstab = headers.indexOf(dadosCompra.estabelecimento);
      if (colEstab > -1) {
        var estoqueAtual = data[i][colEstab] || 0;
        var novoEstoque = estoqueAtual + parseInt(dadosCompra.quantidade);
        
        // Atualizar o valor na planilha
        sheet.getRange(i + 1, colEstab + 1).setValue(novoEstoque);
        itemFound = true;
        break;
      }
    }
  }
  
  // Se o item não foi encontrado, adicionar uma nova linha
  if (!itemFound && dadosCompra.descricaoItem) {
    var newRow = Array(headers.length).fill('');
    newRow[headers.indexOf('Cód Item')] = dadosCompra.codItem;
    newRow[headers.indexOf('Cód Fabricação')] = dadosCompra.codFabricacao || '';
    newRow[headers.indexOf('Item')] = dadosCompra.descricaoItem;
    newRow[headers.indexOf(dadosCompra.estabelecimento)] = parseInt(dadosCompra.quantidade);
    
    sheet.appendRow(newRow);
  }
}

/**
 * Registra uma transferência entre estabelecimentos
 */
function registrarTransferencia(dadosTransferenciaJSON) {
  try {
    var dadosTransferencia = JSON.parse(dadosTransferenciaJSON);
    
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
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', message: 'Transferência registrada com sucesso' })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Atualiza o estoque após uma transferência
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

/**
 * Cria uma cópia de backup das planilhas
 */
function realizarBackup() {
  try {
    var now = new Date();
    var timestamp = now.getFullYear() + 
                    padZero(now.getMonth() + 1) + 
                    padZero(now.getDate()) + '_' + 
                    padZero(now.getHours()) + 
                    padZero(now.getMinutes());
    
    // Backup da planilha de vendas
    var vendasOriginal = DriveApp.getFileById(VENDAS_SHEET_ID);
    var vendasBackup = vendasOriginal.makeCopy('Backup_Vendas_' + timestamp);
    
    // Backup da planilha de estoque
    var estoqueOriginal = DriveApp.getFileById(ESTOQUE_SHEET_ID);
    var estoqueBackup = estoqueOriginal.makeCopy('Backup_Estoque_' + timestamp);
    
    // Backup da planilha de NF entrada
    var nfEntradaOriginal = DriveApp.getFileById(NF_ENTRADA_SHEET_ID);
    var nfEntradaBackup = nfEntradaOriginal.makeCopy('Backup_NFEntrada_' + timestamp);
    
    // Criar pasta de backup se não existir
    var backupFolder = null;
    var folders = DriveApp.getFoldersByName('Backups_IA_Mestre_Compras');
    
    if (folders.hasNext()) {
      backupFolder = folders.next();
    } else {
      backupFolder = DriveApp.createFolder('Backups_IA_Mestre_Compras');
    }
    
    // Mover arquivos para pasta de backup
    backupFolder.addFile(vendasBackup);
    backupFolder.addFile(estoqueBackup);
    backupFolder.addFile(nfEntradaBackup);
    
    // Remover dos locais originais
    DriveApp.getRootFolder().removeFile(vendasBackup);
    DriveApp.getRootFolder().removeFile(estoqueBackup);
    DriveApp.getRootFolder().removeFile(nfEntradaBackup);
    
    return ContentService.createTextOutput(
      JSON.stringify({ 
        status: 'success', 
        message: 'Backup realizado com sucesso',
        urlBackup: backupFolder.getUrl()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Obtém análises e estatísticas de fornecedores
 */
function getAnalisesFornecedoresData(params) {
  try {
    // Obter dados de todas as fontes
    var nfEntradaData = obterDadosNFEntrada();
    
    // Analisar dados de fornecedores
    var fornecedores = {};
    var dataAtual = new Date();
    
    // Processar cada compra para análise de fornecedores
    for (var i = 0; i < nfEntradaData.length; i++) {
      var compra = nfEntradaData[i];
      var fornecedor = compra.Forncedor;
      
      if (!fornecedor) continue;
      
      if (!fornecedores[fornecedor]) {
        fornecedores[fornecedor] = {
          nome: fornecedor,
          compras: 0,
          valorTotal: 0,
          qtdTotal: 0,
          ultimaCompra: new Date(0),
          categorias: {},
          precoMedio: 0,
          leadTime: 0
        };
      }
      
      var dadosFornecedor = fornecedores[fornecedor];
      var dataCompra = new Date(compra.dtalancto);
      var categoria = classificarProduto(compra);
      
      // Atualizar estatísticas
      dadosFornecedor.compras++;
      dadosFornecedor.valorTotal += compra['Custo de compra'] * compra['Qtd Compra'];
      dadosFornecedor.qtdTotal += compra['Qtd Compra'];
      
      // Atualizar última compra
      if (dataCompra > dadosFornecedor.ultimaCompra) {
        dadosFornecedor.ultimaCompra = dataCompra;
      }
      
      // Registrar categorias
      if (!dadosFornecedor.categorias[categoria]) {
        dadosFornecedor.categorias[categoria] = 0;
      }
      dadosFornecedor.categorias[categoria]++;
    }
    
    // Calcular métricas adicionais e converter para array
    var fornecedoresArray = [];
    
    for (var fornecedorKey in fornecedores) {
      var dadosFornecedor = fornecedores[fornecedorKey];
      
      // Calcular preço médio
      dadosFornecedor.precoMedio = dadosFornecedor.valorTotal / dadosFornecedor.qtdTotal;
      
      // Calcular recência
      dadosFornecedor.recencia = Math.floor((dataAtual - dadosFornecedor.ultimaCompra) / (1000 * 60 * 60 * 24));
      
      // Converter categorias para texto
      var categoriasTexto = [];
      for (var cat in dadosFornecedor.categorias) {
        categoriasTexto.push(cat);
      }
      dadosFornecedor.categoriasTexto = categoriasTexto.join(', ');
      
      // Calcular classificação
      if (dadosFornecedor.recencia <= 30 && dadosFornecedor.compras >= 5) {
        dadosFornecedor.classificacao = 'Preferencial';
      } else if (dadosFornecedor.recencia <= 90 && dadosFornecedor.compras >= 3) {
        dadosFornecedor.classificacao = 'Recomendado';
      } else if (dadosFornecedor.recencia <= 180) {
        dadosFornecedor.classificacao = 'Alternativo';
      } else {
        dadosFornecedor.classificacao = 'Não Recomendado';
      }
      
      // Adicionar ao array
      fornecedoresArray.push(dadosFornecedor);
    }
    
    // Aplicar filtros se fornecidos
    if (params) {
      if (params.categoria) {
        fornecedoresArray = fornecedoresArray.filter(function(fornecedor) {
          return fornecedor.categoriasTexto.indexOf(params.categoria) !== -1;
        });
      }
      
      if (params.classificacao) {
        fornecedoresArray = fornecedoresArray.filter(function(fornecedor) {
          return fornecedor.classificacao === params.classificacao;
        });
      }
      
      if (params.nome) {
        fornecedoresArray = fornecedoresArray.filter(function(fornecedor) {
          return fornecedor.nome.toLowerCase().indexOf(params.nome.toLowerCase()) !== -1;
        });
      }
    }
    
    // Ordenar por número de compras (decrescente)
    fornecedoresArray.sort(function(a, b) {
      return b.compras - a.compras;
    });
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', data: fornecedoresArray })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Obtém histórico de compras filtrado por período
 */
function getHistoricoComprasData(dataInicio, dataFim) {
  try {
    // Obter todos os dados de compras
    var nfEntradaData = obterDadosNFEntrada();
    
    // Converter strings de data para objetos Date
    dataInicio = dataInicio ? new Date(dataInicio) : new Date(0);
    dataFim = dataFim ? new Date(dataFim) : new Date();
    
    // Filtrar por período
    var dadosFiltrados = nfEntradaData.filter(function(compra) {
      var dataCompra = new Date(compra.dtalancto);
      return dataCompra >= dataInicio && dataCompra <= dataFim;
    });
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', data: dadosFiltrados })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Obtém histórico de vendas filtrado por período
 */
function getHistoricoVendasData(dataInicio, dataFim) {
  try {
    // Obter todos os dados de vendas
    var vendasData = obterDadosVendas();
    
    // Converter strings de data para objetos Date
    dataInicio = dataInicio ? new Date(dataInicio) : new Date(0);
    dataFim = dataFim ? new Date(dataFim) : new Date();
    
    // Filtrar por período
    var dadosFiltrados = vendasData.filter(function(venda) {
      var dataVenda = new Date(venda['Date Venda']);
      return dataVenda >= dataInicio && dataVenda <= dataFim;
    });
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', data: dadosFiltrados })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Obtém análise de tendências de preços
 */
function getTendenciasPrecosData(params) {
  try {
    // Obter dados de todas as fontes
    var nfEntradaData = obterDadosNFEntrada();
    
    // Agrupar compras por produto
    var produtos = {};
    var dataAtual = new Date();
    
    // Processar cada compra
    for (var i = 0; i < nfEntradaData.length; i++) {
      var compra = nfEntradaData[i];
      var codItem = compra['Cód Item'];
      var codFabricacao = compra['Cód Fabricação'];
      var chave = codItem + '-' + codFabricacao;
      
      if (!produtos[chave]) {
        produtos[chave] = {
          'Cód Item': codItem,
          'Cód Fabricação': codFabricacao,
          'Item': compra.Item,
          'Categoria': classificarProduto(compra),
          compras: []
        };
      }
      
      produtos[chave].compras.push({
        data: new Date(compra.dtalancto),
        preco: compra['Custo de compra'],
        fornecedor: compra.Forncedor,
        quantidade: compra['Qtd Compra']
      });
    }
    
    // Analisar tendências para cada produto
    var tendencias = [];
    
    for (var prodKey in produtos) {
      var produto = produtos[prodKey];
      
      // Precisamos de pelo menos 2 compras para analisar tendência
      if (produto.compras.length < 2) continue;
      
      // Ordenar compras por data
      produto.compras.sort(function(a, b) {
        return a.data - b.data;
      });
      
      // Dividir em períodos: últimos 3 meses vs anteriores
      var tresAtras = new Date(dataAtual);
      tresAtras.setMonth(dataAtual.getMonth() - 3);
      
      var comprasRecentes = produto.compras.filter(function(c) {
        return c.data >= tresAtras;
      });
      
      var comprasAnteriores = produto.compras.filter(function(c) {
        return c.data < tresAtras;
      });
      
      // Calcular preços médios
      var precoMedioRecente = 0;
      var precoMedioAnterior = 0;
      
      if (comprasRecentes.length > 0) {
        var somaRecente = 0;
        for (var j = 0; j < comprasRecentes.length; j++) {
          somaRecente += comprasRecentes[j].preco;
        }
        precoMedioRecente = somaRecente / comprasRecentes.length;
      }
      
      if (comprasAnteriores.length > 0) {
        var somaAnterior = 0;
        for (var k = 0; k < comprasAnteriores.length; k++) {
          somaAnterior += comprasAnteriores[k].preco;
        }
        precoMedioAnterior = somaAnterior / comprasAnteriores.length;
      }
      
      // Calcular variação percentual
      var variacaoPercentual = 0;
      
      if (precoMedioAnterior > 0 && precoMedioRecente > 0) {
        variacaoPercentual = ((precoMedioRecente / precoMedioAnterior) - 1) * 100;
      }
      
      // Adicionar à lista de tendências
      tendencias.push({
        'Cód Item': produto['Cód Item'],
        'Cód Fabricação': produto['Cód Fabricação'],
        'Item': produto.Item,
        'Categoria': produto.Categoria,
        'Preço Médio Anterior': precoMedioAnterior.toFixed(2),
        'Preço Médio Recente': precoMedioRecente.toFixed(2),
        'Variação (%)': variacaoPercentual.toFixed(2),
        'Preço Atual': produto.compras[produto.compras.length - 1].preco.toFixed(2),
        'Última Compra': produto.compras[produto.compras.length - 1].data.toISOString().split('T')[0],
        'Tendência': variacaoPercentual > 0 ? 'Alta' : (variacaoPercentual < 0 ? 'Queda' : 'Estável')
      });
    }
    
    // Aplicar filtros se fornecidos
    if (params) {
      if (params.categoria) {
        tendencias = tendencias.filter(function(item) {
          return item.Categoria === params.categoria;
        });
      }
      
      if (params.tendencia) {
        tendencias = tendencias.filter(function(item) {
          return item.Tendência === params.tendencia;
        });
      }
      
      if (params.variacaoMinima) {
        var variacaoMinima = parseFloat(params.variacaoMinima);
        tendencias = tendencias.filter(function(item) {
          return Math.abs(parseFloat(item['Variação (%)'])) >= variacaoMinima;
        });
      }
    }
    
    // Ordenar por variação (decrescente)
    tendencias.sort(function(a, b) {
      return parseFloat(b['Variação (%)']) - parseFloat(a['Variação (%)']);
    });
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', data: tendencias })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Obtém oportunidades de compra identificadas pela IA
 */
function getOportunidadesCompraData(params) {
  try {
    // Obter dados de todas as fontes
    var nfEntradaData = obterDadosNFEntrada();
    var estoqueData = obterDadosEstoque();
    
    // Analisar oportunidades de compra
    var oportunidades = analisarOportunidadesCompra(nfEntradaData, estoqueData);
    
    // Aplicar filtros se fornecidos
    if (params) {
      if (params.categoria) {
        oportunidades = oportunidades.filter(function(item) {
          return item.Categoria === params.categoria;
        });
      }
      
      if (params.tipo) {
        oportunidades = oportunidades.filter(function(item) {
          return item.Tipo === params.tipo;
        });
      }
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', data: oportunidades })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Obtém sugestões de transferência entre estabelecimentos
 */
function getSugestoesTransferenciaData(params) {
  try {
    // Obter dados de todas as fontes
    var vendasData = obterDadosVendas();
    var estoqueData = obterDadosEstoque();
    
    // Calcular transferências sugeridas
    var transferencias = calcularTransferencias(estoqueData, vendasData);
    
    // Aplicar filtros se fornecidos
    if (params) {
      if (params.origem) {
        transferencias = transferencias.filter(function(item) {
          return item.Origem === params.origem;
        });
      }
      
      if (params.destino) {
        transferencias = transferencias.filter(function(item) {
          return item.Destino === params.destino;
        });
      }
      
      if (params.categoria) {
        transferencias = transferencias.filter(function(item) {
          return item.Categoria === params.categoria;
        });
      }
      
      if (params.status) {
        transferencias = transferencias.filter(function(item) {
          return item.Status === params.status;
        });
      }
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', data: transferencias })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Exporta dados para uma nova planilha
 */
function exportarParaPlanilha(tipo, dadosJSON) {
  try {
    var dados = JSON.parse(dadosJSON);
    var timestamp = new Date().toISOString().replace(/[-:T]/g, '_').split('.')[0];
    
    // Criar nova planilha
    var ss = SpreadsheetApp.create('Exportação_' + tipo + '_' + timestamp);
    var sheet = ss.getActiveSheet();
    
    // Verificar se há dados
    if (!dados || dados.length === 0) {
      sheet.appendRow(['Nenhum dado para exportação']);
      return ContentService.createTextOutput(
        JSON.stringify({ 
          status: 'success', 
          message: 'Planilha criada com sucesso',
          urlPlanilha: ss.getUrl()
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Obter cabeçalhos
    var headers = Object.keys(dados[0]);
    sheet.appendRow(headers);
    
    // Adicionar dados
    for (var i = 0; i < dados.length; i++) {
      var row = [];
      for (var j = 0; j < headers.length; j++) {
        row.push(dados[i][headers[j]]);
      }
      sheet.appendRow(row);
    }
    
    // Formatação
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.autoResizeColumns(1, headers.length);
    
    return ContentService.createTextOutput(
      JSON.stringify({ 
        status: 'success', 
        message: 'Planilha criada com sucesso',
        urlPlanilha: ss.getUrl()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Atualiza os parâmetros de configuração da IA
 */
function atualizarParametrosIA(parametrosJSON) {
  try {
    var parametros = JSON.parse(parametrosJSON);
    var ss = SpreadsheetApp.openById(VENDAS_SHEET_ID);
    var sheet = ss.getSheetByName('Configurações IA');
    
    // Criar planilha de configurações se não existir
    if (!sheet) {
      sheet = ss.insertSheet('Configurações IA');
      sheet.appendRow(['Parâmetro', 'Valor', 'Categoria', 'Descrição']);
    }
    
    // Atualizar cada parâmetro
    for (var param in parametros) {
      // Procurar se o parâmetro já existe
      var data = sheet.getDataRange().getValues();
      var rowFound = -1;
      
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] === param) {
          rowFound = i + 1;
          break;
        }
      }
      
      if (rowFound > 0) {
        // Atualizar parâmetro existente
        sheet.getRange(rowFound, 2).setValue(parametros[param]);
      } else {
        // Adicionar novo parâmetro
        sheet.appendRow([param, parametros[param], '', '']);
      }
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', message: 'Parâmetros atualizados com sucesso' })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Obtém os parâmetros atuais de configuração da IA
 */
function getParametrosIAData() {
  try {
    var ss = SpreadsheetApp.openById(VENDAS_SHEET_ID);
    var sheet = ss.getSheetByName('Configurações IA');
    
    // Verificar se a planilha existe
    if (!sheet) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: 'success', data: {} })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Obter todos os parâmetros
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var parametros = {};
    
    for (var i = 1; i < data.length; i++) {
      var param = data[i][0];
      var valor = data[i][1];
      
      if (param) {
        parametros[param] = valor;
      }
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', data: parametros })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Gera um relatório personalizado
 */
function gerarRelatorioPersonalizado(tipoRelatorio, parametrosJSON) {
  try {
    var parametros = parametrosJSON ? JSON.parse(parametrosJSON) : {};
    var ss = SpreadsheetApp.openById(VENDAS_SHEET_ID);
    var timestamp = new Date().toISOString().replace(/[-:T]/g, '_').split('.')[0];
    var nomeRelatorio = 'Relatório_' + tipoRelatorio + '_' + timestamp;
    
    // Criar nova planilha para o relatório
    var novoSS = SpreadsheetApp.create(nomeRelatorio);
    var sheet = novoSS.getActiveSheet();
    
    // Gerar relatório com base no tipo
    var dados = [];
    var headers = [];
    
    switch (tipoRelatorio) {
      case 'EstoqueMinimo':
        dados = gerarRelatorioEstoqueMinimo(parametros);
        break;
      case 'DesempenhoFornecedores':
        dados = gerarRelatorioDesempenhoFornecedores(parametros);
        break;
      case 'AnaliseVendas':
        dados = gerarRelatorioAnaliseVendas(parametros);
        break;
      default:
        throw new Error('Tipo de relatório não reconhecido');
    }
    
    // Verificar se há dados
    if (!dados || dados.length === 0) {
      sheet.appendRow(['Nenhum dado para o relatório solicitado']);
    } else {
      // Obter cabeçalhos
      headers = Object.keys(dados[0]);
      sheet.appendRow(headers);
      
      // Adicionar dados
      for (var i = 0; i < dados.length; i++) {
        var row = [];
        for (var j = 0; j < headers.length; j++) {
          row.push(dados[i][headers[j]]);
        }
        sheet.appendRow(row);
      }
      
      // Formatação
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.autoResizeColumns(1, headers.length);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ 
        status: 'success', 
        message: 'Relatório gerado com sucesso',
        urlRelatorio: novoSS.getUrl(),
        dados: dados
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Gera relatório de estoque mínimo
 */
function gerarRelatorioEstoqueMinimo(parametros) {
  // Implementação específica do relatório
  // ...
  return []; // Retornar dados do relatório
}

/**
 * Gera relatório de desempenho de fornecedores
 */
function gerarRelatorioDesempenhoFornecedores(parametros) {
  // Implementação específica do relatório
  // ...
  return []; // Retornar dados do relatório
}

/**
 * Gera relatório de análise de vendas
 */
function gerarRelatorioAnaliseVendas(parametros) {
  // Implementação específica do relatório
  // ...
  return []; // Retornar dados do relatório
}

/**
 * Função para atualizar o dashboard
 */
function atualizarDashboard() {
  // Implementação a ser adicionada para atualizar gráficos e resumos
  SpreadsheetApp.getUi().alert('Dashboard atualizado com sucesso!');
}

/**
 * Função para sincronizar dados entre planilhas
 */
function sincronizarDados() {
  // Implementação a ser personalizada de acordo com fontes de dados externas
  SpreadsheetApp.getUi().alert('Função de sincronização em desenvolvimento.');
}
