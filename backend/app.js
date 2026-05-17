import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

dotenv.config();
const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || true;
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const SECRET = process.env.JWT_SECRET || 'fallback_super_secreto';
const PREDICTOR_URL = process.env.PREDICTOR_URL || 'http://localhost:5000';
const DB_FILE = process.env.DB_FILE || './data/db.json';

let dbData = {
  usuarios: [],
  avaliacoes: []
};

function loadDatabase() {
  const dbPath = path.resolve(DB_FILE);
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
  }

  try {
    const content = fs.readFileSync(dbPath, 'utf8');
    dbData = JSON.parse(content);
    dbData.usuarios = Array.isArray(dbData.usuarios) ? dbData.usuarios : [];
    dbData.avaliacoes = Array.isArray(dbData.avaliacoes) ? dbData.avaliacoes : [];
  } catch (error) {
    console.error('Erro ao carregar database local:', error);
    dbData = { usuarios: [], avaliacoes: [] };
  }
}

function saveDatabase() {
  const dbPath = path.resolve(DB_FILE);
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
}

function initializeDatabase() {
  loadDatabase();
}

function localPredict(respostas) {
  const score = Object.values(respostas).reduce((sum, value) => {
    const n = Number(value);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  const resultado = score > 300 ? 'alto risco' : 'risco moderado';
  return { resultado };
}

async function fetchPrediction(respostas) {
  if (!PREDICTOR_URL) {
    return localPredict(respostas);
  }

  try {
    const response = await fetch(`${PREDICTOR_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ respostas })
    });

    if (!response.ok) {
      console.warn('Preditor externo retornou status não OK:', response.status);
      return localPredict(respostas);
    }

    return await response.json();
  } catch (error) {
    console.warn('Falha ao chamar preditor externo, usando fallback local.', error.message || error);
    return localPredict(respostas);
  }
}

initializeDatabase();

console.log('APP RODANDO COM SECRET:', SECRET);
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from './database/db.js';

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

const SECRET = process.env.JWT_SECRET || "fallback_super_secreto";

// ======================================================
// MIDDLEWARE: Verificação de JWT
// ======================================================
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ erro: "Token não fornecido" });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded;
    next();
  } catch {
    return res.status(401).json({ erro: "Token inválido" });
  }
}

// ======================================================
// POST /api/auth/register — Cadastro de usuário
// ======================================================
app.post('/api/auth/register', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha todos os campos' });
  }
  if (senha.length < 6) {
    return res.status(400).json({ erro: "Senha deve ter no mínimo 6 caracteres" });
  }

  try {
    const [rows] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ erro: "Email já cadastrado" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
      [nome, email, senhaHash]
    );

    res.status(201).json({ mensagem: "Conta criada com sucesso" });
  } catch (err) {
    console.error("Erro no registro:", err);
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

// ======================================================
// POST /api/auth/login — Login e geração de token
// ======================================================
app.post('/api/auth/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ erro: "Usuário não encontrado" });
    }

    const usuario = rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(400).json({ erro: "Senha incorreta" });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, nome: usuario.nome },
      SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, nome: usuario.nome });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

// ================= ROTA PROTEGIDA =================
app.get('/perfil', auth, (req, res) => {
  res.json({
    mensagem: 'Acesso autorizado',
    usuario: req.usuario
  });
});

// ================= API DE AVALIAÇÕES =================
app.post('/api/avaliacoes', auth, async (req, res) => {
  const respostas = req.body.respostas || req.body;

  if (!respostas || typeof respostas !== 'object') {
    return res.status(400).json({ erro: 'Envie os dados do formulário em JSON.' });
  }

  try {
    const predictionData = await fetchPrediction(respostas);
    const resultado = predictionData.resultado || predictionData.predicao || predictionData.prediction;

    if (!resultado) {
      return res.status(502).json({ erro: 'Resposta inválida do microserviço de predição.' });
    }

    const newItem = {
      id: dbData.avaliacoes.length > 0 ? dbData.avaliacoes[dbData.avaliacoes.length - 1].id + 1 : 1,
      usuario_email: req.usuario.email,
      respostas,
      resultado,
      created_at: new Date().toISOString()
    };

    dbData.avaliacoes.push(newItem);
    saveDatabase();
    res.status(201).json(newItem);
  } catch (error) {
    console.error('POST /api/avaliacoes erro:', error);
    res.status(500).json({ erro: 'Falha ao processar a avaliação.' });
  }
});

app.get('/api/avaliacoes', auth, (req, res) => {
  try {
    const filtered = dbData.avaliacoes
      .filter(item => item.usuario_email === req.usuario.email)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(filtered);
  } catch (error) {
    console.error('GET /api/avaliacoes erro:', error);
    res.status(500).json({ erro: 'Falha ao buscar histórico de avaliações.' });
  }
});

app.get('/api/avaliacoes/:id', auth, (req, res) => {
  const { id } = req.params;

  try {
    const item = dbData.avaliacoes.find(a => a.id.toString() === id && a.usuario_email === req.usuario.email);

    if (!item) {
      return res.status(404).json({ erro: 'Avaliação não encontrada.' });
    }

    res.json(item);
  } catch (error) {
    console.error('GET /api/avaliacoes/:id erro:', error);
    res.status(500).json({ erro: 'Falha ao buscar avaliação.' });
  }
});

export default app;
