import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

app.post('/predict', (req, res) => {
  const respostas = req.body.respostas || req.body;
  const score = Object.values(respostas).reduce((sum, value) => {
    const n = Number(value);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  const resultado = score > 300 ? 'alto risco' : 'risco moderado';
  res.json({ resultado });
});

const port = process.env.PREDICTOR_PORT || 5000;
app.listen(port, () => {
  console.log(`Mock predictor rodando em http://localhost:${port}`);
});
