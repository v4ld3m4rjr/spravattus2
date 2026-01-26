import React from 'react';
import UserSheetsDashboard from '@/src/components/UserSheetsDashboard';
import Header from '@/src/components/Header';
import UserProfileDisplay from '@/src/components/UserProfileDisplay'; // Importa o novo componente

const IndexPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto p-4">
        <UserProfileDisplay /> {/* Adiciona o UserProfileDisplay aqui */}
        <UserSheetsDashboard />
      </div>
    </div>
  );
};

export default IndexPage;