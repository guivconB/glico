import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Formulario.css";

const API_URL = 'http://localhost:8000';

const perguntas = [
  { tipo: "simnao", texto: "Você possui pressão alta?" },
  { tipo: "simnao", texto: "Você possui colesterol alto?" },
  { tipo: "imc",    texto: "Insira seu peso e altura" },
  { tipo: "simnao", texto: "Você fuma?" },
  { tipo: "simnao", texto: "Pratica atividade física regularmente?" },
  { tipo: "simnao", texto: "Já teve algum problema cardíaco ou ataque cardíaco?" },
  { tipo: "simnao", texto: "Você já teve um AVC?" },
  { tipo: "escala", texto: "Como você avalia a sua saúde?" },
  { tipo: "numero", texto: "Quantos dias no mês sua saúde mental não foi boa?" },
  { tipo: "numero", texto: "Quantos dias no mês sua saúde física não foi boa?" },
  { tipo: "simnao", texto: "Você consome bebida alcoólica com frequência?" },
  { tipo: "simnao", texto: "Você consome frutas com frequência?" },
  { tipo: "simnao", texto: "Você consome vegetais com frequência?" },
  { tipo: "sexo",   texto: "Qual é o seu sexo?" },
  { tipo: "idade",  texto: "Quantos anos você tem?" },
];

export default function Formulario() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const perguntaAtual = perguntas[etapa];
  const progresso = ((etapa + 1) / perguntas.length) * 100;

  const toBoolean = (valor) => valor === 'Sim' || valor === true;

  const mapAgeToCategory = (age) => {
    const idade = Number(age);
    if (idade <= 24) return 1;
    if (idade <= 29) return 2;
    if (idade <= 34) return 3;
    if (idade <= 39) return 4;
    if (idade <= 44) return 5;
    if (idade <= 49) return 6;
    if (idade <= 54) return 7;
    if (idade <= 59) return 8;
    if (idade <= 64) return 9;
    if (idade <= 69) return 10;
    if (idade <= 74) return 11;
    if (idade <= 79) return 12;
    return 13;
  };

  const buildRequestBody = () => {
    const imc = respostas[2] ?? {};
    const peso = parseFloat(imc.peso) || 0;
    const altura = parseFloat(imc.altura) || 0;
    const alturaM = altura / 100;
    const bmi = alturaM > 0 ? Number((peso / (alturaM * alturaM)).toFixed(1)) : 0;

    return {
      high_bp: toBoolean(respostas[0]),
      high_chol: toBoolean(respostas[1]),
      weight_kg: peso,
      height_cm: altura,
      smoker: toBoolean(respostas[3]),
      phys_activity: toBoolean(respostas[4]),
      heart_disease: toBoolean(respostas[5]),
      stroke: toBoolean(respostas[6]),
      health_rating: Number(respostas[7]) || 3,
      mental_unhealthy_days: Number(respostas[8]) || 0,
      physical_unhealthy_days: Number(respostas[9]) || 0,
      heavy_alcohol_consumption: toBoolean(respostas[10]),
      fruits: toBoolean(respostas[11]),
      veggies: toBoolean(respostas[12]),
      sex: respostas[13] || 'Masculino',
      age: Number(respostas[14]) || 18,
    };
  };

  const enviarFormulario = async () => {
    setLoading(true);
    setError('');

    try {
      const body = buildRequestBody();
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Erro ao gerar previsão');
      }

      navigate('/resultados', { state: { respostas, prediction: data } });
    } catch (err) {
      setError(err.message || 'Erro na comunicação com a API preditiva');
    } finally {
      setLoading(false);
    }
  };

  const salvarResposta = (valor) => {
    setRespostas({ ...respostas, [etapa]: valor });
  };

  const proxima = () => {
    if (etapa < perguntas.length - 1) {
      setEtapa(etapa + 1);
    } else {
      enviarFormulario();
    }
  };

  const anterior = () => {
    if (etapa > 0) setEtapa(etapa - 1);
  };

  const respostaAtual = respostas[etapa];

  const renderPergunta = () => {
    switch (perguntaAtual.tipo) {
      case "simnao":
        return (
          <div className="opcoes">
            {["Sim", "Não"].map((op) => (
              <button
                key={op}
                className={respostaAtual === op ? "selecionado" : ""}
                onClick={() => salvarResposta(op)}
              >
                {op}
              </button>
            ))}
          </div>
        );

      case "sexo":
        return (
          <div className="opcoes">
            {["Masculino", "Feminino"].map((op) => (
              <button
                key={op}
                className={respostaAtual === op ? "selecionado" : ""}
                onClick={() => salvarResposta(op)}
              >
                {op}
              </button>
            ))}
          </div>
        );

      case "numero":
      case "idade":
        return (
          <input
            type="number"
            placeholder={perguntaAtual.tipo === "idade" ? "Ex: 35" : "Ex: 5"}
            min={0}
            max={perguntaAtual.tipo === "numero" ? 30 : 120}
            value={respostaAtual ?? ""}
            onChange={(e) => salvarResposta(e.target.value)}
          />
        );

      case "escala":
        return (
          <div className="escala">
            <span>Excelente</span>
            {[1, 2, 3, 4, 5].map((item) => (
              <button
                key={item}
                className={respostaAtual === item ? "selecionado" : ""}
                onClick={() => salvarResposta(item)}
              >
                {item}
              </button>
            ))}
            <span>Ruim</span>
          </div>
        );

      case "imc":
        return (
          <div className="imc-box">
            <input
              type="number"
              placeholder="Peso (kg)"
              min={1}
              value={respostaAtual?.peso ?? ""}
              onChange={(e) =>
                salvarResposta({ ...respostaAtual, peso: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Altura (cm)"
              min={1}
              value={respostaAtual?.altura ?? ""}
              onChange={(e) =>
                salvarResposta({ ...respostaAtual, altura: e.target.value })
              }
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="formulario-page">
      <header className="topo">
        <div className="logo">GLICO</div>
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/formulario" className="ativo">Formulário</Link>
          <Link to="/resultados">Resultados</Link>
        </nav>
      </header>

      <div className="barra-container">
        <div className="barra" style={{ width: `${progresso}%` }} />
      </div>

      <p className="contador">
        {etapa + 1} de {perguntas.length}
      </p>

      <div className="pergunta-box">
        <p className="questao">Questão {etapa + 1}</p>
        <h2>{perguntaAtual.texto}</h2>
        {renderPergunta()}
      </div>

      <div className="botoes-nav">
        <button onClick={anterior} disabled={etapa === 0 || loading}>
          Anterior
        </button>
        <button onClick={proxima} disabled={loading}>
          {loading ? 'Enviando...' : etapa === perguntas.length - 1 ? 'Ver Resultado' : 'Próxima'}
        </button>
      </div>
      {error && <p className="formulario-erro">{error}</p>}
    </div>
  );
}