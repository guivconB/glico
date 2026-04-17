# Glico 🩸

Um projeto desenvolvido para análise, predição e monitoramento de níveis de glicose. O sistema é composto por uma aplicação web de interface moderna (Frontend), uma API (Backend) e uma integração com modelos de Machine Learning.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React, Vite, React Router DOM
- **Backend:** Node.js, Express, Dotenv
- **Dados / Machine Learning:** Python, Jupyter Notebook, Scikit-learn (incluindo o uso de arquivo `.pkl` para normalização de dados)

## 📂 Estrutura do Projeto

- **/src** e **/public**: Interface de usuário em React. Inclui uma página inicial de introdução e um painel completo (Dashboard).
- **/backend**: API em Node/Express responsável por receber dados, processar regras de negócio e conectar as requisições.
- **Glico (2).ipynb** e **scaler_glico.pkl**: Arquivos da camada de ciência de dados contendo dados analíticos e treinamento do modelo de precisão.

## 🚀 Como Executar e Testar Localmente

### 1. Iniciando o Frontend (React + Vite)
Na raiz do projeto, instale as dependências e inicie o servidor local:
```bash
npm install
npm run dev
```

### 2. Iniciando o Backend (Node.js)
Abra outro terminal, navegue até a pasta `backend`, instale suas dependências e inicie a API:
```bash
cd backend
npm install
npm start
```
*(Certifique-se de configurar um arquivo `.env` na pasta do backend com a variável `PORT` adequada, caso necessário).*
