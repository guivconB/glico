import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Formulario.css";

const API_URL = 'http://localhost:3001';

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
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [statusIa, setStatusIa] = useState('offline');
  const nome = localStorage.getItem('nome');

  useEffect(() => {
    if (!nome) {
      navigate('/login');
      return;
    }
    checkStatusIa();
  }, [navigate, nome]);

  const checkStatusIa = async () => {
    try {
      const res = await fetch(`${API_URL}/api/status-preditor`);
      const data = await res.json();
      setStatusIa(data.status);
    } catch {
      setStatusIa('offline');
    }
  };

  const perguntaAtual = perguntas[etapa];
  const progresso = ((etapa + 1) / perguntas.length) * 100;

  const salvarResposta = (valor) => {
    setRespostas({ ...respostas, [etapa]: valor });
    setErro('');
  };

  const proxima = async () => {
    // Validação básica do formulário antes de ir para a próxima etapa
    const respostaAtual = respostas[etapa];
    if (respostaAtual === undefined || respostaAtual === null || respostaAtual === '') {
      setErro('Por favor, preencha ou selecione uma resposta antes de continuar.');
      return;
    }
    if (perguntaAtual.tipo === 'imc') {
      if (!respostaAtual.peso || !respostaAtual.altura) {
        setErro('Por favor, insira o peso e a altura.');
        return;
      }
      const peso = Number(respostaAtual.peso);
      const altura = Number(respostaAtual.altura);
      if (isNaN(peso) || peso <= 0 || peso > 500) {
        setErro('Por favor, insira um peso válido (ex: entre 1 e 500 kg).');
        return;
      }
      if (isNaN(altura) || altura <= 0 || altura > 300) {
        setErro('Por favor, insira uma altura válida em centímetros (ex: entre 30 e 300 cm).');
        return;
      }
    }

    if (perguntaAtual.tipo === 'numero') {
      const val = Number(respostaAtual);
      if (isNaN(val) || !Number.isInteger(val) || val < 0 || val > 30) {
        setErro('Por favor, insira um número inteiro de dias entre 0 e 30.');
        return;
      }
    }

    if (perguntaAtual.tipo === 'idade') {
      const val = Number(respostaAtual);
      if (isNaN(val) || !Number.isInteger(val) || val < 0 || val > 120) {
        setErro('Por favor, insira uma idade inteira válida entre 0 e 120 anos.');
        return;
      }
    }

    setErro('');

    if (etapa < perguntas.length - 1) {
      setEtapa(etapa + 1);
    } else {
      // Enviar para o Node.js Backend no último passo para salvar no MySQL
      setCarregando(true);
      try {
        const response = await fetch(`${API_URL}/api/avaliacoes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ respostas }),
          credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) {
          setErro(data.erro || "Falha ao processar avaliação. Tente novamente.");
          return;
        }
        // Navega para resultados passando o objeto retornado do MySQL
        navigate("/resultados", { state: { prediction: data } });
      } catch {
        setErro("Não foi possível conectar ao servidor. Verifique sua conexão.");
      } finally {
        setCarregando(false);
      }
    }
  };

  const anterior = () => {
    if (etapa > 0) {
      setEtapa(etapa - 1);
      setErro('');
    }
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
        <div className="topo-right">
          <nav>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/formulario" className="ativo">Formulário</Link>
            <Link to="/resultados">Resultados</Link>
          </nav>
          <div className="status-ia-container">
            <span className={`status-ia-dot ${statusIa === 'ativo' ? 'online' : 'offline'}`} />
            <span className="status-ia-text">
              {statusIa === 'ativo' ? 'Serviço de IA Ativo' : 'Serviço de IA em Fallback'}
            </span>
          </div>
        </div>
      </header>

      <div className="barra-container">
        <div className="barra" style={{ width: `${progresso}%` }} />
      </div>

      <p className="contador">
        {etapa + 1} de {perguntas.length}
      </p>

      <div key={etapa} className="pergunta-box animate-fade-in">
        <p className="questao">Questão {etapa + 1}</p>
        <h2>{perguntaAtual.texto}</h2>
        {renderPergunta()}
        {erro && <p style={{ color: '#ffb74d', marginTop: '24px', fontWeight: '500' }}>{erro}</p>}
      </div>

      <div className="botoes-nav">
        <button onClick={anterior} disabled={etapa === 0 || carregando}>
          Anterior
        </button>
        <button onClick={proxima} disabled={carregando}>
          {carregando ? 'Processando...' : (etapa === perguntas.length - 1 ? "Ver Resultado" : "Próxima")}
        </button>
      </div>
    </div>
  );
}