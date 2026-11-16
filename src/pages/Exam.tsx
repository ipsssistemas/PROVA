import { useEffect, useState, useCallback } from "react";
import BrandBackdrop from "@/components/BrandBackdrop";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ExamHeader from "@/components/ExamHeader";
import ExamIntro from "@/components/ExamIntro";
import QuestionCard from "@/components/QuestionCard";
import ExamCompletionModal from "@/components/ExamCompletionModal";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string | null;
  option_e: string | null;
  category: string;
}
interface ExamCredentials {
  token: string;
  candidateName: string;
  durationMinutes: number;
  totalQuestions: number;
  startedAt: string;
}
interface ExamSession {
  candidate_name: string;
  duration_minutes: number;
  started_at: string;
}

const Exam = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<ExamCredentials | null>(null);
  const [session, setSession] = useState<ExamSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [examFinished, setExamFinished] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let active = true;
    const loadExam = async () => {
      if (!sessionId) { setLoading(false); return; }
      const raw = sessionStorage.getItem(`prova_session_${sessionId}`);
      if (!raw) {
        toast({ title: "Sessão não encontrada neste navegador", description: "Por segurança, solicite à equipe um novo código de acesso.", variant: "destructive" });
        navigate("/", { replace: true });
        return;
      }
      try {
        const creds = JSON.parse(raw) as ExamCredentials;
        const { data, error } = await supabase.rpc("get_exam_questions", {
          p_session_id: sessionId,
          p_session_token: creds.token,
        });
        if (error) throw error;
        if (!data?.length) throw new Error("Nenhuma pergunta foi atribuída a esta prova.");
        if (!active) return;
        setCredentials(creds);
        setSession({
          candidate_name: creds.candidateName,
          duration_minutes: creds.durationMinutes,
          started_at: creds.startedAt,
        });
        setQuestions(data.map((q) => ({
          id: q.question_id,
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d || null,
          option_e: q.option_e || null,
          category: q.category,
        })));
      } catch (error) {
        toast({ title: "Não foi possível carregar a prova", description: error instanceof Error ? error.message : "Sessão inválida ou expirada.", variant: "destructive" });
        navigate("/", { replace: true });
      } finally {
        if (active) setLoading(false);
      }
    };
    loadExam();
    return () => { active = false; };
  }, [sessionId, navigate, toast]);

  const getRemainingSeconds = useCallback(() => {
    if (!session) return 0;
    const startedAt = new Date(session.started_at).getTime();
    return Math.max(0, Math.floor((session.duration_minutes * 60000 - (Date.now() - startedAt)) / 1000));
  }, [session]);

  const saveAnswer = async (questionId: number, option: string) => {
    if (!sessionId || !credentials || examFinished || saving) return;
    setSaving(true);
    const { error } = await supabase.rpc("submit_exam_answer", {
      p_session_id: sessionId,
      p_session_token: credentials.token,
      p_question_id: questionId,
      p_selected_option: option,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar resposta", description: error.message, variant: "destructive" });
      return;
    }
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const finishExam = async (wasTimedOut: boolean) => {
    if (examFinished || !sessionId || !credentials) return;
    setSaving(true);
    const { error } = await supabase.rpc("finish_exam", {
      p_session_id: sessionId,
      p_session_token: credentials.token,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Não foi possível finalizar", description: error.message, variant: "destructive" });
      return;
    }
    setTimedOut(wasTimedOut);
    setExamFinished(true);
    sessionStorage.removeItem(`prova_session_${sessionId}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-center space-y-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
      <p className="text-muted-foreground">Carregando prova...</p>
    </div></div>;
  }

  if (!session || !questions.length) {
    return <div className="min-h-screen flex items-center justify-center p-4">
      <p className="text-muted-foreground">Sessão não encontrada ou indisponível.</p>
    </div>;
  }

  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const options = [
    { key: "a", text: currentQ.option_a },
    { key: "b", text: currentQ.option_b },
    { key: "c", text: currentQ.option_c },
    ...(currentQ.option_d ? [{ key: "d", text: currentQ.option_d }] : []),
    ...(currentQ.option_e ? [{ key: "e", text: currentQ.option_e }] : []),
  ];

  return (
    <div className="brand-screen min-h-screen bg-background">
      <BrandBackdrop photo={false} />
      <ExamHeader candidateName={session.candidate_name} totalSeconds={getRemainingSeconds()}
        onTimeUp={() => finishExam(true)} />
      <main className="container max-w-2xl px-4 py-6">
        <ExamIntro durationMinutes={session.duration_minutes} />
        <div className="mb-4 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{answeredCount} de {questions.length} respondidas</span><span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
        <QuestionCard questionNumber={currentQuestion + 1} totalQuestions={questions.length}
          questionText={currentQ.question_text} options={options}
          selectedOption={answers[currentQ.id] || null} category={currentQ.category}
          onAnswer={(opt) => saveAnswer(currentQ.id, opt)} disabled={examFinished || saving} />
        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0 || saving}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
          </Button>
          {currentQuestion === questions.length - 1 ? (
            <Button onClick={() => finishExam(false)} disabled={examFinished || saving}
              className="bg-exam-success hover:bg-exam-success/90 text-accent-foreground">
              <Send className="h-4 w-4 mr-1" /> Finalizar Prova
            </Button>
          ) : (
            <Button onClick={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={saving}>Próxima <ChevronRight className="h-4 w-4 ml-1" /></Button>
          )}
        </div>
        <div className="mt-6 p-4 rounded-lg border bg-card">
          <p className="text-xs text-muted-foreground mb-2">Navegação rápida:</p>
          <div className="flex flex-wrap gap-1.5">
            {questions.map((q, i) => <button key={q.id} onClick={() => setCurrentQuestion(i)}
              disabled={saving}
              className={`h-8 w-8 rounded text-xs font-medium transition-colors ${currentQuestion === i
                ? "bg-primary text-primary-foreground"
                : answers[q.id] ? "bg-exam-success/20 text-exam-success border border-exam-success/30"
                : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{i + 1}</button>)}
          </div>
        </div>
      </main>
      <ExamCompletionModal open={examFinished} candidateName={session.candidate_name} timedOut={timedOut} />
    </div>
  );
};
export default Exam;




