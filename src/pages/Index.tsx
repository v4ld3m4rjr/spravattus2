import React from 'react';
import UserSheetsDashboard from '@/src/components/UserSheetsDashboard';
import Header from '@/src/components/Header';
import UserProfileDisplay from '@/src/components/UserProfileDisplay';
import DailyResponseChart from '@/src/components/DailyResponseChart'; // Importa o novo componente de gráfico

const IndexPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto p-4">
        <UserProfileDisplay />
        <DailyResponseChart /> {/* Adiciona o DailyResponseChart aqui */}
        <UserSheetsDashboard />
      </div>
    </div>
  );
};

export default IndexPage;