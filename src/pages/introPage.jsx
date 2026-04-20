import React from 'react';
import { useNavigate } from 'react-router-dom';
import './introPage.css';

export default function IntroPage() {
  const navigate = useNavigate();

  const scrollToMission = () => {
    document.getElementById('mission-section').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div className="intro-container" /> {/* Fundo Fixo */}
      <div className="intro-scroll-area">
        {/* Sessão 1: Hero */}
        <div className="intro-section">
          <h1 className="intro-title">GLICO</h1>
          <p className="intro-subtitle">Uma plataforma que te auxilia na prevenção da Diabetes</p>
          
          <button className="scroll-arrow" onClick={scrollToMission}>
            <span>Deslize ou clique</span>
            <span>▼</span>
          </button>
        </div>

        {/* Sessão 2: Missão */}
        <div id="mission-section" className="intro-section" style={{ padding: '40px', boxSizing: 'border-box' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: '700', marginBottom: '40px', letterSpacing: '0.1em', color: '#FFF' }}>
            NOSSA MISSÃO
          </h1>
          
          <div style={{
            maxWidth: '800px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '40px',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            lineHeight: '1.6',
            color: '#FFF',
            marginBottom: '40px'
          }}>
            <p style={{ fontSize: '1.4rem', fontWeight: '400', marginBottom: '20px' }}>
              O projeto <strong>GLICO</strong> nasceu com o objetivo de transformar a forma como as pessoas interagem com a sua própria saúde. Acreditamos que a prevenção é o caminho mais eficaz para o combate à Diabetes.
            </p>
            <p style={{ fontSize: '1.4rem', fontWeight: '400' }}>
              Nossa plataforma utiliza análise preditiva e inteligência de dados para oferecer uma visão proativa e acessível. Queremos capacitar indivíduos com conhecimento e ferramentas para que possam tomar decisões melhores!
            </p>
          </div>

          <button className="intro-button" onClick={() => navigate('/login')}>
            Acessar Plataforma
          </button>

          <footer className="intro-footer" style={{ position: 'absolute', bottom: '2.5rem' }}>
            2026 © Grupo 2
          </footer>
        </div>
      </div>
    </>
  );
}