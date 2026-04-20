import React from 'react';
import './Login.css';

const Login = () => {
  return (
    <div className="login-container">
      {/* O título acima do card pode vir aqui */}
      <h1 className="login-logo">GLICO</h1>

      <div className="login-card">
        {/* Toggle Container (Entrar / Registrar) */}
        <div className="toggle-container">
          <button className="toggle-btn active">Entrar</button>
          <button className="toggle-btn">Registrar</button>
        </div>

        {/* --- 50% do Trabalho (E-mail e Boas Vindas) --- */}
        <h2 className="welcome-text">Bem-vindo de volta!</h2>

        <div className="input-group">
          <label className="input-label">E-mail</label>
          <input 
            type="email" 
            className="input-field" 
            placeholder="Insira seu e-mail" 
          />
        </div>

        {/* --- O resto do formulário (Senha e Submit) --- */}
        <div className="input-group">
          <div className="label-container">
            <label className="input-label">Senha</label>
            <a href="#" className="forgot-password">Esqueceu a sua senha?</a>
          </div>
          <input 
            type="password" 
            className="input-field" 
            placeholder="insira sua senha" 
          />
        </div>

        <button className="submit-btn">Entrar</button>
      </div>
      
      <div className="footer-text">
        2026 © Grupo 2
      </div>
    </div>
  );
};

export default Login;
