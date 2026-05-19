import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Resultados.css';

export default function Resultados() {
  const navigate = useNavigate();
  const location = useLocation();

  // Recebe o resultado retornado pela API ou histórico via state
  const prediction = location.state?.prediction ?? null;

  // Se não houver state (acesso direto), usamos valores padrão demonstrativos
  const percentage = prediction ? Math.round(prediction.probabilidade * 100) : 67;
  const risco = prediction ? prediction.risco_predito : 0;
  const tipoPredicao = prediction?.tipo_predicao ?? 'ML';

  const label = risco === 1 ? 'Alto' : 'Baixo';
  const message =
    risco === 1
      ? 'Atenção! Sua avaliação indica um alto risco de diabetes tipo 2. Recomendamos fortemente consultar um profissional de saúde para exames detalhados.'
      : 'Excelente notícia! Sua avaliação indica um baixo risco de diabetes tipo 2. Continue praticando atividade física regular e mantendo hábitos saudáveis!';

  // Gauge (arco em C)
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const gaugeLength = circumference * 0.75;
  const progressOffset = gaugeLength - (percentage / 100) * gaugeLength;

  return (
    <div className="resultados-page">
      {/* Header */}
      <header className="resultados-header">
        <div className="resultados-logo">GLICO</div>
        <nav className="resultados-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/formulario">Formulário</Link>
          <Link to="/resultados" className="ativo">Resultados</Link>
        </nav>
      </header>

      {/* Content */}
      <main className="resultados-main">
        <div className="resultados-card">
          {/* Title */}
          <h1 className="resultados-title">
            {label} risco de Diabetes Tipo 2
          </h1>
          <p className="resultados-subtitle">{message}</p>

          {/* Gauge */}
          <div className="gauge-container">
            <svg className="gauge-svg" viewBox="0 0 220 220" width="220" height="220">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="rgba(255, 84, 87, 0.98)" />
                  <stop offset="50%"  stopColor="#5E23C5" />
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

          {/* Buttons */}
          <div className="resultados-buttons">
            <button className="btn-outline" onClick={() => navigate('/formulario')}>
              Nova Avaliação
            </button>
            <button className="btn-solid" onClick={() => navigate('/dashboard')}>
              Ver Dashboard
            </button>
          </div>

          <div className="prediction-tech-badge">
            {tipoPredicao === 'ML' ? (
              <span>Tecnologia Utilizada: <strong>Inteligência Artificial (Machine Learning)</strong> ✨</span>
            ) : (
              <span>Tecnologia Utilizada: <strong>Heurística Clínica (Modo de Fallback)</strong> ⚙️</span>
            )}
          </div>

          {/* Disclaimer */}
          <p className="resultados-disclaimer">
            <strong>LEMBRE-SE:</strong> Essa previsão é baseada em análises estatísticas estruturadas
            a partir de dados demográficos e hábitos de saúde. Ela serve apenas como referência educativa e não substitui
            o diagnóstico clínico de um médico especializado.
          </p>
        </div>
      </main>

      <footer className="resultados-footer">2026 © Grupo 2</footer>
    </div>
  );
}
