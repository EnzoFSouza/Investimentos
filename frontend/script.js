const API_URL = "http://localhost:3000";

let grafico; //variavel global

//Funções para controlar modais
function abrirModal(id) {
    document.getElementById(id).style.display = "block";
}

function fecharModal(id) {
    document.getElementById(id).style.display = "none";
}

//Atualizar mini-cards do header
function atualizarMiniCards(lucro, qtd) {
    const elementoLucro = document.getElementById("lucro-total");
    const elementoQtd = document.getElementById("qtd-ativos");

    elementoQtd.innerHTML = qtd;
    elementoLucro.innerHTML = lucro.toLocaleString('pt-BR', { 
        style: 'currency',
        currency: 'BRL' 
    });

    //Muda a cor do lucro para verde ou vermelho
    elementoLucro.className = lucro >= 0 ? "positivo" : "negativo";
}

//Fechar modal se clicar fora da caixa branca
window.onclick = function(event) {
    if (event.target.className === 'modal') {
        event.target.style.display = "none";
    }
}

async function carregarGrafico() {
    const response = await fetch(`${API_URL}/ativos`);
    const ativos = await response.json();

    let labels = [];
    let valores = [];

    for (let ativo of ativos){
        const resumoResponse = await fetch(`${API_URL}/resumo/${ativo.id}`);
        const resumo = await resumoResponse.json();

        if (resumo.valor_atual > 0) {
            labels.push(resumo.nome);
            valores.push(resumo.valor_atual);
        }
    }

    const ctx = document.getElementById("graficoAlocacao").getContext("2d");

    if (grafico) {
        grafico.destroy();
    }

    grafico = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: valores
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

async function adicionarAtivo() {
    const nome = document.getElementById("nome").value;
    const tipo = document.getElementById("tipo").value;
    const preco = document.getElementById("preco").value;

    await fetch(`${API_URL}/ativos`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            nome,
            tipo,
            preco_atual: Number(preco)
        })
    });

    fecharModal('modalAtivos');
    carregarAtivos();
}

async function adicionarAporte() {
    const ativo_id = document.getElementById("ativo_id").value;
    const quantidade = document.getElementById("quantidade").value;
    const preco_unitario = document.getElementById("preco_unitario").value;
    const data = document.getElementById("data").value;

    await fetch(`${API_URL}/aportes`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            ativo_id: Number(ativo_id),
            quantidade: Number(quantidade),
            preco_unitario: Number(preco_unitario),
            data
        })
    });
    
    fecharModal('modalAporte');
    carregarAtivos();
}

async function carregarCarteira() {
    const response = await fetch(`${API_URL}/carteira`);
    const data = await response.json();

    //Formata o numero para o padrao brasileiro
    const valorFormatado = data.valor_total.toLocaleString('pt-BR', { 
        style: 'currency',
        currency: 'BRL' 
    });
    document.getElementById("valor-carteira").innerHTML = valorFormatado;
}

async function atualizarPreco(id) {
    const novoPreco = document.getElementById(`preco-${id}`).value;
    await fetch(`${API_URL}/ativos/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            preco_atual: Number(novoPreco)
        })
    });

    carregarAtivos();
}

async function deletarAtivo(id){
    await fetch(`${API_URL}/ativos/${id}`, {
        method: "DELETE"
    });

    carregarAtivos();
    //Como configurou ON DELETE CASCADE, os aportes são apagados automaticamente
}

async function carregarAtivos() {
    const response = await fetch(`${API_URL}/ativos`);
    const ativos = await response.json();

    const container = document.getElementById("lista-ativos");
    container.innerHTML = "";

    //Variáveis para acumular totais do cabeçalho
    let lucroTotalAcumulado = 0;
    let contadorAtivos = ativos.length;

    for (let ativo of ativos) {
        const resumoResponse = await fetch(`${API_URL}/resumo/${ativo.id}`);
        const resumo = await resumoResponse.json();

        // Somando o lucro/prejuízo de cada ativo ao total
        lucroTotalAcumulado += Number(resumo.lucro_prejuizo);

        const carteiraResponse = await fetch(`${API_URL}/carteira`);
        const carteira = await carteiraResponse.json();
        const percentual = 
            carteira.valor_total > 0
            ? (resumo.valor_atual / carteira.valor_total) * 100
            : 0;

        const div = document.createElement("div");
        div.className = "card-ativo";
        div.innerHTML = `
            <strong>${resumo.nome}</strong> <span class="tag-tipo">${resumo.tipo}</span><br>
            <p>Quantidade: <b>${resumo.quantidade_total}</b></p>
            <p>Investido: <b>R$ ${resumo.total_investido}</b><p>
            <p>Valor Atual: <b>R$ ${resumo.valor_atual}</b></p>
            <p>Percentual da Carteira: <b>${percentual.toFixed(2)}%</b></p>
            <p>Lucro/Prejuízo: <span style="color: ${resumo.lucro_prejuizo >= 0 ? 'green' : 'red'}">
                R$ ${resumo.lucro_prejuizo}
            </span></p>

            Novo preço:
            <input type="number" id="preco-${ativo.id}" placeholder="Novo preço">
            <div class="card-acoes">
                <button onclick="atualizarPreco(${ativo.id})">Atualizar</button>
                <button class="btn-deletar" onclick="deletarAtivo(${ativo.id})">Deletar</button>
            </div>
        `;
        container.appendChild(div);
    }
    
    //Atualiza os mini-cards no header
    atualizarMiniCards(lucroTotalAcumulado, contadorAtivos);

    carregarCarteira();
    carregarGrafico();
}

carregarAtivos();