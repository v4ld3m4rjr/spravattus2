"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from '@/src/components/SessionContextProvider';
import { supabase } from '@/src/integrations/supabase/client';
import toast from 'react-hot-toast';
import Header from '@/src/components/Header';
import MonthlyResponseForm from '@/src/components/MonthlyResponseForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Skeleton } from '@/src/components/ui/skeleton';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { Calendar } from '@/src/components/ui/calendar';
import { cn } from '@/src/lib/utils';

interface MonthlyResponse {
  id: string;
  user_id: string;
  response_date: string;
  eq5d5l_scores: Record<string, number>;
  ybocs_scores: Record<string, number>;
  fast_scores: Record<string, number>;
  eq5d5l_total: number | null;
  ybocs_total: number | null;
  fast_total: number | null;
}

const MonthlyResponsePage = () => {
  const { session, isLoading: isSessionLoading } = useSession();
  const [currentMonthStart, setCurrentMonthStart] = useState<Date>(startOfMonth(new Date()));
  const [monthlyResponse, setMonthlyResponse] = useState<MonthlyResponse | null>(null);
  const [isLoadingResponse, setIsLoadingResponse] = useState(true);

  const fetchMonthlyResponse = async (monthStartDate: Date) => {
    if (!session?.user?.id) {
      setIsLoadingResponse(false);
      setMonthlyResponse(null);
      return;
    }

    setIsLoadingResponse(true);
    const formattedDate = format(monthStartDate, 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('monthly_responses')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('response_date', formattedDate)
      .single();

    if (error && error.code !== 'PGRST116') {
      toast.error(`Erro ao carregar resposta mensal: ${error.message}`);
      console.error("Error fetching monthly response:", error);
      setMonthlyResponse(null);
    } else if (data) {
      setMonthlyResponse(data);
    } else {
      setMonthlyResponse(null);
    }
    setIsLoadingResponse(false);
  };

  useEffect(() => {
    if (!isSessionLoading) {
      fetchMonthlyResponse(currentMonthStart);
    }
  }, [session, isSessionLoading, currentMonthStart]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setCurrentMonthStart(startOfMonth(date));
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonthStart((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthStart((prev) => addMonths(prev, 1));
  };

  const handleSave = () => {
    fetchMonthlyResponse(currentMonthStart);
  };

  const monthEnd = endOfMonth(currentMonthStart);

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
              <CardTitle>Rastreamento Mensal</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !currentMonthStart && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {currentMonthStart ? format(currentMonthStart, "MMMM yyyy", { locale: ptBR }) : <span>Escolha um mês</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={currentMonthStart}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-gray-600">
              Registre seu estado mensal para {format(currentMonthStart, 'MMMM yyyy', { locale: ptBR })}.
            </p>
          </CardHeader>
          <CardContent>
            <MonthlyResponseForm
              initialData={monthlyResponse}
              responseDate={format(currentMonthStart, 'yyyy-MM-dd')}
              onSave={handleSave}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonthlyResponsePage;