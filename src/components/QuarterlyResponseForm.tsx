"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from '@/src/components/SessionContextProvider';
import { supabase } from '@/src/integrations/supabase/client';
import toast from 'react-hot-toast';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Loader2 } from 'lucide-react';

interface QuarterlyResponse {
  id?: string;
  catq_scores: Record<string, number>;
  raadsr_scores: Record<string, number>;
  catq_total: number | null;
  raadsr_total: number | null;
}

interface QuarterlyResponseFormProps {
  initialData?: QuarterlyResponse | null;
  responseDate: string;
  onSave: () => void;
}

const catqQuestions = [
  "Dificuldade em entender as emoções dos outros?",
  "Dificuldade em expressar suas próprias emoções?",
  "Dificuldade em identificar suas próprias emoções?",
  "Dificuldade em descrever suas emoções para os outros?",
  "Dificuldade em distinguir entre emoções e sensações físicas?",
  "Dificuldade em usar a imaginação para criar cenários ou fantasias?",
  "Dificuldade em se concentrar em uma conversa quando há ruído de fundo?",
  "Dificuldade em manter contato visual?",
  "Dificuldade em entender sarcasmo ou ironia?",
  "Dificuldade em fazer amigos ou manter amizades?",
];

const raadsrQuestions = [
  "Eu tenho dificuldade em entender as emoções dos outros.",
  "Eu tenho dificuldade em fazer contato visual.",
  "Eu tenho dificuldade em entender as regras sociais não escritas.",
  "Eu prefiro rotinas e me sinto desconfortável com mudanças.",
  "Eu tenho interesses muito intensos e específicos.",
  "Eu sou muito sensível a certos sons, cheiros, texturas ou luzes.",
  "Eu tenho dificuldade em iniciar ou manter conversas.",
  "Eu tenho dificuldade em entender piadas ou metáforas.",
  "Eu me sinto mais confortável sozinho(a) do que em grupos.",
  "Eu tenho movimentos repetitivos (ex: balançar, girar, bater os dedos).",
];

const QuarterlyResponseForm = ({ initialData, responseDate, onSave }: QuarterlyResponseFormProps) => {
  const { session } = useSession();
  const [catqScores, setCatqScores] = useState<Record<string, number>>(initialData?.catq_scores || {});
  const [raadsrScores, setRaadsrScores] = useState<Record<string, number>>(initialData?.raadsr_scores || {});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCatqScores(initialData.catq_scores || {});
      setRaadsrScores(initialData.raadsr_scores || {});
    } else {
      setCatqScores({});
      setRaadsrScores({});
    }
  }, [initialData]);

  const calculateTotal = (scores: Record<string, number>) => {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error('Você precisa estar logado para registrar uma resposta trimestral.');
      return;
    }

    setIsLoading(true);
    const loadingToastId = toast.loading('Salvando resposta trimestral...');

    const catqTotal = calculateTotal(catqScores);
    const raadsrTotal = calculateTotal(raadsrScores);

    const responseData = {
      user_id: session.user.id,
      response_date: responseDate,
      catq_scores: catqScores,
      raadsr_scores: raadsrScores,
      catq_total: catqTotal,
      raadsr_total: raadsrTotal,
    };

    try {
      let error = null;
      if (initialData?.id) {
        const { error: updateError } = await supabase
          .from('quarterly_responses')
          .update(responseData)
          .eq('id', initialData.id)
          .eq('user_id', session.user.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('quarterly_responses')
          .insert([responseData]);
        error = insertError;
      }

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Resposta trimestral salva com sucesso!', { id: loadingToastId });
      onSave();
    } catch (error: any) {
      toast.error(`Falha ao salvar resposta: ${error.message}`, { id: loadingToastId });
      console.error("Error saving quarterly response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestionnaire = (questions: string[], scores: Record<string, number>, setScores: React.Dispatch<React.SetStateAction<Record<string, number>>>, title: string, maxScore: number = 3) => (
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
      {renderQuestionnaire(catqQuestions, catqScores, setCatqScores, "CAT-Q (Questionário de Traços Autistas)", 3)}
      {renderQuestionnaire(raadsrQuestions, raadsrScores, setRaadsrScores, "RAADS-R (Escala de Diagnóstico de Autismo em Adultos - Revisada)", 3)}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Salvar Resposta Trimestral
      </Button>
    </form>
  );
};

export default QuarterlyResponseForm;