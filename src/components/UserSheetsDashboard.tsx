"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from '@/src/components/SessionContextProvider';
import { supabase } from '@/src/integrations/supabase/client';
import toast from 'react-hot-toast';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { PlusCircle, ExternalLink } from 'lucide-react'; // Usando Lucide React para ícones

interface UserSheet {
  id: string;
  user_id: string;
  sheet_id: string;
  sheet_name: string;
  created_at: string;
}

const UserSheetsDashboard = () => {
  const { session } = useSession();
  const [sheets, setSheets] = useState<UserSheet[]>([]);
  const [newSheetName, setNewSheetName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSheets, setIsFetchingSheets] = useState(true);

  const fetchUserSheets = async () => {
    if (!session?.user?.id) return;
    setIsFetchingSheets(true);
    const { data, error } = await supabase
      .from('user_sheets')
      .select('*')
      .eq('user_id', session.user.id);

    if (error) {
      toast.error(`Erro ao carregar planilhas: ${error.message}`);
      console.error("Error fetching user sheets:", error);
    } else {
      setSheets(data || []);
    }
    setIsFetchingSheets(false);
  };

  useEffect(() => {
    fetchUserSheets();
  }, [session]);

  const handleCreateSheet = async () => {
    if (!newSheetName.trim()) {
      toast.error('O nome da planilha não pode estar vazio.');
      return;
    }
    if (!session?.access_token) {
      toast.error('Você precisa estar logado para criar uma planilha.');
      return;
    }

    setIsLoading(true);
    const loadingToastId = toast.loading('Criando planilha do Google Sheets...');

    try {
      const response = await fetch(
        `https://${supabase.supabaseUrl.split('.')[0]}.supabase.co/functions/v1/create-google-sheet`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ sheetName: newSheetName }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro desconhecido ao criar planilha.');
      }

      toast.success('Planilha criada e salva com sucesso!', { id: loadingToastId });
      setNewSheetName('');
      fetchUserSheets(); // Atualiza a lista de planilhas
    } catch (error: any) {
      toast.error(`Falha ao criar planilha: ${error.message}`, { id: loadingToastId });
      console.error("Error creating Google Sheet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Minhas Planilhas do Google</h2>

      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Criar Nova Planilha</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            type="text"
            placeholder="Nome da nova planilha"
            value={newSheetName}
            onChange={(e) => setNewSheetName(e.target.value)}
            className="flex-grow"
            disabled={isLoading}
          />
          <Button onClick={handleCreateSheet} disabled={isLoading}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {isLoading ? 'Criando...' : 'Criar Planilha'}
          </Button>
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Planilhas Existentes</h3>
        {isFetchingSheets ? (
          <p className="text-gray-600">Carregando planilhas...</p>
        ) : sheets.length === 0 ? (
          <p className="text-gray-600">Você ainda não tem nenhuma planilha. Crie uma acima!</p>
        ) : (
          <ul className="space-y-4">
            {sheets.map((sheet) => (
              <li key={sheet.id} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                <span className="font-medium text-gray-700">{sheet.sheet_name}</span>
                <a
                  href={`https://docs.google.com/spreadsheets/d/${sheet.sheet_id}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  Abrir no Google Sheets
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserSheetsDashboard;