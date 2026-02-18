const API_URL = "http://localhost:3000";

let grafico; //variavel global

//Funções para controlar modais
function abrirModal(id) {
    document.getElementById(id).style.display = "block";
}

function fecharModal(id) {
    document.getElementById(id).style.display = "none";
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
    document.getElementById("valor-carteira").innerHTML =
    `R$ ${data.valor_total.toFixed(2)}`;
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

    for (let ativo of ativos) {
        const resumoResponse = await fetch(`${API_URL}/resumo/${ativo.id}`);
        const resumo = await resumoResponse.json();

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
            <button onclick="atualizarPreco(${ativo.id})">Atualizar</button>

            <button style="background:#e74c3c; color:white; margin-top:10px" onclick="deletarAtivo(${ativo.id})">Deletar Ativo</button>
        `;
        container.appendChild(div);
    }
    
    carregarCarteira();
    carregarGrafico();
}

carregarAtivos();