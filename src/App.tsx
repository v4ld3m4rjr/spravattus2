import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Importe suas páginas aqui
import IndexPage from './pages/Index';

function App() {
  return (
    <Router>
      <Toaster /> {/* Adicione o Toaster para notificações */}
      <Routes>
        <Route path="/" element={<IndexPage />} />
        {/* Adicione outras rotas aqui */}
      </Routes>
    </Router>
  );
}

export default App;