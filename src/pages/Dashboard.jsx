import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Dashboard() {
  const navigate = useNavigate();
  const [idade, setIdade] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [acucar, setAcucar] = useState('');
  const [pressao, setPressao] = useState('');
  const [resultado, setResultado] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetchHistorico();
  }, [navigate, token]);

  const fetchHistorico = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/avaliacoes`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        setMessage('Não foi possível carregar o histórico.');
        return;
      }

      const data = await response.json();
      setHistorico(data);
    } catch {
      setMessage('Erro ao buscar histórico.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setResultado(null);

    const respostas = {
      idade: Number(idade),
      peso: Number(peso),
      altura: Number(altura),
      acucar: Number(acucar),
      pressao: Number(pressao)
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/avaliacoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ respostas })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.erro || 'Erro ao enviar avaliação.');
        return;
      }

      setResultado(data.resultado);
      setMessage('Avaliação realizada com sucesso.');
      fetchHistorico();
    } catch {
      setMessage('Falha de conexão com a API.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Gantari, sans-serif', maxWidth: '940px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Dashboard</h1>
          <p>Envie o formulário e receba a avaliação preditiva.</p>
        </div>
        <button onClick={handleLogout} style={{ padding: '10px 18px', background: '#1f2937', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Sair
        </button>
      </header>

      <section style={{ marginBottom: '32px', padding: '24px', background: '#fff', borderRadius: '20px', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}>
        <h2>Formulário de Avaliação</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px', marginTop: '20px' }}>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            Idade
            <input type="number" value={idade} onChange={(e) => setIdade(e.target.value)} required />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            Peso (kg)
            <input type="number" value={peso} onChange={(e) => setPeso(e.target.value)} required />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            Altura (cm)
            <input type="number" value={altura} onChange={(e) => setAltura(e.target.value)} required />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            Nível de açúcar
            <input type="number" value={acucar} onChange={(e) => setAcucar(e.target.value)} required />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            Pressão arterial
            <input type="number" value={pressao} onChange={(e) => setPressao(e.target.value)} required />
          </label>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
            <button type="submit" disabled={loading} style={{ padding: '12px 22px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
              {loading ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
            {message && <span style={{ color: '#111', fontWeight: '600' }}>{message}</span>}
          </div>
        </form>

        {resultado && (
          <div style={{ marginTop: '20px', padding: '18px', background: '#f8fafc', borderRadius: '16px' }}>
            <strong>Resultado da predição:</strong>
            <p>{resultado}</p>
          </div>
        )}
      </section>

      <section style={{ padding: '24px', background: '#fff', borderRadius: '20px', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}>
        <h2>Histórico de Avaliações</h2>
        {historico.length === 0 ? (
          <p style={{ marginTop: '18px' }}>Nenhuma avaliação registrada ainda.</p>
        ) : (
          <div style={{ marginTop: '18px', display: 'grid', gap: '16px' }}>
            {historico.map((item) => (
              <div key={item.id} style={{ padding: '18px', border: '1px solid #e5e7eb', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong>#{item.id}</strong>
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                </div>
                <div style={{ color: '#4b5563' }}>
                  <p><strong>Resultado:</strong> {item.resultado}</p>
                  <p><strong>Respostas:</strong> {JSON.stringify(item.respostas)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
