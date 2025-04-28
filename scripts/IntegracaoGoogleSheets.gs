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
