import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Resultados.css';
import { usePDF } from 'react-to-pdf';

export default function Resultados() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const prediction = location.state?.prediction ?? null;
  const explicacoes = prediction?.explicacao || [];

  const { toPDF, targetRef } = usePDF({ filename: 'laudo-glico.pdf' });

  const percentage = prediction ? Math.round(prediction.probabilidade * 100) : 67;
  const risco = prediction ? prediction.risco_predito : 0;
  const tipoPredicao = prediction?.tipo_predicao ?? 'ML';
  
  const nomePaciente = prediction?.nome ?? 'Paciente Padrão';
  const dataHoje = new Date().toLocaleDateString('pt-BR');

  const label = risco === 1 ? 'Alto' : 'Baixo';
  const message = risco === 1
      ? 'Atenção! Sua avaliação indica um alto risco de diabetes tipo 2. Recomendamos fortemente consultar um profissional de saúde para exames detalhados.'
      : 'Excelente notícia! Sua avaliação indica um baixo risco de diabetes tipo 2. Continue praticando atividade física regular e mantendo hábitos saudáveis!';

  // Configurações do Gauge
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const gaugeLength = circumference * 0.75;
  const progressOffset = gaugeLength - (percentage / 100) * gaugeLength;

  return (
    <div className="resultados-page">
      <header className="resultados-header">
        <div className="resultados-logo">GLICO</div>
        <nav className="resultados-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/formulario">Formulário</Link>
        </nav>
      </header>

      <main className="resultados-main">
        
        {/* Container do PDF */}
        <div className="resultados-card pdf-container" ref={targetRef}>
          
          <div className="laudo-header">
            <h2>GLICO - Análise Preditiva de Dados</h2>
            <p><strong>Usuário(a):</strong> {nomePaciente}</p>
            <p><strong>Data da Consulta ao Sistema:</strong> {dataHoje}</p>
          </div>

          <div className="resultados-body">
            {/* Coluna Esquerda: Visual (Gauge e Título) */}
            <div className="resultados-visual">
              <h1 className="resultados-title">
                {label} risco de Diabetes Tipo 2
              </h1>
              
              <div className="gauge-container">
                <svg className="gauge-svg" viewBox="0 0 220 220" width="220" height="220">
                  <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255, 84, 87, 0.98)" />
                      <stop offset="50%" stopColor="#5E23C5" />
                      <stop offset="100%" stopColor="#0077FF" />
                    </linearGradient>
                  </defs>
                  <circle
                    className="gauge-bg"
                    cx="110" cy="110" r={radius}
                    strokeDasharray={`${gaugeLength} ${circumference}`}
                  />
                  <circle
                    className="gauge-progress"
                    cx="110" cy="110" r={radius}
                    stroke="url(#gaugeGradient)"
                    strokeDasharray={`${gaugeLength} ${circumference}`}
                    strokeDashoffset={progressOffset}
                  />
                </svg>
                <span className="gauge-percentage">{percentage}%</span>
              </div>

              <div className="prediction-tech-badge">
                {tipoPredicao === 'ML' ? (
                  <span>Tecnologia Utilizada: <strong>Inteligência Artificial</strong> ✨</span>
                ) : (
                  <span>Tecnologia Utilizada: <strong>Heurística Clínica</strong> ⚙️</span>
                )}
              </div>
            </div>

            {/* Coluna Direita: Informações e Fatores de Impacto */}
            <div className="resultados-info">
              <p className="resultados-subtitle">{message}</p>

              {explicacoes.length > 0 && (
                <div className="impact-factors-container">
                  <h3>Fatores de Maior Impacto</h3>
                  <ul className="impact-factors-list">
                    {explicacoes.map((texto, index) => {
                      const partes = texto.split('(');
                      const titulo = partes[0];
                      const valor = partes.length > 1 ? '(' + partes[1] : '';
                      return (
                        <li key={index} className="impact-item">
                          <span className="impact-icon">⬆️</span>
                          <span className="impact-text">
                            {titulo} <strong>{valor}</strong>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <p className="resultados-disclaimer">
            <strong>LEMBRE-SE:</strong> Essa previsão é baseada em análises estatísticas estruturadas
            a partir de dados demográficos e hábitos de saúde. Ela serve apenas como referência educativa e não substitui
            o diagnóstico clínico de um médico especializado.
          </p>
        </div>

        {/* Botões de Ação (Fora do PDF) */}
        <div className="resultados-buttons">
          <button className="btn-outline" onClick={() => navigate('/formulario')}>
            Nova Avaliação
          </button>
          <button className="btn-solid" onClick={() => navigate('/dashboard')}>
            Ver Dashboard
          </button>
          <button className="btn-solid btn-pdf" onClick={() => toPDF()}>
            📄 Baixar Relatório de Risco
          </button>
        </div>

      </main>

      <footer className="resultados-footer">2026 © Grupo 2</footer>
    </div>
  );
}