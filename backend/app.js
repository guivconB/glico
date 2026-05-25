import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './database/db.js';

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Custom light cookie-parser middleware (no external dependencies)
app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie || '';
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    if (parts.length === 2) {
      req.cookies[parts[0].trim()] = parts[1].trim();
    }
  });
  next();
});

const SECRET = process.env.JWT_SECRET || "fallback_super_secreto";

// Colleague's FastAPI python server runs on port 8000
const PREDICTOR_URL = process.env.PREDICTOR_URL || 'http://localhost:8000';

// ======================================================
// HELPER: Map Age in years to CDC Age Category (1-13)
// ======================================================
function mapAgeToCategory(age) {
  const a = Number(age);
  if (!a || a < 18) return 1;
  if (a >= 18 && a <= 24) return 1;
  if (a >= 25 && a <= 29) return 2;
  if (a >= 30 && a <= 34) return 3;
  if (a >= 35 && a <= 39) return 4;
  if (a >= 40 && a <= 44) return 5;
  if (a >= 45 && a <= 49) return 6;
  if (a >= 50 && a <= 54) return 7;
  if (a >= 55 && a <= 59) return 8;
  if (a >= 60 && a <= 64) return 9;
  if (a >= 65 && a <= 69) return 10;
  if (a >= 70 && a <= 74) return 11;
  if (a >= 75 && a <= 79) return 12;
  if (a >= 80) return 13;
  return 1;
}

// ======================================================
// HELPER: Local prediction logic (fallback)
// ======================================================
function calculateLocalPrediction(features) {
  let score = 0;
  let explicacoes = [];
  if (features.high_bp) { score += 25; explicacoes.push("Pressão Alta (Alerta de Heurística Local)"); }
  if (features.high_chol) { score += 15; explicacoes.push("Colesterol Elevado (Alerta de Heurística Local)"); }
  if (features.bmi > 30) { score += 15; explicacoes.push("IMC compatível com Obesidade (Alerta de Heurística Local)"); }
  else if (features.bmi > 25) { score += 10; explicacoes.push("IMC compatível com Sobrepeso (Alerta de Heurística Local)"); }
  if (features.smoker) { score += 5; explicacoes.push("Tabagismo (Alerta de Heurística Local)"); }
  if (features.heart_disease) { score += 15; explicacoes.push("Condição Cardíaca Prévia (Alerta de Heurística Local)"); }
  if (features.stroke) { score += 10; explicacoes.push("Histórico de AVC (Alerta de Heurística Local)"); }
  if (features.heavy_alcohol) score += 5;
  
  // general health score (1 to 5)
  score += (features.gen_hlth - 1) * 8;
  if (features.gen_hlth >= 4) explicacoes.push("Saúde Geral Auto-relatada Ruim (Alerta Local)");
  
  // age category impact
  score += (features.age_category * 2.5);
  if (features.age_category >= 9) explicacoes.push("Fator de Idade Avançada (Alerta Local)");

  if (score > 100) score = 100;
  if (score < 5) score = 5;

  const probabilidade = parseFloat((score / 100).toFixed(2));
  const risco_predito = probabilidade >= 0.5 ? 1 : 0;

  let explicacaoFinal = explicacoes.slice(0, 3);
  if (explicacaoFinal.length === 0) {
    explicacaoFinal = ["Seus exames base passaram pela triagem de segurança local sem alertas críticos."];
  }

  return { risco_predito, probabilidade, explicacao: explicacaoFinal };
}

