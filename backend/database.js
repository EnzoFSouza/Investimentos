import Database  from "better-sqlite3";

//cria/abre banco de dados
const db = new Database("investimentos.db");

//suporte a chave estrangeira no SQLite
db.exec("PRAGMA foreign_keys = ON;");

//Criando tabelas
db.exec(`
    CREATE TABLE IF NOT EXISTS ativos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL,
    preco_atual REAL NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS aportes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ativo_id INTEGER NOT NULL,
    quantidade REAL NOT NULL,
    preco_unitario REAL NOT NULL,
    data TEXT NOT NULL,
    FOREIGN KEY (ativo_id) REFERENCES ativos(id) ON DELETE CASCADE
    );
`);

//FOREIGN KEY garante que não existe aporte sem ativo
//ON DELETE CASCADE se deletar um ativo, os aportes dele também serão deletados

//CRUD ATIVOS
export function criarAtivo(nome, tipo, preco_atual){
    const stmt = db.prepare(`
        INSERT INTO ativos (nome, tipo, preco_atual)
        VALUES (?, ?, ?)
    `);
    return stmt.run(nome, tipo, preco_atual);
}

export function listarAtivos(){
    return db.prepare(`SELECT * FROM ativos`).all();
}

export function atualizarPrecoAtivo(id, novoPreco){
    return db.prepare(`
        UPDATE ativos
        SET preco_atual = ?
        WHERE id = ?
        `).run(novoPreco, id);
}

export function deletarAtivo(id){
    return db.prepare(`
        DELETE FROM ativos
        WHERE id = ?
    `).run(id);
}


//CRUD APORTES
export function criarAporte(ativo_id, quantidade, preco_unitario, data) {
    return db.prepare(`
        INSERT INTO aportes (ativo_id, quantidade, preco_unitario, data)
        VALUES (?, ?, ?, ?)
    `).run(ativo_id, quantidade, preco_unitario, data);
}

export function listarAportes(){
    return db.prepare(`
        SELECT * FROM aportes
    `).all();
}

export function listarAportesPorAtivo(ativo_id){
    return db.prepare(`
        SELECT * FROM aportes
        WHERE ativo_id = ?
    `).all(ativo_id);
}

export function deletarAporte(id){
    return db.prepare(`
        DELETE FROM aportes
        WHERE id = ?
    `).run(id);
}

//Cálculos financeiros
//Total investido em um ativo
export function calcularTotalInvestido(ativo_id){
    return db.prepare(`
        SELECT 
            IFNULL(SUM(quantidade * preco_unitario), 0) as total_investido
        FROM aportes
        WHERE ativo_id = ?
    `).get(ativo_id);
}

//Quantidade total de cotas
export function calcularQuantidadeTotal(ativo_id) {
  return db.prepare(`
    SELECT 
      IFNULL(SUM(quantidade), 0) as quantidade_total
    FROM aportes
    WHERE ativo_id = ?
  `).get(ativo_id);
}

//Valor atual do ativo
export function calcularValorAtual(ativo_id) {
  return db.prepare(`
    SELECT 
      IFNULL(SUM(a.quantidade), 0) * at.preco_atual as valor_atual
    FROM aportes a
    JOIN ativos at ON a.ativo_id = at.id
    WHERE a.ativo_id = ?
  `).get(ativo_id);
}

// Resumo completo do ativo para gráficos
export function calcularResumoAtivo(ativo_id) {
  return db.prepare(`
    SELECT
      at.id,
      at.nome,
      at.tipo,
      at.preco_atual,
      IFNULL(SUM(a.quantidade), 0) as quantidade_total,
      IFNULL(SUM(a.quantidade * a.preco_unitario), 0) as total_investido,
      IFNULL(SUM(a.quantidade), 0) * at.preco_atual as valor_atual,
      (IFNULL(SUM(a.quantidade), 0) * at.preco_atual) -
      IFNULL(SUM(a.quantidade * a.preco_unitario), 0) as lucro_prejuizo
    FROM ativos at
    LEFT JOIN aportes a ON at.id = a.ativo_id
    WHERE at.id = ?
    GROUP BY at.id
  `).get(ativo_id);
}

// Valor total da carteira
export function calcularCarteiraTotal() {
  return db.prepare(`
    SELECT
      IFNULL(SUM(a.quantidade * at.preco_atual), 0) as valor_total
    FROM aportes a
    JOIN ativos at ON a.ativo_id = at.id
  `).get();
}

export default db;