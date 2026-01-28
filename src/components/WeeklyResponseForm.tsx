"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from '@/src/components/SessionContextProvider';
import { supabase } from '@/src/integrations/supabase/client';
import toast from 'react-hot-toast';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Loader2 } from 'lucide-react';

interface WeeklyResponse {
  id?: string;
  phq9_scores: Record<string, number>;
  gad7_scores: Record<string, number>;
  asrm_scores: Record<string, number>;
  phq9_total: number | null;
  gad7_total: number | null;
  asrm_total: number | null;
}

interface WeeklyResponseFormProps {
  initialData?: WeeklyResponse | null;
  responseDate: string;
  onSave: () => void;
}

const phq9Questions = [
  "Pouco interesse ou prazer em fazer as coisas?",
  "Sentir-se para baixo, deprimido ou sem esperança?",
  "Dificuldade para pegar no sono, permanecer dormindo ou dormir demais?",
  "Sentir-se cansado ou com pouca energia?",
  "Falta de apetite ou comer demais?",
  "Sentir-se mal consigo mesmo(a) — ou que você é um fracasso ou que decepcionou a si mesmo(a) ou sua família?",
  "Dificuldade para se concentrar em coisas, como ler o jornal ou assistir TV?",
  "Mover-se ou falar tão lentamente que outras pessoas poderiam ter notado? Ou o oposto — estar tão agitado(a) ou inquieto(a) que você se move muito mais do que o habitual?",
  "Pensamentos de que você estaria melhor morto(a) ou de se machucar de alguma forma?",
];

const gad7Questions = [
  "Sentir-se nervoso(a), ansioso(a) ou no limite?",
  "Não conseguir parar ou controlar a preocupação?",
  "Preocupar-se demais com diferentes coisas?",
  "Dificuldade para relaxar?",
  "Estar tão inquieto(a) que é difícil ficar parado(a)?",
  "Ficar facilmente incomodado(a) ou irritado(a)?",
  "Sentir medo como se algo terrível pudesse acontecer?",
];

const asrmQuestions = [
  "Senti-me mais irritável do que o habitual.",
  "Minha necessidade de sono diminuiu.",
  "Falei mais do que o habitual.",
  "Meus pensamentos estavam acelerados ou minha mente estava correndo.",
  "Minha energia estava aumentada.",
  "Minha autoestima estava aumentada (senti-me melhor comigo mesmo(a) do que o habitual).",
  "Fiz coisas mais arriscadas ou prazerosas do que o habitual (por exemplo, compras, sexo, investimentos financeiros).",
  "Senti-me mais sociável ou extrovertido(a) do que o habitual.",
  "Senti-me mais produtivo(a) ou criativo(a) do que o habitual.",
  "Senti-me mais confiante do que o habitual.",
];

const WeeklyResponseForm = ({ initialData, responseDate, onSave }: WeeklyResponseFormProps) => {
  const { session } = useSession();
  const [phq9Scores, setPhq9Scores] = useState<Record<string, number>>(initialData?.phq9_scores || {});
  const [gad7Scores, setGad7Scores] = useState<Record<string, number>>(initialData?.gad7_scores || {});
  const [asrmScores, setAsrmScores] = useState<Record<string, number>>(initialData?.asrm_scores || {});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setPhq9Scores(initialData.phq9_scores || {});
      setGad7Scores(initialData.gad7_scores || {});
      setAsrmScores(initialData.asrm_scores || {});
    } else {
      setPhq9Scores({});
      setGad7Scores({});
      setAsrmScores({});
    }
  }, [initialData]);

  const calculateTotal = (scores: Record<string, number>) => {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error('Você precisa estar logado para registrar uma resposta semanal.');
      return;
    }

    setIsLoading(true);
    const loadingToastId = toast.loading('Salvando resposta semanal...');

    const phq9Total = calculateTotal(phq9Scores);
    const gad7Total = calculateTotal(gad7Scores);
    const asrmTotal = calculateTotal(asrmScores);

    const responseData = {
      user_id: session.user.id,
      response_date: responseDate,
      phq9_scores: phq9Scores,
      gad7_scores: gad7Scores,
      asrm_scores: asrmScores,
      phq9_total: phq9Total,
      gad7_total: gad7Total,
      asrm_total: asrmTotal,
    };

    try {
      let error = null;
      if (initialData?.id) {
        const { error: updateError } = await supabase
          .from('weekly_responses')
          .update(responseData)
          .eq('id', initialData.id)
          .eq('user_id', session.user.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('weekly_responses')
          .insert([responseData]);
        error = insertError;
      }

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Resposta semanal salva com sucesso!', { id: loadingToastId });
      onSave();
    } catch (error: any) {
      toast.error(`Falha ao salvar resposta: ${error.message}`, { id: loadingToastId });
      console.error("Error saving weekly response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestionnaire = (questions: string[], scores: Record<string, number>, setScores: React.Dispatch<React.SetStateAction<Record<string, number>>>, title: string) => (
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
            max="3" // Escala comum para PHQ-9 e GAD-7 (0-3)
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
      {renderQuestionnaire(phq9Questions, phq9Scores, setPhq9Scores, "PHQ-9 (Questionário de Saúde do Paciente-9)")}
      {renderQuestionnaire(gad7Questions, gad7Scores, setGad7Scores, "GAD-7 (Questionário de Ansiedade Generalizada-7)")}
      {renderQuestionnaire(asrmQuestions, asrmScores, setAsrmScores, "ASRM (Escala de Autoavaliação de Mania de Altman)")}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Salvar Resposta Semanal
      </Button>
    </form>
  );
};

export default WeeklyResponseForm;