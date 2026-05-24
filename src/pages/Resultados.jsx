import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Resultados.css';
import { usePDF } from 'react-to-pdf';

export default function Resultados() {
  const navigate = useNavigate();
  const location = useLocation();
  // Recebe o resultado retornado pela API ou histórico via state
  const prediction = location.state?.prediction ?? null;
  
  // Extraindo as explicações do estado (se existirem)
  const explicacoes = prediction?.explicacao || [];

  // O hook já gera o targetRef e a função toPDF para você
  const { toPDF, targetRef } = usePDF({ filename: 'laudo-glico.pdf' });

  // Se não houver state (acesso direto), usamos valores padrão demonstrativos
  const percentage = prediction ? Math.round(prediction.probabilidade * 100) : 67;
  const risco = prediction ? prediction.risco_predito : 0;
  const tipoPredicao = prediction?.tipo_predicao ?? 'ML';
  
  // Pegando o nome do paciente (caso exista no estado) ou usando um genérico
  const nomePaciente = prediction?.nome ?? 'Paciente Padrão';
  // Gerando a data de hoje no formato brasileiro (DD/MM/AAAA)
  const dataHoje = new Date().toLocaleDateString('pt-BR');

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
      {/* Header da Interface (Não sai no PDF) */}
      <header className="resultados-header">
        <div className="resultados-logo">GLICO</div>
        <nav className="resultados-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/formulario">Formulário</Link>
          <Link to="/resultados" className="ativo">Resultados</Link>
        </nav>
      </header>

      <main className="resultados-main">
        
        {/* Passo 2: A ref={targetRef} vai aqui. Tudo dentro desta div será transformado em PDF */}
        <div className="resultados-card pdf-container" ref={targetRef} style={{ padding: '40px 50px', backgroundColor: '#fff', width: '100%', maxWidth: '720px', boxSizing: 'border-box', margin: '0 auto' }}>
          
          {/* Passo 3: Dica de Ouro - Cabeçalho exclusivo para o Laudo */}
          <div className="laudo-header" style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '15px', marginBottom: '25px', textAlign: 'left' }}>
            <h2 style={{ color: '#0077FF', margin: '0 0 10px 0' }}>GLICO - Laboratório Preditivo</h2>
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#555' }}><strong>Paciente:</strong> {nomePaciente}</p>
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#555' }}><strong>Data da Avaliação:</strong> {dataHoje}</p>
          </div>

          {/* Título e Mensagem */}
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

          <div className="prediction-tech-badge">
            {tipoPredicao === 'ML' ? (
              <span>Tecnologia Utilizada: <strong>Inteligência Artificial (Machine Learning)</strong> ✨</span>
            ) : (
              <span>Tecnologia Utilizada: <strong>Heurística Clínica (Modo de Fallback)</strong> ⚙️</span>
            )}
          </div>

          {/* NOVA SEÇÃO: Fatores de Maior Impacto (SHAP) */}
          {explicacoes.length > 0 && (
            <div className="impact-factors-container">
              <h3>Fatores de Maior Impacto</h3>
              <ul className="impact-factors-list">
                {explicacoes.map((texto, index) => {
                  // Opcional: Quebrar o texto em partes para colorir o valor
                  const partes = texto.split('(');
                  const titulo = partes[0];
                  const valor = partes.length > 1 ? '(' + partes[1] : '';
                  return (
                    <li key={index} className="impact-item">
                      <span className="impact-icon">⬆️</span>
                      <span className="impact-text">
                        {titulo} <strong>{valor}</strong>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <p className="resultados-disclaimer" style={{ marginTop: '20px' }}>
            <strong>LEMBRE-SE:</strong> Essa previsão é baseada em análises estatísticas estruturadas
            a partir de dados demográficos e hábitos de saúde. Ela serve apenas como referência educativa e não substitui
            o diagnóstico clínico de um médico especializado.
          </p>
        </div>

        {/* Passo 4: Botões de Ação (Ficam FORA do targetRef para não sujarem o PDF) */}
        <div className="resultados-buttons" style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button className="btn-outline" onClick={() => navigate('/formulario')}>
            Nova Avaliação
          </button>
          <button className="btn-solid" onClick={() => navigate('/dashboard')}>
            Ver Dashboard
          </button>
          
          {/* Novo botão que aciona a função de download */}
          <button 
            className="btn-solid btn-pdf" 
            onClick={() => toPDF()}
          >
            📄 Baixar Laudo Médico
          </button>
        </div>

      </main>

      <footer className="resultados-footer">2026 © Grupo 2</footer>
    </div>
  );
}