/**
 * Classificação avançada de produtos
 * @param {Object} item - Objeto com dados do produto
 * @return {String} Categoria do produto
 */
function classificarProduto(item) {
  if (!item || !item.Item) {
    return 'PEÇAS'; // Default
  }
  
  var nomeProduto = item.Item.toLowerCase();
  var codigoFabricacao = item['Cód Fabricação'] ? item['Cód Fabricação'].toString().toLowerCase() : '';
  
  // Palavras-chave para identificação de categoria
  var keywordsPneus = ['pneu', 'michelin', 'goodyear', 'pirelli', 'continental', 
                      'bridgestone', 'firestone', 'dunlop', 'aro', 'r13', 'r14', 
                      'r15', 'r16', 'r17', 'r18', 'r19', 'r20'];
                      
  var keywordsLubrificantes = ['oleo', 'óleo', 'lubrificante', 'aditivo', 'fluido', 
                             'radiador', 'freio', 'motor', '5w', '10w', '15w', '20w', 
                             'castrol', 'mobil', 'shell', 'ipiranga', 'petronas',
                             'valvoline', 'bardahl', 'arla'];
  
  // Verificar por correspondência de palavras-chave
  for (var i = 0; i < keywordsPneus.length; i++) {
    var keyword = keywordsPneus[i];
    if (nomeProduto.indexOf(keyword) !== -1 || codigoFabricacao.indexOf(keyword) !== -1) {
      return 'PNEUS';
    }
  }
  
  for (var j = 0; j < keywordsLubrificantes.length; j++) {
    var keyword = keywordsLubrificantes[j];
    if (nomeProduto.indexOf(keyword) !== -1 || codigoFabricacao.indexOf(keyword) !== -1) {
      return 'LUBRIFICANTES/ADITIVOS';
    }
  }
  
  // Se não encontrar correspondência, assume que é peça
  return 'PEÇAS';
}
