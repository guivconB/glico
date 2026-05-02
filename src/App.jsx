import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IntroPage from './pages/introPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Resultados from './pages/Resultados';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resultados" element={<Resultados />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
