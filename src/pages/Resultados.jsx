import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Resultados.css';

export default function Resultados() {
  const navigate = useNavigate();
  const location = useLocation();

  const prediction = location.state?.prediction ?? null;

  const percentage = prediction ? prediction.risk_score : 0;
  const label = prediction ? prediction.risk_label : 'Sem resultado';
  const message = prediction
    ? prediction.risk_label === 'Diabetes'
      ? 'Atenção! Você está em alto risco. Consulte um médico.'
      : prediction.risk_label === 'Pré-diabetes'
      ? 'Cuidado, você está entrando numa área de risco! Tome as devidas precauções.'
      : 'Boa notícia! Seu risco está baixo. Continue com os bons hábitos.'
    : 'Complete o formulário para ver a previsão.';

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

          {/* Disclaimer */}
          <p className="resultados-disclaimer">
            <strong>LEMBRE-SE:</strong> Essa previsão é feita através de um modelo treinado com
            dados reais. Serve apenas como referência — consulte sempre um profissional de saúde.
          </p>
          {prediction && (
            <div className="prediction-details">
              <p>Classe prevista: <strong>{prediction.risk_label}</strong></p>
              <p>Probabilidades: {prediction.probabilities.join(', ')}</p>
            </div>
          )}
        </div>
      </main>

      <footer className="resultados-footer">2026 © Grupo 2</footer>
    </div>
  );
}
