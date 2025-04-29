// ========== FUNÇÕES DE INICIALIZAÇÃO ==========

// Quando clicar no botão "Atualizar Dados"
document.getElementById('btnAtualizar').addEventListener('click', atualizarDados);

// Função principal para atualizar todos os dados
async function atualizarDados() {
    try {
        mostrarLoading(); // Mostra loading global

        await carregarDashboard();
        await carregarSugestoesCompra();
        await carregarTransferencias();
        await carregarOportunidades();
        await carregarFornecedores();

        atualizarDataHoraAtualizacao();
        mostrarAlerta('Dados atualizados com sucesso!', 'success');

    } catch (error) {
        console.error('Erro ao atualizar dados:', error);
        mostrarAlerta('Erro ao atualizar os dados. Tente novamente.', 'error');

    } finally {
        esconderLoading(); // Sempre esconde loading
    }
}

// Atualiza o horário no cabeçalho
function atualizarDataHoraAtualizacao() {
    const agora = new Date();
    const formatado = agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR');
    document.querySelector('.user-info span').innerText = `Última atualização: ${formatado}`;
}

// Mostrar e esconder loading global
function mostrarLoading() {
    document.getElementById('loading-global').style.display = 'flex';
}
function esconderLoading() {
    document.getElementById('loading-global').style.display = 'none';
}

// Função para exibir alertas temporários
function mostrarAlerta(mensagem, tipo) {
    const alertContainer = document.getElementById('alert-container');
    alertContainer.innerHTML = `
        <div class="alert ${tipo}">
            ${mensagem}
        </div>
    `;
    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 4000);
}

// ========== FUNÇÕES DE CARGA DE DADOS ==========

// Carregar informações do Dashboard
async function carregarDashboard() {
    try {
        const response = await fetch('/api/getVendas');
        const dados = await response.json();

        if (!dados || !dados.data) throw new Error('Dados de vendas inválidos');

        // Aqui você atualiza os cards do Dashboard
        document.querySelectorAll('.card .stat')[0].innerText = dados.data.length; // Exemplo: número de vendas
        // (Ajuste conforme seu backend)

    } catch (error) {
        console.error('Erro ao carregar Dashboard:', error);
        throw error;
    }
}

// Carregar sugestões de compra
async function carregarSugestoesCompra() {
    try {
        const response = await fetch('/api/getRecomendacoes');
        const dados = await response.json();

        if (!dados || !dados.data) throw new Error('Dados de recomendações inválidos');

        const tabela = document.getElementById('tabelaSugestoesCompra');
        tabela.innerHTML = '';

        dados.data.forEach(item => {
            const linha = `
                <tr>
                    <td>${item['Cód Item']}</td>
                    <td>${item['Item']}</td>
                    <td>${item['Categoria']}</td>
                    <td>${item['Estabelecimento']}</td>
                    <td>${item['Estoque Atual']}</td>
                    <td>${item['Estoque Mínimo']}</td>
                    <td>${item['Média Vendas (30d)']}</td>
                    <td>${item['Previsão Vendas (30d)']}</td>
                    <td>${item['Dias em Estoque']}</td>
                    <td>${item['Qtd Sugerida']}</td>
                    <td>${item['Melhor Fornecedor']}</td>
                    <td>${item['Status']}</td>
                    <td><button class="btn-acao">Detalhes</button></td>
                </tr>
            `;
            tabela.innerHTML += linha;
        });

    } catch (error) {
        console.error('Erro ao carregar Sugestões de Compra:', error);
        throw error;
    }
}

// Carregar transferências sugeridas
async function carregarTransferencias() {
    try {
        const response = await fetch('/api/getSugestoesTransferencia');
        const dados = await response.json();

        if (!dados || !dados.data) throw new Error('Dados de transferências inválidos');

        const tabela = document.getElementById('tabelaTransferenciasCompleta');
        tabela.innerHTML = '';

        dados.data.forEach(item => {
            const linha = `
                <tr>
                    <td>${item['Cód Item']}</td>
                    <td>${item['Item']}</td>
                    <td>${item['Categoria']}</td>
                    <td>${item['Origem']}</td>
                    <td>${item['EstoqueOrigem']}</td>
                    <td>${item['Destino']}</td>
                    <td>${item['EstoqueDestino']}</td>
                    <td>${item['QtdSugerida']}</td>
                    <td>${item['Dias Cobertura']}</td>
                    <td>${item['Status']}</td>
                    <td><button class="btn-acao">Transferir</button></td>
                </tr>
            `;
            tabela.innerHTML += linha;
        });

    } catch (error) {
        console.error('Erro ao carregar Transferências:', error);
        throw error;
    }
}

// Carregar oportunidades de compra
async function carregarOportunidades() {
    try {
        const response = await fetch('/api/getOportunidadesCompra');
        const dados = await response.json();

        if (!dados || !dados.data) throw new Error('Dados de oportunidades inválidos');

        const tabela = document.getElementById('tabelaOportunidades');
        tabela.innerHTML = '';

        dados.data.forEach(item => {
            const linha = `
                <tr>
                    <td>${item['Cód Item']}</td>
                    <td>${item['Item']}</td>
                    <td>${item['Categoria']}</td>
                    <td>${item['Tipo']}</td>
                    <td>${item['Preço Médio Histórico']}</td>
                    <td>${item['Preço Atual']}</td>
                    <td>${item['Economia/%']}</td>
                    <td>${item['Qtd Sugerida']}</td>
                    <td>${item['Melhor Fornecedor']}</td>
                    <td><button class="btn-acao">Ver</button></td>
                </tr>
            `;
            tabela.innerHTML += linha;
        });

    } catch (error) {
        console.error('Erro ao carregar Oportunidades:', error);
        throw error;
    }
}

// Carregar análise de fornecedores
async function carregarFornecedores() {
    try {
        const response = await fetch('/api/getAnalisesFornecedores');
        const dados = await response.json();

        if (!dados || !dados.data) throw new Error('Dados de fornecedores inválidos');

        const tabela = document.getElementById('tabelaFornecedores');
        tabela.innerHTML = '';

        dados.data.forEach(item => {
            const linha = `
                <tr>
                    <td>${item.nome}</td>
                    <td>${item.categoriasTexto}</td>
                    <td>${item.compras}</td>
                    <td>${item.precoMedio.toFixed(2)}</td>
                    <td>${item.leadTime} dias</td>
                    <td>${new Date(item.ultimaCompra).toLocaleDateString('pt-BR')}</td>
                    <td>${item.recencia} dias</td>
                    <td>${item.valorTotal.toFixed(2)}</td>
                    <td>${item.classificacao}</td>
                    <td><button class="btn-acao">Detalhes</button></td>
                </tr>
            `;
            tabela.innerHTML += linha;
        });

    } catch (error) {
        console.error('Erro ao carregar Fornecedores:', error);
        throw error;
    }
}
