"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from '@/src/components/SessionContextProvider';
import { supabase } from '@/src/integrations/supabase/client';
import toast from 'react-hot-toast';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Skeleton } from '@/src/components/ui/skeleton';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DailyResponse {
  response_date: string;
  mood: number | null;
  anxiety: number | null;
}

const DailyResponseChart = () => {
  const { session, isLoading: isSessionLoading } = useSession();
  const [chartData, setChartData] = useState<DailyResponse[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(true);

  useEffect(() => {
    const fetchDailyResponses = async () => {
      if (!session?.user?.id) {
        setIsLoadingChart(false);
        return;
      }

      setIsLoadingChart(true);
      const thirtyDaysAgo = format(subDays(new Date(), 29), 'yyyy-MM-dd'); // Últimos 30 dias
      const today = format(new Date(), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('daily_responses')
        .select('response_date, mood, anxiety')
        .eq('user_id', session.user.id)
        .gte('response_date', thirtyDaysAgo)
        .lte('response_date', today)
        .order('response_date', { ascending: true });

      if (error) {
        toast.error(`Erro ao carregar dados do gráfico: ${error.message}`);
        console.error("Error fetching daily responses for chart:", error);
        setChartData([]);
      } else {
        // Preencher datas ausentes com dados nulos para um gráfico contínuo
        const allDates = Array.from({ length: 30 }, (_, i) => format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'));
        const dataMap = new Map(data.map(d => [d.response_date, d]));

        const filledData = allDates.map(date => ({
          response_date: date,
          mood: dataMap.get(date)?.mood || null,
          anxiety: dataMap.get(date)?.anxiety || null,
        }));
        setChartData(filledData);
      }
      setIsLoadingChart(false);
    };

    if (!isSessionLoading) {
      fetchDailyResponses();
    }
  }, [session, isSessionLoading]);

  if (isSessionLoading || isLoadingChart) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!session?.user) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Gráfico de Respostas Diárias</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Faça login para ver seus dados de rastreamento diário.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Humor e Ansiedade (Últimos 30 Dias)</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-gray-600">Nenhum dado diário disponível para os últimos 30 dias.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{
                top: 5, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="response_date"
                tickFormatter={(tick) => format(new Date(tick), 'dd/MM', { locale: ptBR })}
              />
              <YAxis domain={[0, 10]} />
              <Tooltip
                formatter={(value: number | null, name: string) => [value !== null ? value : 'N/A', name === 'mood' ? 'Humor' : 'Ansiedade']}
                labelFormatter={(label) => format(new Date(label), 'PPP', { locale: ptBR })}
              />
              <Legend />
              <Line type="monotone" dataKey="mood" stroke="#8884d8" name="Humor" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="anxiety" stroke="#82ca9d" name="Ansiedade" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyResponseChart;