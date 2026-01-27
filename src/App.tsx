import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SessionContextProvider, useSession } from './components/SessionContextProvider';

// Importe suas páginas aqui
import IndexPage from './pages/Index';
import LoginPage from './pages/Login';
import DailyResponsePage from './pages/DailyResponsePage'; // Importa a nova página

// Componente de rota protegida
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Toaster /> {/* Adicione o Toaster para notificações */}
      <SessionContextProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <IndexPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/daily-response"
            element={
              <ProtectedRoute>
                <DailyResponsePage />
              </ProtectedRoute>
            }
          />
          {/* Adicione outras rotas protegidas aqui */}
        </Routes>
      </SessionContextProvider>
    </Router>
  );
}

export default App;