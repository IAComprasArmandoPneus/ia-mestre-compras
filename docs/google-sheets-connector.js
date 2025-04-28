/**
 * Módulo de Conexão com Google Sheets
 * 
 * Este módulo facilita a integração entre o sistema IA Mestre em Compras
 * e as planilhas do Google Sheets que contêm os dados operacionais.
 */

const GoogleSheetsConnector = {
    urlBase: 'https://script.google.com/macros/s/AKfycbxyfkf-Glm1X1BXovXn8f-JbkfJvw5ep2qaUrFfcKPr_A_qHg9asbxH8WgbrXakXVtCzw/exec',
    inicializar: function() { console.log('Conector inicializado.'); },
    obterDadosVendas: async function() {
        const resposta = await fetch(`${this.urlBase}?action=getVendas`);
        return resposta.json();
    },
    obterDadosEstoque: async function() {
        const resposta = await fetch(`${this.urlBase}?action=getEstoque`);
        return resposta.json();
    },
    obterDadosNFEntrada: async function() {
        const resposta = await fetch(`${this.urlBase}?action=getNFEntrada`);
        return resposta.json();
    }
};