// ======================================================
// HELPER: Connect with the Python FastAPI ML Model
// ======================================================
async function fetchPrediction(payload) {
  if (!PREDICTOR_URL) {
    // Generate fallback features
    const age_category = mapAgeToCategory(payload.age);
    const height_m = payload.height_cm / 100;
    const bmi = height_m > 0 ? (payload.weight_kg / (height_m * height_m)) : 22;
    const localResult = calculateLocalPrediction({
      high_bp: payload.high_bp,
      high_chol: payload.high_chol,
      bmi,
      smoker: payload.smoker,
      phys_activity: payload.phys_activity,
      heart_disease: payload.heart_disease,
      stroke: payload.stroke,
      gen_hlth: payload.health_rating,
      age_category
    });
    return { ...localResult, tipo_predicao: 'FALLBACK', age_category };
  }

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(`${PREDICTOR_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(id);

    if (!response.ok) {
      console.warn('FastAPI preditor retornou status não OK, usando fallback local.');
      const age_category = mapAgeToCategory(payload.age);
      const height_m = payload.height_cm / 100;
      const bmi = height_m > 0 ? (payload.weight_kg / (height_m * height_m)) : 22;
      const localResult = calculateLocalPrediction({
        high_bp: payload.high_bp,
        high_chol: payload.high_chol,
        bmi,
        smoker: payload.smoker,
        phys_activity: payload.phys_activity,
        heart_disease: payload.heart_disease,
        stroke: payload.stroke,
        gen_hlth: payload.health_rating,
        age_category
      });
      return { ...localResult, tipo_predicao: 'FALLBACK', age_category };
    }

    const data = await response.json();
    // FastAPI returns:
    // { "risk_class": 0/1/2, "risk_score": 85, "probabilities": [0.85, 0.10, 0.05], "age_category": 9, ... }
    let probabilidade = 0.5;
    if (data.probabilities && data.probabilities.length >= 3) {
      // prob of pre-diabetes + diabetes
      probabilidade = parseFloat((data.probabilities[1] + data.probabilities[2]).toFixed(4));
    } else if (data.risk_score) {
      probabilidade = data.risk_score / 100;
    }

    // risco_predito is 1 if class is 1 (pre-diabetes) or 2 (diabetes), otherwise 0
    const risco_predito = data.risk_class > 0 ? 1 : 0;
    const age_category = data.age_category || mapAgeToCategory(payload.age);
    const explicacao = data.explicacao || ["Análise de fatores indisponível."];

    return { risco_predito, probabilidade, tipo_predicao: 'ML', age_category, explicacao };
  } catch (error) {
    console.warn('Falha de conexão com FastAPI preditor, usando fallback local:', error.message || error);
    const age_category = mapAgeToCategory(payload.age);
    const height_m = payload.height_cm / 100;
    const bmi = height_m > 0 ? (payload.weight_kg / (height_m * height_m)) : 22;
    const localResult = calculateLocalPrediction({
      high_bp: payload.high_bp,
      high_chol: payload.high_chol,
      bmi,
      smoker: payload.smoker,
      phys_activity: payload.phys_activity,
      heart_disease: payload.heart_disease,
      stroke: payload.stroke,
      gen_hlth: payload.health_rating,
      age_category
    });
    return { ...localResult, tipo_predicao: 'FALLBACK', age_category };
  }
}

// ======================================================
// MIDDLEWARE: Verificação de JWT
// ======================================================
function auth(req, res, next) {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ erro: "Token não fornecido ou expirado" });
  }

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
    return res.status(400).json({ erro: "Preencha todos os campos" });
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

  if (!email || !senha) {
    return res.status(400).json({ erro: "Preencha todos os campos" });
  }

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

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({ token, nome: usuario.nome });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

// ======================================================
// POST /api/auth/logout — Limpa o cookie de sessão
// ======================================================
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  res.json({ mensagem: "Deslogado com sucesso" });
});

// ======================================================
// GET /api/auth/me — Dados do usuário logado
// ======================================================
app.get('/api/auth/me', auth, (req, res) => {
  res.json({ usuario: req.usuario });
});

// ======================================================
// POST /api/avaliacoes — Registrar avaliação
// ======================================================
app.post('/api/avaliacoes', auth, async (req, res) => {
  const respostas = req.body.respostas;

  if (!respostas || typeof respostas !== 'object') {
    return res.status(400).json({ erro: "Envie as respostas no formato correto" });
  }

  try {
    // Convert boolean answers to true/false for the FastAPI predictor
    const high_bp = respostas['0'] === 'Sim';
    const high_chol = respostas['1'] === 'Sim';

    const peso = Number(respostas['2']?.peso || 0);
    const alturaCm = Number(respostas['2']?.altura || 0);

    const smoker = respostas['3'] === 'Sim';
    const phys_activity = respostas['4'] === 'Sim';
    const heart_disease = respostas['5'] === 'Sim';
    const stroke = respostas['6'] === 'Sim';
    const gen_hlth = Number(respostas['7'] || 3);
    const ment_hlth = Number(respostas['8'] || 0);
    const phys_hlth = Number(respostas['9'] || 0);
    const heavy_alcohol = respostas['10'] === 'Sim';
    const fruits = respostas['11'] === 'Sim';
    const veggies = respostas['12'] === 'Sim';
    const sex = respostas['13'] || 'Masculino';
    const age = Number(respostas['14'] || 18);

    // Server-side validation to prevent corrupt data entry or FastAPI 422 crash
    if (
      isNaN(gen_hlth) || gen_hlth < 1 || gen_hlth > 5 || !Number.isInteger(gen_hlth) ||
      isNaN(ment_hlth) || ment_hlth < 0 || ment_hlth > 30 || !Number.isInteger(ment_hlth) ||
      isNaN(phys_hlth) || phys_hlth < 0 || phys_hlth > 30 || !Number.isInteger(phys_hlth) ||
      isNaN(age) || age < 0 || age > 120 || !Number.isInteger(age) ||
      isNaN(peso) || peso <= 0 || peso > 500 ||
      isNaN(alturaCm) || alturaCm <= 0 || alturaCm > 300
    ) {
      return res.status(400).json({ erro: "Valores de entrada inválidos ou fora dos limites permitidos." });
    }

    // Build the request body for FastAPI
    const payload = {
      high_bp,
      high_chol,
      weight_kg: peso,
      height_cm: alturaCm,
      smoker,
      phys_activity,
      heart_disease,
      stroke,
      health_rating: gen_hlth,
      mental_unhealthy_days: ment_hlth,
      physical_unhealthy_days: phys_hlth,
      heavy_alcohol_consumption: heavy_alcohol,
      fruits,
      veggies,
      sex,
      age
    };

    // 2. Fetch ML prediction from Python FastAPI
const { risco_predito, probabilidade, tipo_predicao, age_category, explicacao } = await fetchPrediction(payload);
    // Recalculate BMI for local SQL storage
    const alturaM = alturaCm / 100;
    const bmi = alturaM > 0 ? parseFloat((peso / (alturaM * alturaM)).toFixed(2)) : 0;

    // 3. Save to MySQL database
    await pool.query(`
      INSERT INTO avaliacoes (
        usuario_id, high_bp, high_chol, bmi, smoker, phys_activity,
        heart_disease, stroke, gen_hlth, ment_hlth, phys_hlth,
        heavy_alcohol, fruits, veggies, sex, age_category,
        risco_predito, probabilidade, tipo_predicao, explicacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.usuario.id,
      high_bp ? 1 : 0,
      high_chol ? 1 : 0,
      bmi,
      smoker ? 1 : 0,
      phys_activity ? 1 : 0,
      heart_disease ? 1 : 0,
      stroke ? 1 : 0,
      gen_hlth,
      ment_hlth,
      phys_hlth,
      heavy_alcohol ? 1 : 0,
      fruits ? 1 : 0,
      veggies ? 1 : 0,
      sex === 'Masculino' ? 1 : 0,
      age_category,
      risco_predito,
      probabilidade,
      tipo_predicao,
      JSON.stringify(explicacao)
    ]);

    res.status(201).json({
      mensagem: "Avaliação registrada com sucesso!",
      risco_predito,
      probabilidade,
      tipo_predicao,
      explicacao // <-- ENVIANDO PARA O REACT AQUI
    });
  } catch (err) {
    console.error("Erro ao registrar avaliação:", err);
    res.status(500).json({ erro: "Erro ao processar e salvar a avaliação no banco de dados." });
  }
});

// ======================================================
// GET /api/avaliacoes — Histórico de avaliações do usuário
// ======================================================
app.get('/api/avaliacoes', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM avaliacoes WHERE usuario_id = ? ORDER BY data_avaliacao DESC',
      [req.usuario.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar histórico:", err);
    res.status(500).json({ erro: "Erro ao buscar histórico do banco de dados." });
  }
});
// ======================================================
// GET /api/avaliacoes/historico — Dados para o Gráfico (Ordem Crescente)
// ======================================================
app.get('/api/avaliacoes/historico', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM avaliacoes WHERE usuario_id = ? ORDER BY data_avaliacao ASC LIMIT 10',
      [req.usuario.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar histórico para o gráfico:", err);
    res.status(500).json({ erro: "Erro ao buscar histórico do gráfico no banco de dados." });
  }
});

// ======================================================
// GET /api/avaliacoes/:id — Detalhe de uma avaliação específica
// ======================================================
app.get('/api/avaliacoes/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM avaliacoes WHERE id = ? AND usuario_id = ?',
      [id, req.usuario.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ erro: "Avaliação não encontrada." });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao obter avaliação:", err);
    res.status(500).json({ erro: "Erro ao buscar detalhes da avaliação." });
  }
});

// ======================================================
// GET /api/status-preditor — Checa se a API de IA está ativa
// ======================================================
app.get('/api/status-preditor', async (req, res) => {
  if (!PREDICTOR_URL) {
    return res.json({ status: 'offline' });
  }
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1500); // 1.5s timeout for fast response
    const response = await fetch(PREDICTOR_URL, { signal: controller.signal });
    clearTimeout(id);
    if (response.ok) {
      return res.json({ status: 'ativo' });
    }
    return res.json({ status: 'offline' });
  } catch (err) {
    console.error("Erro na checagem de status da IA:", err);
    return res.json({ status: 'offline' });
  }
});

export default app;
