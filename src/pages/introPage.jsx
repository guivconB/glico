import React from 'react';
import { useNavigate } from 'react-router-dom';
import './introPage.css';

export default function IntroPage() {
  const navigate = useNavigate();

  return (
    <div className="intro-container">
      <div className="intro-content">
        <h1 className="intro-title">GLICO</h1>
        <p className="intro-subtitle">Uma plataforma que te auxilia na prevenção da Diabetes</p>
        <button className="intro-button" onClick={() => navigate('/dashboard')}>
          Começar
        </button>
      </div>
      <footer className="intro-footer">
        2026 © Grupo 2
      </footer>
    </div>
  );
}