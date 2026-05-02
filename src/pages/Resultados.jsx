import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Resultados.css';

export default function Resultados() {
  const navigate = useNavigate();
  const [scale, setScale] = useState(1);

  // Gauge calculations
  const percentage = 67;
  const radius = 220;
  const circumference = 2 * Math.PI * radius;
  // We want a "C" shape, so let's say the full gauge is 75% of a circle
  const gaugeLength = circumference * 0.75; 
  const progressOffset = gaugeLength - (percentage / 100) * gaugeLength;

  useEffect(() => {
    const handleResize = () => {
      const newScale = window.innerWidth / 1920;
      setScale(newScale);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="resultados-page-wrapper">
      <div className="resultados-container" style={{ transform: `scale(${scale})` }}>
        {/* Header Bar */}
        <div className="header-bar" />
        
        <div className="logo-area">
          <span className="logo-text">GLICO</span>
        </div>

        <div className="nav-item-form">Formulário</div>
        <div className="nav-item-results">Resultados</div>
        <div className="nav-item-account">Conta</div>

        {/* Titles */}
        <div className="title-wrapper">
          <h1 className="main-title">Médio risco de Diabetes Tipo 2</h1>
          <p className="subtitle">
            Cuidado, você está entrando numa área de risco! Tome as devidas precauções.
          </p>
        </div>

        {/* Circular Progress (C-Shape Gauge) */}
        <div className="gauge-container">
          <svg className="gauge-svg" width="550" height="550" viewBox="0 0 550 550">
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 84, 87, 0.98)" />
                <stop offset="50%" stopColor="#5E23C5" />
                <stop offset="100%" stopColor="#0077FF" />
              </linearGradient>
            </defs>
            {/* Background Arc */}
            <circle
              className="gauge-bg"
              cx="275"
              cy="275"
              r={radius}
              strokeDasharray={`${gaugeLength} ${circumference}`}
            />
            {/* Progress Arc */}
            <circle
              className="gauge-progress"
              cx="275"
              cy="275"
              r={radius}
              stroke="url(#gaugeGradient)"
              strokeDasharray={`${gaugeLength} ${circumference}`}
              strokeDashoffset={progressOffset}
            />
          </svg>
          <span className="percentage-display">{percentage}%</span>
        </div>

        {/* Action Buttons */}
        <div className="button-row">
          <button className="btn-base btn-secondary" onClick={() => navigate(-1)}>
            Voltar
          </button>
          <button className="btn-base btn-primary" onClick={() => navigate('/dashboard')}>
            Nova Previsão
          </button>
        </div>

        {/* Disclaimer */}
        <div className="disclaimer-text">
          <span className="disclaimer-bold">LEMBRE-SE:</span> Essa previsão é feita através de uma máquina treinada com dados reais relacionados ao tema, então deve servir apenas como referência. Lembre-se de se consultar com um profissional da saúde para obter respostas definitivas.
        </div>

        {/* Footer */}
        <div className="footer-copy">2026 © Grupo 2</div>
      </div>
    </div>
  );
}
