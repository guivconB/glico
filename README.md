# Glico 🩸 | MVP Data IA Health

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white" />
</div>

<br/>

O **Glico** é uma plataforma inovadora desenvolvida para triagem, predição e monitoramento preventivo do risco de Diabetes. O projeto faz parte do **MVP Data IA Health da UNINASSAU** e está alinhado ao Objetivo de Desenvolvimento Sustentável (ODS) 3 da ONU: Saúde e Bem-Estar.

O sistema integra uma interface gráfica interativa (React), um servidor de regras de negócio resiliente (Node.js) e um microsserviço de Inteligência Artificial preditiva (Python/FastAPI) treinado com dados da pesquisa BRFSS do CDC americano.

---

## 🛠️ Stack Tecnológica

- **Frontend:** React, Vite, React Router DOM, Vanilla CSS (Design Dinâmico/Glassmorphism).
- **Backend Core:** Node.js, Express, Segurança baseada em Cookies (HttpOnly).
- **Inteligência Artificial:** Python, Scikit-learn (Random Forest), Pandas, FastAPI.
- **Banco de Dados:** MySQL.

---

## ✨ Principais Funcionalidades

- **Predição Preditiva (Machine Learning):** O sistema utiliza um modelo _Random Forest_ (Floresta Aleatória) para classificar o paciente como Saudável, Pré-Diabético ou Diabético com base em 15 fatores clínicos e de estilo de vida.
- **Heurística de Fallback Clínico:** Se a IA ficar offline ou demorar mais que 8 segundos para responder, o Node.js assume automaticamente com cálculos médicos pontuais, garantindo que o sistema nunca caia.
- **Formulário Dinâmico (Typeform-style):** Uma UX fluida e validada que impede a entrada de dados nocivos tanto no Frontend quanto no Server-side.
- **Sessão Segura:** Autenticação e migração total de dados utilizando JWT via cookies protegidos (`HttpOnly`), evitando ataques XSS.

---

## 📂 Estrutura da Arquitetura

- `/src`: Aplicação cliente React. Roteamento, painel (Dashboard), formulários de triagem e visualização de resultados.
- `/backend`: Servidor Node.js. Controla a validação de sessão, gravação em banco de dados e ponte segura com a IA.
- `/backend/database`: Scripts utilitários como `migrate.js` para auto-criação indempotente de tabelas MySQL.
- `/api`: Microsserviço Python contendo o script de treinamento do modelo (`train_model.py`) e a API de inferência em tempo real (`predictive_api.py`).
- `/notebook`: O laboratório de Ciência de Dados (Jupyter Notebook `Glico.ipynb`), contendo a Análise Exploratória (EDA) e a comparação entre os modelos (Regressão Logística, Árvore de Decisão e Random Forest).

---

## 🚀 Como Executar Localmente (Guia Completo)

Para rodar a plataforma inteira na sua máquina, siga os passos abaixo em ordem:

### 1. Preparando o Banco de Dados (MySQL)
Certifique-se de que o seu servidor MySQL está rodando na máquina (ex: XAMPP, Workbench). 
Crie as tabelas necessárias rodando o nosso script migrador autônomo:
```bash
node backend/database/migrate.js
```
*(Ele criará o banco `glico_db` e as tabelas `usuarios` e `avaliacoes` automaticamente).*

### 2. Iniciando a Inteligência Artificial (FastAPI)
Abra um terminal exclusivo para a IA, treine o modelo e inicie o servidor preditor:
```bash
cd api
python -m pip install -r requirements.txt
python train_model.py
uvicorn predictive_api:app --reload --port 8000
```
*A API de Machine Learning estará pronta na porta `8000`.*

### 3. Iniciando o Servidor Central (Node.js)
Abra outro terminal, instale os pacotes e suba o backend:
```bash
cd backend
npm install
node server.js
```
*O Node.js subirá na porta `3001`.*

### 4. Iniciando o Aplicativo Frontend (React)
Abra um último terminal na pasta raiz do projeto:
```bash
npm install
npm run dev
```
*Acesse `http://localhost:5173` no seu navegador e aproveite a plataforma!*

---
**Projeto Acadêmico - MVP UNINASSAU**
