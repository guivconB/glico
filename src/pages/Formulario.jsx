import React, { useState } from "react";
import "./Formulario.css";

const perguntas = [
  { tipo: "simnao", texto: "Você possui pressão alta?" },
  { tipo: "simnao", texto: "Você possui colesterol alto?" },
  { tipo: "imc", texto: "Insira seu peso e altura" },
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
  { tipo: "sexo", texto: "Qual é o seu sexo?" },
  { tipo: "idade", texto: "Quantos anos você tem?" },
];

export default function Formulario() {
  const [etapa, setEtapa] = useState(0);
  const [respostas, setRespostas] = useState({});

  const perguntaAtual = perguntas[etapa];
  const progresso = ((etapa + 1) / perguntas.length) * 100;

  const salvarResposta = (valor) => {
    setRespostas({
      ...respostas,
      [etapa]: valor,
    });
  };

  const proxima = () => {
    if (etapa < perguntas.length - 1) {
      setEtapa(etapa + 1);
    }
  };

  const anterior = () => {
    if (etapa > 0) {
      setEtapa(etapa - 1);
    }
  };

  const renderPergunta = () => {
    switch (perguntaAtual.tipo) {
      case "simnao":
        return (
          <div className="opcoes">
            <button onClick={() => salvarResposta("Sim")}>Sim</button>
            <button onClick={() => salvarResposta("Não")}>Não</button>
          </div>
        );

      case "numero":
      case "idade":
        return (
          <input
            type="number"
            placeholder="Digite aqui"
            onChange={(e) => salvarResposta(e.target.value)}
          />
        );

      case "sexo":
        return (
          <div className="opcoes">
            <button onClick={() => salvarResposta("Masculino")}>Masculino</button>
            <button onClick={() => salvarResposta("Feminino")}>Feminino</button>
          </div>
        );

      case "escala":
        return (
          <div className="escala">
            <span>Boa</span>
            {[1, 2, 3, 4, 5].map((item) => (
              <button key={item} onClick={() => salvarResposta(item)}>
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
              placeholder="Peso"
              onChange={(e) =>
                salvarResposta({
                  ...respostas[etapa],
                  peso: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Altura"
              onChange={(e) =>
                salvarResposta({
                  ...respostas[etapa],
                  altura: e.target.value,
                })
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
          <span className="ativo">Formulário</span>
          <span>Resultados</span>
          <span>Conta</span>
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
        <button onClick={anterior} disabled={etapa === 0}>
          Anterior
        </button>

        <button onClick={proxima}>
          {etapa === perguntas.length - 1 ? "Finalizar" : "Próxima"}
        </button>
      </div>
    </div>
  );
}