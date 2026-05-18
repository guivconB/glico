import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const API_URL = 'http://localhost:3001';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const [loginData, setLoginData] = useState({ email: '', senha: '' });
  const [registerData, setRegisterData] = useState({ nome: '', email: '', senha: '' });

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  const limparMensagens = () => { setErro(''); setSucesso(''); };

  const trocarAba = (paraLogin) => { setIsLogin(paraLogin); limparMensagens(); };

  // ── LOGIN ──────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    limparMensagens();
    if (!loginData.email || !loginData.senha) { setErro('Preencha todos os campos.'); return; }

    setCarregando(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();
      if (!response.ok) { setErro(data.erro || 'Erro ao fazer login.'); return; }

      localStorage.setItem('token', data.token);
      localStorage.setItem('nome', data.nome);
      navigate('/dashboard');
    } catch {
      setErro('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    } finally {
      setCarregando(false);
    }
  };

  // ── REGISTRO ───────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    limparMensagens();
    if (!registerData.nome || !registerData.email || !registerData.senha) { setErro('Preencha todos os campos.'); return; }
    if (registerData.senha.length < 6) { setErro('A senha deve ter no mínimo 6 caracteres.'); return; }

    setCarregando(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      const data = await response.json();
      if (!response.ok) { setErro(data.erro || 'Erro ao criar conta.'); return; }

      setSucesso('Conta criada! Faça login para continuar.');
      setRegisterData({ nome: '', email: '', senha: '' });
      setTimeout(() => trocarAba(true), 1500);
    } catch {
      setErro('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-logo">GLICO</h1>

      <div className="login-card">
        <div className="toggle-container">
          <button className={`toggle-btn ${isLogin ? 'active' : ''}`} onClick={() => trocarAba(true)}>Entrar</button>
          <button className={`toggle-btn ${!isLogin ? 'active' : ''}`} onClick={() => trocarAba(false)}>Registrar</button>
        </div>

        {erro && <p className="msg-erro">{erro}</p>}
        {sucesso && <p className="msg-sucesso">{sucesso}</p>}

        {isLogin ? (
          <form onSubmit={handleLogin}>
            <h2 className="welcome-text">Bem-vindo de volta!</h2>
            <div className="input-group">
              <label className="input-label">E-mail</label>
              <input type="email" className="input-field" placeholder="Insira seu e-mail"
                value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} />
            </div>
            <div className="input-group">
              <div className="label-container">
                <label className="input-label">Senha</label>
                <a href="#" className="forgot-password">Esqueceu a sua senha?</a>
              </div>
              <input type="password" className="input-field" placeholder="Insira sua senha"
                value={loginData.senha} onChange={(e) => setLoginData({ ...loginData, senha: e.target.value })} />
            </div>
            <button className="submit-btn" type="submit" disabled={carregando}>
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <h2 className="welcome-text">Crie sua conta</h2>
            <div className="input-group">
              <label className="input-label">Nome</label>
              <input type="text" className="input-field" placeholder="Insira seu nome"
                value={registerData.nome} onChange={(e) => setRegisterData({ ...registerData, nome: e.target.value })} />
            </div>
            <div className="input-group">
              <label className="input-label">E-mail</label>
              <input type="email" className="input-field" placeholder="Insira seu e-mail"
                value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} />
            </div>
            <div className="input-group">
              <label className="input-label">Senha</label>
              <input type="password" className="input-field" placeholder="Mínimo de 6 caracteres"
                value={registerData.senha} onChange={(e) => setRegisterData({ ...registerData, senha: e.target.value })} />
            </div>
            <button className="submit-btn" type="submit" disabled={carregando}>
              {carregando ? 'Criando conta...' : 'Registrar'}
            </button>
          </form>
        )}
      </div>

      <div className="footer-text">2026 © Grupo 2</div>
    </div>
  );
};

export default Login;
