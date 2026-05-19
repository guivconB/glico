import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const API_URL = 'http://localhost:3001';

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const nome = localStorage.getItem('nome');

  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [statusIa, setStatusIa] = useState('offline');

  useEffect(() => {
    if (!nome) {
      navigate('/login');
      return;
    }
    fetchHistorico();
    checkStatusIa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, nome]);

  const checkStatusIa = async () => {
    try {
      const res = await fetch(`${API_URL}/api/status-preditor`);
      const data = await res.json();
      setStatusIa(data.status);
    } catch {
      setStatusIa('offline');
    }
  };

  const fetchHistorico = async () => {
    setLoading(true);
    setErro('');
    try {
      const response = await fetch(`${API_URL}/api/avaliacoes`, {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        setErro('Não foi possível carregar seu histórico.');
        return;
      }
      const data = await response.json();
      setHistorico(data);
    } catch {
      setErro('Erro de conexão ao carregar histórico.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.warn('Erro ao deslogar no backend:', err);
    }
    localStorage.removeItem('nome');
    navigate('/login');
  };

  // Get the latest prediction from MySQL history if exists
  const temAvaliacao = historico.length > 0;
  const ultima = temAvaliacao ? historico[0] : null;
  const ultimaPorcentagem = ultima ? Math.round(ultima.probabilidade * 100) : null;
  const ultimaClasseRisco = ultima ? (ultima.risco_predito === 1 ? 'high' : 'low') : 'medium';
  const ultimaLabelRisco = ultima ? (ultima.risco_predito === 1 ? 'Alto Risco' : 'Baixo Risco') : 'Nenhuma';

  return (
    <div className="dashboard-page-wrapper">
      <header className="dashboard-header">
        <div className="dashboard-logo">GLICO</div>
        <nav className="dashboard-nav">
          <Link to="/"           className={`nav-link ${location.pathname === '/'           ? 'active' : ''}`}>Home</Link>
          <Link to="/formulario" className={`nav-link ${location.pathname === '/formulario' ? 'active' : ''}`}>Formulário</Link>
          <Link to="/resultados" className={`nav-link ${location.pathname === '/resultados' ? 'active' : ''}`}>Resultados</Link>
          <Link to="/dashboard"  className={`nav-link ${location.pathname === '/dashboard'  ? 'active' : ''}`}>Dashboard</Link>
        </nav>
        <div className="dashboard-header-right">
          <div className="status-ia-container">
            <span className={`status-ia-dot ${statusIa === 'ativo' ? 'online' : 'offline'}`} />
            <span className="status-ia-text">
              {statusIa === 'ativo' ? 'Serviço de IA Ativo' : 'Serviço de IA em Fallback'}
            </span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="welcome-section">
          <h1>Olá, {nome} 👋</h1>
          <p>Aqui está um resumo da sua saúde e previsões recentes.</p>
        </section>

        {/* Health Cards */}
        <section className="health-cards-grid">
          <div className="glass-card health-card">
            <span className="card-title">Última Previsão</span>
            {temAvaliacao ? (
              <>
                <span className="card-value">{ultimaPorcentagem}%</span>
                <span className={`card-status status-${ultimaClasseRisco}`}>{ultimaLabelRisco}</span>
              </>
            ) : (
              <>
                <span className="card-value">—</span>
                <span className="card-status status-medium">Nenhuma</span>
              </>
            )}
          </div>

          <div className="glass-card health-card">
            <span className="card-title">Nível de Risco</span>
            {temAvaliacao ? (
              <>
                <span className="card-value">
                  {ultima?.risco_predito === 1 ? 'Atenção' : 'Estável'}
                </span>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                  Baseado na sua última consulta em {new Date(ultima.data_avaliacao).toLocaleDateString('pt-BR')}.
                </p>
              </>
            ) : (
              <>
                <span className="card-value">Pendente</span>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                  Realize sua primeira avaliação de diabetes.
                </p>
              </>
            )}
          </div>

          <div className="glass-card health-card">
            <span className="card-title">Próximo Passo</span>
            <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.5' }}>
              Responda o formulário para atualizar sua avaliação de risco de diabetes.
            </p>
            <Link to="/formulario" className="card-action-btn">Iniciar Avaliação →</Link>
          </div>
        </section>

        {/* Recent History */}
        <section className="history-section">
          <h2>Histórico Recente</h2>
          {erro && <p className="msg-erro" style={{ color: '#ffb74d' }}>{erro}</p>}
          {loading ? (
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>Carregando histórico...</p>
          ) : !temAvaliacao ? (
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 16px', color: 'rgba(255,255,255,0.8)' }}>Você ainda não realizou nenhuma avaliação de saúde.</p>
              <Link to="/formulario" className="card-action-btn" style={{ margin: '0 auto' }}>Fazer Primeira Avaliação</Link>
            </div>
          ) : (
            <div className="history-list">
              {historico.map((item) => {
                const pct = Math.round(item.probabilidade * 100);
                const statusRisco = item.risco_predito === 1 ? 'high' : 'low';
                const labelRisco = item.risco_predito === 1 ? 'Alto Risco' : 'Baixo Risco';

                return (
                  <div key={item.id} className="glass-card history-item">
                    <div className="history-info">
                      <span className="history-date">
                        {new Date(item.data_avaliacao).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className={`history-result status-${statusRisco}`} style={{ width: 'fit-content', padding: '2px 10px', borderRadius: '100px', fontSize: '14px', fontWeight: 'bold' }}>
                        {pct}% - {labelRisco}
                      </span>
                    </div>
                    <button 
                      className="history-btn" 
                      onClick={() => navigate('/resultados', { state: { prediction: { risco_predito: item.risco_predito, probabilidade: item.probabilidade } } })}
                    >
                      Ver Detalhes
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
