"use client";

import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { supabase } from '@/src/integrations/supabase/client';
import { Button } from '@/src/components/ui/button';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/src/lib/utils'; // Importa a função cn para estilização condicional

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
        <nav className="flex items-center space-x-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                "text-primary-foreground hover:text-primary-foreground/80 transition-colors",
                isActive && "font-semibold underline underline-offset-4"
              )
            }
          >
            Dashboard
          </NavLink>
          {/* Adicione mais links de navegação aqui, se necessário */}
        </nav>
        <Button variant="ghost" onClick={handleLogout} className="flex items-center text-primary-foreground hover:bg-primary/80">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  );
};

export default Header;