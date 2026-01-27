"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from '@/src/components/SessionContextProvider';
import { supabase } from '@/src/integrations/supabase/client';
import toast from 'react-hot-toast';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Loader2 } from 'lucide-react'; // Ícone de carregamento

interface UserProfileFormProps {
  initialFirstName: string | null;
  initialLastName: string | null;
  onSave: () => void; // Callback para quando o perfil for salvo
  onCancel: () => void; // Callback para cancelar a edição
}

const UserProfileForm = ({ initialFirstName, initialLastName, onSave, onCancel }: UserProfileFormProps) => {
  const { session } = useSession();
  const [firstName, setFirstName] = useState(initialFirstName || '');
  const [lastName, setLastName] = useState(initialLastName || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFirstName(initialFirstName || '');
    setLastName(initialLastName || '');
  }, [initialFirstName, initialLastName]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error('Você precisa estar logado para atualizar o perfil.');
      return;
    }

    setIsLoading(true);
    const loadingToastId = toast.loading('Salvando perfil...');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ first_name: firstName, last_name: lastName, updated_at: new Date().toISOString() })
        .eq('id', session.user.id);

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Perfil atualizado com sucesso!', { id: loadingToastId });
      onSave(); // Chama o callback para atualizar a exibição
    } catch (error: any) {
      toast.error(`Falha ao atualizar perfil: ${error.message}`, { id: loadingToastId });
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSaveProfile} className="space-y-4">
      <div>
        <Label htmlFor="firstName">Primeiro Nome</Label>
        <Input
          id="firstName"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div>
        <Label htmlFor="lastName">Sobrenome</Label>
        <Input
          id="lastName"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Salvar
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default UserProfileForm;