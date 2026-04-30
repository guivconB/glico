import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const app = express();

app.use(express.json());

const SECRET = process.env.JWT_SECRET || "fallback_super_secreto";
console.log("APP RODANDO COM SECRET:", SECRET);

// "banco" temporário
let usuarios = [];

// ================= REGISTRO =================
app.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Preencha todos os campos" });
  }

  if (senha.length < 6) {
    return res.status(400).json({
      erro: "Senha deve ter no mínimo 6 caracteres"
    });
  }

  const existe = usuarios.find(u => u.email === email);

  if (existe) {
    return res.status(400).json({ erro: "Email já cadastrado" });
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  usuarios.push({
    nome,
    email,
    senha: senhaHash
  });

  res.status(201).json({ mensagem: "Conta criada com sucesso" });
});

// ================= LOGIN =================
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  const usuario = usuarios.find(u => u.email === email);

  if (!usuario) {
    return res.status(400).json({ erro: "Usuário não encontrado" });
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);

  if (!senhaValida) {
    return res.status(400).json({ erro: "Senha incorreta" });
  }

  const token = jwt.sign(
    { email: usuario.email },
    SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
});

// ================= VERIFICAÇÂO =================
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

// ================= ROTA PROTEGIDA =================
app.get('/perfil', auth, (req, res) => {
  res.json({
    mensagem: "Acesso autorizado",
    usuario: req.usuario
  });
});

export default app;