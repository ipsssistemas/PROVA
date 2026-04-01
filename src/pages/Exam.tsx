import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
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
  correct_option: string;
  category: string;
}

interface Session {
  id: string;
  candidate_name: string;
  candidate_email: string;
  duration_minutes: number;
  started_at: string;
  status: string;
}

const Exam = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [examFinished, setExamFinished] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadExam = async () => {
      if (!sessionId) return;

      const { data: sess } = await supabase
        .from("exam_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (!sess || sess.status !== "in_progress") {
        setExamFinished(true);
        setSession(sess as Session);
        setLoading(false);
        return;
      }

      setSession(sess as Session);

      // Load questions assigned to this session
      const { data: sessionQs } = await supabase
        .from("exam_session_questions")
        .select("question_id, question_order")
        .eq("session_id", sessionId)
        .order("question_order");

      if (sessionQs && sessionQs.length > 0) {
        const questionIds = sessionQs.map((sq: any) => sq.question_id);
        const { data: qs } = await supabase
          .from("questions")
          .select("*")
          .in("id", questionIds);

        // Sort by the order defined in exam_session_questions
        const orderMap = new Map(sessionQs.map((sq: any) => [sq.question_id, sq.question_order]));
        const sorted = (qs || []).sort((a: any, b: any) => 
          (orderMap.get(a.id) || 0) - (orderMap.get(b.id) || 0)
        );
        setQuestions(sorted as Question[]);
      } else {
        // Fallback for old sessions without assigned questions
        const { data: qs } = await supabase
          .from("questions")
          .select("*")
          .order("id")
          .limit(30);
        setQuestions((qs as Question[]) || []);
      }

      setQuestions((qs as Question[]) || []);

      // Load existing answers
      const { data: existingAnswers } = await supabase
        .from("answers")
        .select("question_id, selected_option")
        .eq("session_id", sessionId);

      if (existingAnswers) {
        const map: Record<number, string> = {};
        existingAnswers.forEach((a: any) => {
          map[a.question_id] = a.selected_option;
        });
        setAnswers(map);
      }

      setLoading(false);
    };

    loadExam();
  }, [sessionId]);

  const getRemainingSeconds = useCallback(() => {
    if (!session) return 0;
    const startedAt = new Date(session.started_at).getTime();
    const durationMs = session.duration_minutes * 60 * 1000;
    const elapsed = Date.now() - startedAt;
    return Math.max(0, Math.floor((durationMs - elapsed) / 1000));
  }, [session]);

  const saveAnswer = async (questionId: number, option: string) => {
    if (!sessionId || examFinished) return;

    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const isCorrect = option === question.correct_option;

    setAnswers((prev) => ({ ...prev, [questionId]: option }));

    // Upsert answer
    const { error } = await supabase
      .from("answers")
      .upsert(
        {
          session_id: sessionId,
          question_id: questionId,
          selected_option: option,
          is_correct: isCorrect,
        },
        { onConflict: "session_id,question_id" }
      );

    if (error) {
      toast({ title: "Erro ao salvar resposta", variant: "destructive" });
    }
  };

  const finishExam = async (wasTimedOut: boolean) => {
    if (examFinished || !sessionId) return;
    setExamFinished(true);
    setTimedOut(wasTimedOut);

    // Calculate score
    const { data: allAnswers } = await supabase
      .from("answers")
      .select("is_correct")
      .eq("session_id", sessionId);

    const score = allAnswers?.filter((a: any) => a.is_correct).length || 0;

    await supabase
      .from("exam_sessions")
      .update({
        status: wasTimedOut ? "timed_out" : "completed",
        finished_at: new Date().toISOString(),
        score,
      })
      .eq("id", sessionId);

    // Trigger email (will be handled by edge function later)
    try {
      await supabase.functions.invoke("send-exam-results", {
        body: { sessionId },
      });
    } catch {
      // Email will be sent later
    }
  };

  const handleTimeUp = () => {
    finishExam(true);
  };

  const handleSubmit = () => {
    finishExam(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Carregando prova...</p>
        </div>
      </div>
    );
  }

  if (!session || !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-muted-foreground">Sessão não encontrada.</p>
      </div>
    );
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
    <div className="min-h-screen bg-background">
      <ExamHeader
        candidateName={session.candidate_name}
        totalSeconds={getRemainingSeconds()}
        onTimeUp={handleTimeUp}
      />

      <main className="container max-w-2xl px-4 py-6">
        <ExamIntro durationMinutes={session.duration_minutes} />

        {/* Progress */}
        <div className="mb-4 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{answeredCount} de {questions.length} respondidas</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Question */}
        <QuestionCard
          questionNumber={currentQuestion + 1}
          totalQuestions={questions.length}
          questionText={currentQ.question_text}
          options={options}
          selectedOption={answers[currentQ.id] || null}
          category={currentQ.category}
          onAnswer={(opt) => saveAnswer(currentQ.id, opt)}
          disabled={examFinished}
        />

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={examFinished}
              className="bg-exam-success hover:bg-exam-success/90 text-accent-foreground"
            >
              <Send className="h-4 w-4 mr-1" />
              Finalizar Prova
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>

        {/* Question navigator */}
        <div className="mt-6 p-4 rounded-lg border bg-card">
          <p className="text-xs text-muted-foreground mb-2">Navegação rápida:</p>
          <div className="flex flex-wrap gap-1.5">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(i)}
                className={`h-8 w-8 rounded text-xs font-medium transition-colors ${
                  currentQuestion === i
                    ? "bg-primary text-primary-foreground"
                    : answers[q.id]
                    ? "bg-exam-success/20 text-exam-success border border-exam-success/30"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </main>

      <ExamCompletionModal
        open={examFinished}
        candidateName={session.candidate_name}
        timedOut={timedOut}
      />
    </div>
  );
};

export default Exam;
