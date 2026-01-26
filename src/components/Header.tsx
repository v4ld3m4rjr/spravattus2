"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/src/integrations/supabase/client';
import { Button } from '@/src/components/ui/button';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Erro ao fazer logout: ${error.message}`);
      console.error("Error logging out:", error);
    } else {
      toast.success('Logout realizado com sucesso!');
      navigate('/login');
    }
  };

  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meu Aplicativo de Rastreamento</h1>
        <Button variant="ghost" onClick={handleLogout} className="flex items-center text-primary-foreground hover:bg-primary/80">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  );
};

export default Header;