import React from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '20px',
      color: '#FFFFFF', /* Dark theme fallback content, can change later */
    }}>
      <h1 style={{ fontSize: '3rem', fontFamily: 'Gantari' }}>Dashboard</h1>
      <p style={{ fontSize: '1.2rem', fontFamily: 'Gantari' }}>Esta é a sua nova tela em funcionamento!</p>
      
      <Link 
        to="/" 
        style={{
          padding: '12px 30px',
          background: '#0077FF',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '300px',
          marginTop: '20px',
          fontFamily: 'Gantari',
          fontWeight: 'bold'
        }}
      >
        Voltar para a Intro
      </Link>
    </div>
  );
}
