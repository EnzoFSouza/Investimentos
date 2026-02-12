const API_URL = "http://localhost:3000";

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
    
    carregarAtivos();
}

async function carregarAtivos() {
    const response = await fetch(`${API_URL}/ativos`);
    const ativos = await response.json();

    const container = document.getElementById("lista-ativos");
    container.innerHTML = "";

    for (let ativo of ativos) {
        const resumoResponse = await fetch(`${API_URL}/resumo/${ativo.id}`);
        const resumo = await resumoResponse.json();

        const div = document.createElement("div");
        div.innerHTML = `
            <hr>
            <strong>${resumo.nome}</strong> (${resumo.tipo})<br>
            Quantidade: ${resumo.quantidade_total}<br>
            Investido: R$ ${resumo.total_investido}<br>
            Valor Atual: R$ ${resumo.valor_atual}<br>
            Lucro/Prejuízo: R$ ${resumo.lucro_prejuizo}
        `;
        container.appendChild(div);
    }
}

carregarAtivos();