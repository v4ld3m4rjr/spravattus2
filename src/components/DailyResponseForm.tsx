"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from '@/src/components/SessionContextProvider';
import { supabase } from '@/src/integrations/supabase/client';
import toast from 'react-hot-toast';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Switch } from '@/src/components/ui/switch'; // Para o campo booleano
import { Loader2 } from 'lucide-react';

interface DailyResponse {
  id?: string; // Pode ser nulo se for uma nova resposta
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

interface DailyResponseFormProps {
  initialData?: DailyResponse | null;
  responseDate: string; // Data para a qual a resposta está sendo criada/editada
  onSave: () => void; // Callback para quando a resposta for salva/atualizada
}

const DailyResponseForm = ({ initialData, responseDate, onSave }: DailyResponseFormProps) => {
  const { session } = useSession();
  const [sleepQuality, setSleepQuality] = useState<number | ''>(initialData?.sleep_quality || '');
  const [mood, setMood] = useState<number | ''>(initialData?.mood || '');
  const [anxiety, setAnxiety] = useState<number | ''>(initialData?.anxiety || '');
  const [medicationsTaken, setMedicationsTaken] = useState<boolean>(initialData?.medications_taken || false);
  const [notes, setNotes] = useState<string>(initialData?.notes || '');
  const [sleepHours, setSleepHours] = useState<number | ''>(initialData?.sleep_hours || '');
  const [stressScore, setStressScore] = useState<number | ''>(initialData?.stress_score || '');
  const [restingHr, setRestingHr] = useState<number | ''>(initialData?.resting_hr || '');
  const [depressedMood, setDepressedMood] = useState<number | ''>(initialData?.depressed_mood || '');
  const [euphoria, setEuphoria] = useState<number | ''>(initialData?.euphoria || '');
  const [irritability, setIrritability] = useState<number | ''>(initialData?.irritability || '');
  const [obsessions, setObsessions] = useState<number | ''>(initialData?.obsessions || '');
  const [sensorySensitivity, setSensorySensitivity] = useState<number | ''>(initialData?.sensory_sensitivity || '');
  const [socialMasking, setSocialMasking] = useState<number | ''>(initialData?.social_masking || '');
  const [suicideRisk, setSuicideRisk] = useState<number | ''>(initialData?.suicide_risk || '');
  const [spravattoSessions, setSpravattoSessions] = useState<number | ''>(initialData?.spravatto_sessions || '');
  const [hrv, setHrv] = useState<number | ''>(initialData?.hrv || '');
  const [exercisesPerformed, setExercisesPerformed] = useState<boolean>(initialData?.exercises_performed || false);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setSleepQuality(initialData.sleep_quality || '');
      setMood(initialData.mood || '');
      setAnxiety(initialData.anxiety || '');
      setMedicationsTaken(initialData.medications_taken || false);
      setNotes(initialData.notes || '');
      setSleepHours(initialData.sleep_hours || '');
      setStressScore(initialData.stress_score || '');
      setRestingHr(initialData.resting_hr || '');
      setDepressedMood(initialData.depressed_mood || '');
      setEuphoria(initialData.euphoria || '');
      setIrritability(initialData.irritability || '');
      setObsessions(initialData.obsessions || '');
      setSensorySensitivity(initialData.sensory_sensitivity || '');
      setSocialMasking(initialData.social_masking || '');
      setSuicideRisk(initialData.suicide_risk || '');
      setSpravattoSessions(initialData.spravatto_sessions || '');
      setHrv(initialData.hrv || '');
      setExercisesPerformed(initialData.exercises_performed || false);
    } else {
      // Limpar formulário se não houver dados iniciais (ex: nova data)
      setSleepQuality('');
      setMood('');
      setAnxiety('');
      setMedicationsTaken(false);
      setNotes('');
      setSleepHours('');
      setStressScore('');
      setRestingHr('');
      setDepressedMood('');
      setEuphoria('');
      setIrritability('');
      setObsessions('');
      setSensorySensitivity('');
      setSocialMasking('');
      setSuicideRisk('');
      setSpravattoSessions('');
      setHrv('');
      setExercisesPerformed(false);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error('Você precisa estar logado para registrar uma resposta diária.');
      return;
    }

    setIsLoading(true);
    const loadingToastId = toast.loading('Salvando resposta diária...');

    const responseData: Omit<DailyResponse, 'id'> & { user_id: string; response_date: string } = {
      user_id: session.user.id,
      response_date: responseDate,
      sleep_quality: sleepQuality === '' ? null : sleepQuality,
      mood: mood === '' ? null : mood,
      anxiety: anxiety === '' ? null : anxiety,
      medications_taken: medicationsTaken,
      notes: notes,
      sleep_hours: sleepHours === '' ? null : sleepHours,
      stress_score: stressScore === '' ? null : stressScore,
      resting_hr: restingHr === '' ? null : restingHr,
      depressed_mood: depressedMood === '' ? null : depressedMood,
      euphoria: euphoria === '' ? null : euphoria,
      irritability: irritability === '' ? null : irritability,
      obsessions: obsessions === '' ? null : obsessions,
      sensory_sensitivity: sensorySensitivity === '' ? null : sensorySensitivity,
      social_masking: socialMasking === '' ? null : socialMasking,
      suicide_risk: suicideRisk === '' ? null : suicideRisk,
      spravatto_sessions: spravattoSessions === '' ? null : spravattoSessions,
      hrv: hrv === '' ? null : hrv,
      exercises_performed: exercisesPerformed,
    };

    try {
      let error = null;
      if (initialData?.id) {
        // Atualizar resposta existente
        const { error: updateError } = await supabase
          .from('daily_responses')
          .update(responseData)
          .eq('id', initialData.id)
          .eq('user_id', session.user.id); // Garantir que o usuário só atualiza suas próprias respostas
        error = updateError;
      } else {
        // Inserir nova resposta
        const { error: insertError } = await supabase
          .from('daily_responses')
          .insert([responseData]);
        error = insertError;
      }

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Resposta diária salva com sucesso!', { id: loadingToastId });
      onSave(); // Chama o callback para atualizar a exibição na página
    } catch (error: any) {
      toast.error(`Falha ao salvar resposta: ${error.message}`, { id: loadingToastId });
      console.error("Error saving daily response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sleepQuality">Qualidade do Sono (1-5)</Label>
          <Input
            id="sleepQuality"
            type="number"
            min="1"
            max="5"
            value={sleepQuality}
            onChange={(e) => setSleepQuality(e.target.value === '' ? '' : parseInt(e.target.value))}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="sleepHours">Horas de Sono</Label>
          <Input
            id="sleepHours"
            type="number"
            step="0.1"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value === '' ? '' : parseFloat(e.target.value))}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="mood">Humor (1-10)</Label>
          <Input
            id="mood"
            type="number"
            min="1"
            max="10"
            value={mood}
            onChange={(e) => setMood(e.target.value === '' ? '' : parseInt(e.target.value))}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="anxiety">Ansiedade (1-10)</Label>
          <Input
            id="anxiety"
            type="number"
            min="1"
            max="10"
            value={anxiety}
            onChange={(e) => setAnxiety(e.target.value === '' ? '' : parseInt(e.target.value))}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="stressScore">Nível de Estresse (1-10)</Label>
          <Input
            id="stressScore"
            type="number"
            min="1"
            max="10"
            value={stressScore}
            onChange={(e) => setStressScore(e.target.value === '' ? '' : parseInt(e.target.value))}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="restingHr">Frequência Cardíaca em Repouso</Label>
          <Input
            id="restingHr"
            type="number"
            value={restingHr}
            onChange={(e) => setRestingHr(e.target.value === '' ? '' : parseInt(e.target.value))}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="hrv">HRV (Variabilidade da Frequência Cardíaca)</Label>
          <Input
            id="hrv"
            type="number"
            value={hrv}
            onChange={(e) => setHrv(e.target.value === '' ? '' : parseInt(e.target.value))}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="depressedMood">Humor Deprimido (1-10)</Label>
          <Input
            id="depressedMood"
            type="number"
            min="1"
            max="10"
            value={depressedMood}
            onChange={(e) => setDepressedMood(e.target.value === '' ? '' : parseInt(e.target.value))}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="euphoria">Euforia (1-10)</Label>
          <Input
            id="euphoria"
            type="number"
            min="1"
            max="10"
            value={euphoria}
            onChange={(e) => setEuphoria(e.target.value === '' ? '' : parseInt(e.target.value))}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="irritability">Irritabilidade (1-10)</Label>
          <Input
            id="irritability"
            type="number"
            min="1"
            max="10"
            value={irritability}
            onChange={(e) => setIrritability(e.target.value === '' ? '' : parseInt(e.target.value))}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="obsessions">Obsessões (1-10)</Label>
          <Input
            id="obsessions"
            type="number"
            min="1"
            max="10"
            value={obsessions}
            onChange={(e) => setObsessions(e.target.value === '' ? '' : parseInt(e.target.value))}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="sensorySensitivity">Sensibilidade Sensorial (1-10)</Label>
          <Input
            id="sensorySensitivity"
            type="number"
            min="1"
            max="10"
            value={sensorySensitivity}
            onChange={(e) => setSensorySensitivity(e.target.value === '' ? '' : parseInt(e.target.value))}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="socialMasking">Mascaramento Social (1-10)</Label>
          <Input
            id="socialMasking"
            type="number"
            min="1"
            max="10"
            value={socialMasking}
            onChange={(e) => setSocialMasking(e.target.value === '' ? '' : parseInt(e.target.value))}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="suicideRisk">Risco de Suicídio (1-10)</Label>
          <Input
            id="suicideRisk"
            type="number"
            min="1"
            max="10"
            value={suicideRisk}
            onChange={(e) => setSuicideRisk(e.target.value === '' ? '' : parseInt(e.target.value))}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="spravattoSessions">Sessões de Spravatto</Label>
          <Input
            id="spravattoSessions"
            type="number"
            value={spravattoSessions}
            onChange={(e) => setSpravattoSessions(e.target.value === '' ? '' : parseInt(e.target.value))}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="medicationsTaken"
          checked={medicationsTaken}
          onCheckedChange={setMedicationsTaken}
          disabled={isLoading}
        />
        <Label htmlFor="medicationsTaken">Medicações Tomadas</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="exercisesPerformed"
          checked={exercisesPerformed}
          onCheckedChange={setExercisesPerformed}
          disabled={isLoading}
        />
        <Label htmlFor="exercisesPerformed">Exercícios Realizados</Label>
      </div>

      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Adicione quaisquer notas adicionais aqui..."
          rows={4}
          disabled={isLoading}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Salvar Resposta
      </Button>
    </form>
  );
};

export default DailyResponseForm;