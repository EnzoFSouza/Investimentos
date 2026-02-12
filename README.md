# 📊 Sistema de controle de Investimentos (MVP)

Sistema web simples para controle de investimentos, permitindo cadastrar ativos, registrar aportes, calcular valor investido, lucro/prejuízo e 
visualizar a alocação da carteira em gráfico.

Projeto desenvolvido como MVP para aprendizado de:
- Node.js
- Express
- SQLite
- APIs REST
- Frontend com HTML, CSS E JavaScript
- Integração com Chart.js
- Versionamento com Git

## 🚀 Funcionalidades

### ✅ Ativos:
- Criar ativo
- Listar ativos
- Atualizar preço atual
- Deletar ativo (com remoção automática dos aportes relacionados)

### ✅ Aportes:
- Criar aporte
- Listar aportes
- Deletar aporte

### ✅ Cálculos automáticos
- Quantidade total por ativo
- Total investido
- Valor atual
- Lucro / Prejuízo
- Valor total da carteira
- Percentual de alocação

### ✅ Visualização
- Gráfico de alocação da carteira com Chart.js

## 🏗️ Tecnologias Utilizadas

### Backend
- Node.js
- Express
- better-sqlite3
- SQLite
- CORS

### Frontend
- HTML
- CSS
- JavaScript puro
- Chart.js

## 📁 Estrutura do Projeto
```
Investimentos/  
|- backend/  
|--- database.js  
|--- server.js  
|--- investimentos.db  
|--- package.json  
|--- package-lock.json  
|  
|- frontend/  
|--- index.html  
|--- style.css  
|--- script.js
```

## 🗄️ Modelagem do Banco
Tabela `ativos`  
```
id - INTEGER (PK)  
nome - TEXT  
tipo - TEXT  
preco_atual - REAL
```

Tabela `aportes`  
``` 
id - INTEGER (PK)  
ativo_id - INTEGER (FK)  
quantidade - REAL  
preco_unitario - REAL  
data - TEXT  
```

# 📊 API REST
## Ativos
```
GET     /ativos
POST    /ativos
PUT     /ativos/:id
DELETE  /ativos/:id
```

## Aportes
```
GET     /aportes
POST    /aportes
GET     /aportes/:ativo_id
DELETE  /aportes/:id
```

## Cálculos
```
GET /resumo/:id
GET /carteira
```

## 🎯 Objetivos do Projeto
Este projeto foi desenvolvido para:
- Praticar desenvolvimento backend com Node.js
- Trabalhar com banco de dados relacional (SQLite)
- Construir uma API REST completa
- Integrar frontend consumindo API
- Criar visualização de dados com gráficos
