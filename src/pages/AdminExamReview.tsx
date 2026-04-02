import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, XCircle, User, Clock, Trophy } from "lucide-react";

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

interface Answer {
  question_id: number;
  selected_option: string;
  is_correct: boolean;
}

interface Session {
  id: string;
  candidate_name: string;
  candidate_email: string;
  status: string;
  score: number | null;
  total_questions: number;
  duration_minutes: number;
  started_at: string;
  finished_at: string | null;
}

const AdminExamReview = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/admin"); return; }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (!roles?.some((r: any) => r.role === "admin")) {
        await supabase.auth.signOut();
        navigate("/admin");
        return;
      }

      if (!sessionId) return;

      const [sessRes, ansRes, sqRes] = await Promise.all([
        supabase.from("exam_sessions").select("*").eq("id", sessionId).single(),
        supabase.from("answers").select("question_id, selected_option, is_correct").eq("session_id", sessionId),
        supabase.from("exam_session_questions").select("question_id, question_order").eq("session_id", sessionId).order("question_order"),
      ]);

      if (!sessRes.data) { navigate("/admin/results"); return; }
      setSession(sessRes.data as Session);
      setAnswers((ansRes.data as Answer[]) || []);

      const questionIds = (sqRes.data || []).map((sq: any) => sq.question_id);
      if (questionIds.length > 0) {
        const { data: qData } = await supabase
          .from("questions")
          .select("*")
          .in("id", questionIds);

        // Sort by session order
        const orderMap = new Map((sqRes.data || []).map((sq: any) => [sq.question_id, sq.question_order]));
        const sorted = (qData || []).sort((a: any, b: any) => (orderMap.get(a.id) || 0) - (orderMap.get(b.id) || 0));
        setQuestions(sorted as Question[]);
      }

      setLoading(false);
    };
    load();
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) return null;

  const score = session.score ?? 0;
  const total = session.total_questions;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const statusLabel = session.status === "timed_out" ? "Tempo esgotado" : session.status === "completed" ? "Concluída" : "Em andamento";

  const getOptionLabel = (key: string) => key.toUpperCase();

  const getAnswer = (questionId: number) => answers.find((a) => a.question_id === questionId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container max-w-4xl px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/results")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold font-['Space_Grotesk'] truncate">Revisão da Prova</h1>
            <p className="text-xs text-muted-foreground truncate">{session.candidate_name}</p>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl px-4 py-6 space-y-6">
        {/* Candidate Info */}
        <Card>
          <CardContent className="pt-5 pb-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Candidato</p>
                  <p className="text-sm font-medium truncate">{session.candidate_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Resultado</p>
                  <p className="text-sm font-bold">{score}/{total} ({percentage}%)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Data</p>
                  <p className="text-sm">{new Date(session.started_at).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant={session.status === "completed" ? "default" : "destructive"} className="mt-0.5">
                  {statusLabel}
                </Badge>
              </div>
            </div>
            <Progress value={percentage} className="h-2" />
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold font-['Space_Grotesk']">
            Questões ({questions.length})
          </h2>

          {questions.map((q, index) => {
            const ans = getAnswer(q.id);
            const isCorrect = ans?.is_correct ?? false;
            const selectedOption = ans?.selected_option || null;
            const options = [
              { key: "a", text: q.option_a },
              { key: "b", text: q.option_b },
              { key: "c", text: q.option_c },
              ...(q.option_d ? [{ key: "d", text: q.option_d }] : []),
              ...(q.option_e ? [{ key: "e", text: q.option_e }] : []),
            ];

            return (
              <Card key={q.id} className={`border-l-4 ${isCorrect ? "border-l-exam-success" : ans ? "border-l-destructive" : "border-l-muted"}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-medium leading-relaxed">
                      <span className="text-muted-foreground mr-2">{index + 1}.</span>
                      {q.question_text}
                    </CardTitle>
                    <div className="shrink-0">
                      {ans ? (
                        isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-exam-success" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )
                      ) : (
                        <Badge variant="outline" className="text-xs">Sem resposta</Badge>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs w-fit">{q.category}</Badge>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {options.map((opt) => {
                    const isSelected = selectedOption === opt.key;
                    const isRight = q.correct_option === opt.key;
                    let className = "flex items-center gap-2 p-2.5 rounded-md text-sm border transition-colors ";

                    if (isRight) {
                      className += "bg-exam-success/10 border-exam-success/30 text-foreground";
                    } else if (isSelected && !isRight) {
                      className += "bg-destructive/10 border-destructive/30 text-foreground";
                    } else {
                      className += "bg-muted/30 border-transparent text-muted-foreground";
                    }

                    return (
                      <div key={opt.key} className={className}>
                        <span className={`font-mono font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          isRight ? "bg-exam-success text-white" : isSelected ? "bg-destructive text-white" : "bg-muted text-muted-foreground"
                        }`}>
                          {getOptionLabel(opt.key)}
                        </span>
                        <span className="flex-1">{opt.text}</span>
                        {isRight && <CheckCircle className="h-4 w-4 text-exam-success shrink-0" />}
                        {isSelected && !isRight && <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default AdminExamReview;
