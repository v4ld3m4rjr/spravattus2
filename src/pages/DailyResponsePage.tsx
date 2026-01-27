"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from '@/src/components/SessionContextProvider';
import { supabase } from '@/src/integrations/supabase/client';
import toast from 'react-hot-toast';
import Header from '@/src/components/Header';
import DailyResponseForm from '@/src/components/DailyResponseForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Skeleton } from '@/src/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Importa o locale para português
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'; // Importa Popover
import { Calendar } from '@/src/components/ui/calendar'; // Importa Calendar
import { cn } from '@/src/lib/utils'; // Importa cn para estilização condicional

interface DailyResponse {
  id: string;
  user_id: string;
  response_date: string;
  sleep_quality: number | null;
  mood: number | null;
  anxiety: number | null;
  medications_taken: boolean;
  notes: string | null;
  sleep_hours: number | null;
  stress_score: number | null;
  resting_hr: number | null;
  depressed_mood: number | null;
  euphoria: number | null;
  irritability: number | null;
  obsessions: number | null;
  sensory_sensitivity: number | null;
  social_masking: number | null;
  suicide_risk: number | null;
  spravatto_sessions: number | null;
  hrv: number | null;
  exercises_performed: boolean;
}

const DailyResponsePage = () => {
  const { session, isLoading: isSessionLoading } = useSession();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [dailyResponse, setDailyResponse] = useState<DailyResponse | null>(null);
  const [isLoadingResponse, setIsLoadingResponse] = useState(true);

  const fetchDailyResponse = async (date: Date) => {
    if (!session?.user?.id) {
      setIsLoadingResponse(false);
      setDailyResponse(null);
      return;
    }

    setIsLoadingResponse(true);
    const formattedDate = format(date, 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('daily_responses')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('response_date', formattedDate)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means "no rows found"
      toast.error(`Erro ao carregar resposta diária: ${error.message}`);
      console.error("Error fetching daily response:", error);
      setDailyResponse(null);
    } else if (data) {
      setDailyResponse(data);
    } else {
      setDailyResponse(null);
    }
    setIsLoadingResponse(false);
  };

  useEffect(() => {
    if (!isSessionLoading) {
      fetchDailyResponse(currentDate);
    }
  }, [session, isSessionLoading, currentDate]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
    }
  };

  const handleSave = () => {
    fetchDailyResponse(currentDate); // Recarrega a resposta após salvar
  };

  if (isSessionLoading || isLoadingResponse) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto p-4">
          <Card className="mb-8">
            <CardHeader>
              <Skeleton className="h-8 w-1/2 mb-4" />
              <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto p-4">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Rastreamento Diário</CardTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !currentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {currentDate ? format(currentDate, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={currentDate}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <p className="text-gray-600">
              Registre seu estado diário para {format(currentDate, 'PPP', { locale: ptBR })}.
            </p>
          </CardHeader>
          <CardContent>
            <DailyResponseForm
              initialData={dailyResponse}
              responseDate={format(currentDate, 'yyyy-MM-dd')}
              onSave={handleSave}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DailyResponsePage;