import React from 'react';
import './Login.css';

const Login = () => {
  return (
    <div className="login-container">
      {/* O título acima do card pode vir aqui */}
      <h1 className="login-logo">GLICO</h1>

      <div className="login-card">
        {/* Toggle Container (Entrar / Registrar) - 20% do trabalho feito! */}
        <div className="toggle-container">
          <button className="toggle-btn active">Entrar</button>
          <button className="toggle-btn">Registrar</button>
        </div>

        {/* Dica para os colegas: Façam o formulário aqui! */}
        <div className="login-content-placeholder">
          <p>O formulário de e-mail e senha entra aqui... Bom trabalho colegas!</p>
        </div>
      </div>
      
      <div className="footer-text">
        2026 © Grupo 2
      </div>
    </div>
  );
};

export default Login;
