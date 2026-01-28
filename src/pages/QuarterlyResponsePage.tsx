"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from '@/src/components/SessionContextProvider';
import { supabase } from '@/src/integrations/supabase/client';
import toast from 'react-hot-toast';
import Header from '@/src/components/Header';
import QuarterlyResponseForm from '@/src/components/QuarterlyResponseForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Skeleton } from '@/src/components/ui/skeleton';
import { format, startOfQuarter, endOfQuarter, addQuarters, subQuarters } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { Calendar } from '@/src/components/ui/calendar';
import { cn } from '@/src/lib/utils';

interface QuarterlyResponse {
  id: string;
  user_id: string;
  response_date: string;
  catq_scores: Record<string, number>;
  raadsr_scores: Record<string, number>;
  catq_total: number | null;
  raadsr_total: number | null;
}

const QuarterlyResponsePage = () => {
  const { session, isLoading: isSessionLoading } = useSession();
  const [currentQuarterStart, setCurrentQuarterStart] = useState<Date>(startOfQuarter(new Date()));
  const [quarterlyResponse, setQuarterlyResponse] = useState<QuarterlyResponse | null>(null);
  const [isLoadingResponse, setIsLoadingResponse] = useState(true);

  const fetchQuarterlyResponse = async (quarterStartDate: Date) => {
    if (!session?.user?.id) {
      setIsLoadingResponse(false);
      setQuarterlyResponse(null);
      return;
    }

    setIsLoadingResponse(true);
    const formattedDate = format(quarterStartDate, 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('quarterly_responses')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('response_date', formattedDate)
      .single();

    if (error && error.code !== 'PGRST116') {
      toast.error(`Erro ao carregar resposta trimestral: ${error.message}`);
      console.error("Error fetching quarterly response:", error);
      setQuarterlyResponse(null);
    } else if (data) {
      setQuarterlyResponse(data);
    } else {
      setQuarterlyResponse(null);
    }
    setIsLoadingResponse(false);
  };

  useEffect(() => {
    if (!isSessionLoading) {
      fetchQuarterlyResponse(currentQuarterStart);
    }
  }, [session, isSessionLoading, currentQuarterStart]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setCurrentQuarterStart(startOfQuarter(date));
    }
  };

  const handlePreviousQuarter = () => {
    setCurrentQuarterStart((prev) => subQuarters(prev, 1));
  };

  const handleNextQuarter = () => {
    setCurrentQuarterStart((prev) => addQuarters(prev, 1));
  };

  const handleSave = () => {
    fetchQuarterlyResponse(currentQuarterStart);
  };

  const quarterEnd = endOfQuarter(currentQuarterStart);

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
              <CardTitle>Rastreamento Trimestral</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePreviousQuarter}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !currentQuarterStart && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {currentQuarterStart ? `${format(currentQuarterStart, "QQQ yyyy", { locale: ptBR })}` : <span>Escolha um trimestre</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={currentQuarterStart}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="icon" onClick={handleNextQuarter}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-gray-600">
              Registre seu estado trimestral para {format(currentQuarterStart, 'QQQ yyyy', { locale: ptBR })}.
            </p>
          </CardHeader>
          <CardContent>
            <QuarterlyResponseForm
              initialData={quarterlyResponse}
              responseDate={format(currentQuarterStart, 'yyyy-MM-dd')}
              onSave={handleSave}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuarterlyResponsePage;