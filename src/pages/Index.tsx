import React from 'react';
import UserSheetsDashboard from '@/src/components/UserSheetsDashboard';
import Header from '@/src/components/Header'; // Importa o componente Header

const IndexPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header /> {/* Adiciona o Header aqui */}
      <UserSheetsDashboard />
    </div>
  );
};

export default IndexPage;