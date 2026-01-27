"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from '@/src/components/SessionContextProvider';
import { supabase } from '@/src/integrations/supabase/client';
import toast from 'react-hot-toast';
import { UserCircle2, Edit } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'; // Importa os componentes Card
import { Skeleton } from '@/src/components/ui/skeleton'; // Importa o componente Skeleton
import UserProfileForm from './UserProfileForm';

interface Profile {
  first_name: string | null;
  last_name: string | null;
}

const UserProfileDisplay = () => {
  const { session, isLoading: isSessionLoading } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

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
    setIsEditing(false);
    fetchProfile();
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isSessionLoading || isLoadingProfile) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!session?.user) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Perfil do Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Nenhum usuário logado.</p>
        </CardContent>
      </Card>
    );
  }

  const displayName = profile?.first_name || session.user.email;
  const displayFullName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}` 
    : displayName;

  return (
    <Card className="mb-8">
      <CardHeader>
        {isEditing ? (
          <CardTitle>Editar Perfil</CardTitle>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserCircle2 className="h-8 w-8 text-gray-600 mr-3" />
              <CardTitle>Bem-vindo(a), {displayFullName}!</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar Perfil
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <UserProfileForm
            initialFirstName={profile?.first_name}
            initialLastName={profile?.last_name}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <p className="text-gray-700">Email: {session.user.email}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfileDisplay;