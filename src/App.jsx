import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IntroPage from './pages/introPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login'; // <--- Importado a nova tela

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/login" element={<Login />} /> {/* <--- Nova Rota */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
