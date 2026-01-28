"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from '@/src/components/SessionContextProvider';
import { supabase } from '@/src/integrations/supabase/client';
import toast from 'react-hot-toast';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Loader2 } from 'lucide-react';

interface MonthlyResponse {
  id?: string;
  eq5d5l_scores: Record<string, number>;
  ybocs_scores: Record<string, number>;
  fast_scores: Record<string, number>;
  eq5d5l_total: number | null;
  ybocs_total: number | null;
  fast_total: number | null;
}

interface MonthlyResponseFormProps {
  initialData?: MonthlyResponse | null;
  responseDate: string;
  onSave: () => void;
}

const eq5d5lQuestions = [
  "Mobilidade: Tenho problemas para andar?",
  "Autocuidado: Tenho problemas para me cuidar?",
  "Atividades habituais: Tenho problemas para realizar minhas atividades habituais (por exemplo, trabalho, estudo, tarefas domésticas, atividades familiares ou de lazer)?",
  "Dor/Desconforto: Sinto dor ou desconforto?",
  "Ansiedade/Depressão: Sinto-me ansioso(a) ou deprimido(a)?",
];

const ybocsQuestions = [
  "Tempo gasto em obsessões/compulsões?",
  "Interferência das obsessões/compulsões?",
  "Sofrimento causado pelas obsessões/compulsões?",
  "Resistência às obsessões/compulsões?",
  "Controle sobre as obsessões/compulsões?",
  "Tempo gasto em compulsões?",
  "Interferência das compulsões?",
  "Sofrimento causado pelas compulsões?",
  "Resistência às compulsões?",
  "Controle sobre as compulsões?",
];

const fastQuestions = [
  "Funcionamento Autônomo (ex: tomar decisões, iniciar atividades)",
  "Funcionamento Ocupacional (ex: manter emprego, realizar tarefas)",
  "Funcionamento Cognitivo (ex: memória, atenção, planejamento)",
  "Funcionamento Interpessoal (ex: manter relacionamentos, interagir socialmente)",
  "Funcionamento da Vida Diária (ex: higiene, alimentação, finanças)",
  "Funcionamento de Lazer (ex: participar de hobbies, atividades recreativas)",
];

const MonthlyResponseForm = ({ initialData, responseDate, onSave }: MonthlyResponseFormProps) => {
  const { session } = useSession();
  const [eq5d5lScores, setEq5d5lScores] = useState<Record<string, number>>(initialData?.eq5d5l_scores || {});
  const [ybocsScores, setYbocsScores] = useState<Record<string, number>>(initialData?.ybocs_scores || {});
  const [fastScores, setFastScores] = useState<Record<string, number>>(initialData?.fast_scores || {});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setEq5d5lScores(initialData.eq5d5l_scores || {});
      setYbocsScores(initialData.ybocs_scores || {});
      setFastScores(initialData.fast_scores || {});
    } else {
      setEq5d5lScores({});
      setYbocsScores({});
      setFastScores({});
    }
  }, [initialData]);

  const calculateTotal = (scores: Record<string, number>) => {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error('Você precisa estar logado para registrar uma resposta mensal.');
      return;
    }

    setIsLoading(true);
    const loadingToastId = toast.loading('Salvando resposta mensal...');

    const eq5d5lTotal = calculateTotal(eq5d5lScores);
    const ybocsTotal = calculateTotal(ybocsScores);
    const fastTotal = calculateTotal(fastScores);

    const responseData = {
      user_id: session.user.id,
      response_date: responseDate,
      eq5d5l_scores: eq5d5lScores,
      ybocs_scores: ybocsScores,
      fast_scores: fastScores,
      eq5d5l_total: eq5d5lTotal,
      ybocs_total: ybocsTotal,
      fast_total: fastTotal,
    };

    try {
      let error = null;
      if (initialData?.id) {
        const { error: updateError } = await supabase
          .from('monthly_responses')
          .update(responseData)
          .eq('id', initialData.id)
          .eq('user_id', session.user.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('monthly_responses')
          .insert([responseData]);
        error = insertError;
      }

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Resposta mensal salva com sucesso!', { id: loadingToastId });
      onSave();
    } catch (error: any) {
      toast.error(`Falha ao salvar resposta: ${error.message}`, { id: loadingToastId });
      console.error("Error saving monthly response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestionnaire = (questions: string[], scores: Record<string, number>, setScores: React.Dispatch<React.SetStateAction<Record<string, number>>>, title: string, maxScore: number = 5) => (
    <div className="space-y-4 mb-8 p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {questions.map((question, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Label htmlFor={`${title.toLowerCase().replace(/\s/g, '-')}-q${index + 1}`}>
            {index + 1}. {question}
          </Label>
          <Input
            id={`${title.toLowerCase().replace(/\s/g, '-')}-q${index + 1}`}
            type="number"
            min="0"
            max={maxScore.toString()}
            value={scores[`q${index + 1}`] || ''}
            onChange={(e) => setScores({ ...scores, [`q${index + 1}`]: parseInt(e.target.value) || 0 })}
            disabled={isLoading}
            className="w-24"
          />
        </div>
      ))}
      <p className="font-medium mt-4">Total: {calculateTotal(scores)}</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      {renderQuestionnaire(eq5d5lQuestions, eq5d5lScores, setEq5d5lScores, "EQ-5D-5L (EuroQol-5 Dimensões-5 Níveis)", 5)}
      {renderQuestionnaire(ybocsQuestions, ybocsScores, setYbocsScores, "Y-BOCS (Escala de Obsessões e Compulsões de Yale-Brown)", 5)}
      {renderQuestionnaire(fastQuestions, fastScores, setFastScores, "FAST (Escala de Funcionamento e Avaliação de Sintomas)", 6)}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Salvar Resposta Mensal
      </Button>
    </form>
  );
};

export default MonthlyResponseForm;