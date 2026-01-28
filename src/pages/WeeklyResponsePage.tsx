"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from '@/src/components/SessionContextProvider';
import { supabase } from '@/src/integrations/supabase/client';
import toast from 'react-hot-toast';
import Header from '@/src/components/Header';
import WeeklyResponseForm from '@/src/components/WeeklyResponseForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Skeleton } from '@/src/components/ui/skeleton';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { Calendar } from '@/src/components/ui/calendar';
import { cn } from '@/src/lib/utils';

interface WeeklyResponse {
  id: string;
  user_id: string;
  response_date: string;
  phq9_scores: Record<string, number>;
  gad7_scores: Record<string, number>;
  asrm_scores: Record<string, number>;
  phq9_total: number | null;
  gad7_total: number | null;
  asrm_total: number | null;
}

const WeeklyResponsePage = () => {
  const { session, isLoading: isSessionLoading } = useSession();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { locale: ptBR }));
  const [weeklyResponse, setWeeklyResponse] = useState<WeeklyResponse | null>(null);
  const [isLoadingResponse, setIsLoadingResponse] = useState(true);

  const fetchWeeklyResponse = async (weekStartDate: Date) => {
    if (!session?.user?.id) {
      setIsLoadingResponse(false);
      setWeeklyResponse(null);
      return;
    }

    setIsLoadingResponse(true);
    const formattedDate = format(weekStartDate, 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('weekly_responses')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('response_date', formattedDate)
      .single();

    if (error && error.code !== 'PGRST116') {
      toast.error(`Erro ao carregar resposta semanal: ${error.message}`);
      console.error("Error fetching weekly response:", error);
      setWeeklyResponse(null);
    } else if (data) {
      setWeeklyResponse(data);
    } else {
      setWeeklyResponse(null);
    }
    setIsLoadingResponse(false);
  };

  useEffect(() => {
    if (!isSessionLoading) {
      fetchWeeklyResponse(currentWeekStart);
    }
  }, [session, isSessionLoading, currentWeekStart]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setCurrentWeekStart(startOfWeek(date, { locale: ptBR }));
    }
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart((prev) => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addWeeks(prev, 1));
  };

  const handleSave = () => {
    fetchWeeklyResponse(currentWeekStart);
  };

  const weekEnd = endOfWeek(currentWeekStart, { locale: ptBR });

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
              <CardTitle>Rastreamento Semanal</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !currentWeekStart && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {currentWeekStart ? `${format(currentWeekStart, "PPP", { locale: ptBR })} - ${format(weekEnd, "PPP", { locale: ptBR })}` : <span>Escolha uma semana</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={currentWeekStart}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="icon" onClick={handleNextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-gray-600">
              Registre seu estado semanal para a semana de {format(currentWeekStart, 'PPP', { locale: ptBR })} a {format(weekEnd, 'PPP', { locale: ptBR })}.
            </p>
          </CardHeader>
          <CardContent>
            <WeeklyResponseForm
              initialData={weeklyResponse}
              responseDate={format(currentWeekStart, 'yyyy-MM-dd')}
              onSave={handleSave}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeeklyResponsePage;