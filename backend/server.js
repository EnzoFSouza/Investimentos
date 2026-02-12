import express from "express";
import cors from "cors";

import {
    criarAtivo,
    listarAtivos,
    atualizarPrecoAtivo,
    deletarAtivo,
    criarAporte,
    listarAportes,
    listarAportesPorAtivo,
    deletarAporte,
    calcularResumoAtivo,
    calcularCarteiraTotal
} from "./database.js";

const app = express();

app.use(cors());
app.use(express.json());
const PORT = 3000;

app.get("/", (req, res) => {
    res.send("API de Investimentos funcionando!");
});

//ROTAS DE ATIVOS
//Criar ativo
app.post("/ativos", (req, res) => {
    const {nome, tipo, preco_atual} = req.body;
    const resultado = criarAtivo(nome, tipo, preco_atual);
    res.json(resultado);
}); 

//Listar ativos
app.get("/ativos", (req, res) => {
    res.json(listarAtivos());
});

//Atualizar preço
app.put("/ativos/:id", (req, res) => {
    const {id} = req.params;
    const {preco_atual} = req.body;
    const resultado = atualizarPrecoAtivo(id, preco_atual);
    res.json(resultado);
});

//Deletar ativo
app.delete("/ativos/:id", (req, res) => {
    const {id} = req.params;
    const resultado = deletarAtivo(id);
    res.json(resultado);
});

//ROTAS DE APORTES
//Criar aporte
app.post("/aportes", (req, res) => {
    const {ativo_id, quantidade, preco_unitario, data} = req.body;
    const resultado = criarAporte(ativo_id, quantidade, preco_unitario, data);
    res.json(resultado);
});

//Listar todos os aportes
app.get("/aportes", (req, res) => {
    res.json(listarAportes());
});

//Listar aportes por ativo
app.get("/aportes/:ativo_id", (req, res) => {
    const {ativo_id} = req.params;
    res.json(listarAportesPorAtivo(ativo_id));
});

//Deletar aporte
app.delete("/aportes/:id", (req, res) => {
    const {id} = req.params;
    const resultado = deletarAporte(id);
    res.json(resultado);
});

//ROTAS DE CÁLCULO
//Resumo de um ativo
app.get("/resumo/:id", (req, res) => {
    const {id} = req.params;
    res.json(calcularResumoAtivo(id));
});

//Valor total da carteira
app.get("/carteira", (req, res) => {
    res.json(calcularCarteiraTotal());
});

//INICIAR SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});