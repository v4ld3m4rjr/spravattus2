"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from '@/src/components/SessionContextProvider';
import { supabase } from '@/src/integrations/supabase/client';
import toast from 'react-hot-toast';
import { UserCircle2, Edit } from 'lucide-react'; // Ícones para o perfil e edição
import { Button } from '@/src/components/ui/button';
import UserProfileForm from './UserProfileForm'; // Importa o novo componente de formulário

interface Profile {
  first_name: string | null;
  last_name: string | null;
}

const UserProfileDisplay = () => {
  const { session, isLoading: isSessionLoading } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // Novo estado para controlar a edição

  const fetchProfile = async () => {
    if (!session?.user?.id) {
      setIsLoadingProfile(false);
      return;
    }

    setIsLoadingProfile(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', session.user.id)
      .single();

    if (error) {
      toast.error(`Erro ao carregar perfil: ${error.message}`);
      console.error("Error fetching profile:", error);
      setProfile(null);
    } else {
      setProfile(data);
    }
    setIsLoadingProfile(false);
  };

  useEffect(() => {
    if (!isSessionLoading) {
      fetchProfile();
    }
  }, [session, isSessionLoading]);

  const handleSave = () => {
    setIsEditing(false); // Sai do modo de edição
    fetchProfile(); // Recarrega o perfil para mostrar as atualizações
  };

  const handleCancel = () => {
    setIsEditing(false); // Sai do modo de edição
  };

  if (isSessionLoading || isLoadingProfile) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md mb-8">
        <p className="text-gray-600">Carregando perfil...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md mb-8">
        <p className="text-gray-600">Nenhum usuário logado.</p>
      </div>
    );
  }

  const displayName = profile?.first_name || session.user.email;
  const displayFullName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}` 
    : displayName;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md mb-8">
      {isEditing ? (
        <UserProfileForm
          initialFirstName={profile?.first_name}
          initialLastName={profile?.last_name}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <UserCircle2 className="h-8 w-8 text-gray-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">Bem-vindo(a), {displayFullName}!</h3>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar Perfil
            </Button>
          </div>
          <p className="text-gray-700">Email: {session.user.email}</p>
        </>
      )}
    </div>
  );
};

export default UserProfileDisplay;