import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { LogOut, Users, Trophy, Clock, ChevronDown, ChevronUp, KeyRound, BookOpen, Eye } from "lucide-react";

interface ExamSession {
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

interface Answer {
  question_id: number;
  selected_option: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  category: string;
  question_text: string;
  correct_option: string;
}

const CHART_COLORS = [
  "hsl(210, 100%, 45%)",
  "hsl(160, 70%, 40%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 60%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(190, 80%, 42%)",
  "hsl(120, 50%, 40%)",
  "hsl(330, 70%, 50%)",
];

const AdminResults = () => {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, Answer[]>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
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

      const [sessRes, qRes] = await Promise.all([
        supabase.from("exam_sessions").select("*").order("created_at", { ascending: false }),
        supabase.from("questions").select("id, category, question_text, correct_option").order("id"),
      ]);

      setSessions((sessRes.data as ExamSession[]) || []);
      setQuestions((qRes.data as Question[]) || []);
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  const toggleSession = async (sessionId: string) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
      return;
    }
    setExpandedSession(sessionId);
    if (!sessionAnswers[sessionId]) {
      const { data } = await supabase
        .from("answers")
        .select("question_id, selected_option, is_correct")
        .eq("session_id", sessionId);
      setSessionAnswers((prev) => ({ ...prev, [sessionId]: (data as Answer[]) || [] }));
    }
  };

  const getCategoryStats = (answers: Answer[]) => {
    const stats: Record<string, { correct: number; total: number }> = {};
    answers.forEach((a) => {
      const q = questions.find((q) => q.id === a.question_id);
      if (!q) return;
      if (!stats[q.category]) stats[q.category] = { correct: 0, total: 0 };
      stats[q.category].total++;
      if (a.is_correct) stats[q.category].correct++;
    });
    return Object.entries(stats).map(([category, s]) => ({
      category: category.replace("Interruptor ", "Int. "),
      acertos: s.correct,
      erros: s.total - s.correct,
      total: s.total,
      pct: Math.round((s.correct / s.total) * 100),
    }));
  };

  const getGlobalStats = () => {
    const completed = sessions.filter((s) => s.status === "completed" || s.status === "timed_out");
    const avgScore = completed.length
      ? Math.round(completed.reduce((sum, s) => sum + (s.score || 0), 0) / completed.length)
      : 0;
    return {
      total: sessions.length,
      completed: completed.length,
      avgScore,
      avgPct: completed.length ? Math.round((avgScore / 30) * 100) : 0,
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-exam-success/20 text-exam-success border-exam-success/30">Concluída</Badge>;
      case "timed_out": return <Badge variant="destructive">Tempo esgotado</Badge>;
      case "in_progress": return <Badge variant="secondary">Em andamento</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const globalPieData = () => {
    const completed = sessions.filter((s) => s.status === "completed").length;
    const timedOut = sessions.filter((s) => s.status === "timed_out").length;
    const inProgress = sessions.filter((s) => s.status === "in_progress").length;
    return [
      { name: "Concluídas", value: completed },
      { name: "Tempo esgotado", value: timedOut },
      { name: "Em andamento", value: inProgress },
    ].filter((d) => d.value > 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const stats = getGlobalStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container max-w-6xl px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold font-['Space_Grotesk']">Smart Home Premium</h1>
            <p className="text-xs text-muted-foreground">Painel de Resultados</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/questions")}>
              <BookOpen className="h-4 w-4 mr-1" /> Perguntas
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/codes")}>
              <KeyRound className="h-4 w-4 mr-1" /> Códigos
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs">Total Provas</span>
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Trophy className="h-4 w-4" />
                <span className="text-xs">Finalizadas</span>
              </div>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Trophy className="h-4 w-4 text-exam-success" />
                <span className="text-xs">Média</span>
              </div>
              <p className="text-2xl font-bold">{stats.avgScore}/30</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs">% Média</span>
              </div>
              <p className="text-2xl font-bold">{stats.avgPct}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Global Pie Chart */}
        {sessions.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Status das Provas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={globalPieData()} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {globalPieData().map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sessions List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold font-['Space_Grotesk']">Provas Realizadas</h2>
          {sessions.map((session) => (
            <Card key={session.id} className="overflow-hidden">
              <button
                onClick={() => toggleSession(session.id)}
                className="w-full text-left p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{session.candidate_name}</span>
                    {getStatusBadge(session.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{session.candidate_email}</p>
                   <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                     <span>Nota: {session.score ?? "—"}/{session.total_questions}</span>
                     <span>{new Date(session.started_at).toLocaleDateString("pt-BR")} {new Date(session.started_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={(e) => { e.stopPropagation(); navigate(`/admin/review/${session.id}`); }}
                   >
                     <Eye className="h-4 w-4 mr-1" />
                     Ver Prova
                   </Button>
                   {expandedSession === session.id ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
              </button>

              {expandedSession === session.id && sessionAnswers[session.id] && (
                <div className="border-t p-4 space-y-4">
                  {/* Category Chart */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Desempenho por Categoria</h3>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getCategoryStats(sessionAnswers[session.id])} layout="vertical" margin={{ left: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, "dataMax"]} />
                          <YAxis type="category" dataKey="category" width={80} tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(value: number, name: string) => [value, name === "acertos" ? "Acertos" : "Erros"]} />
                          <Bar dataKey="acertos" stackId="a" fill="hsl(160, 70%, 40%)" name="Acertos" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="erros" stackId="a" fill="hsl(0, 72%, 51%)" name="Erros" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Detailed answers */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Respostas Detalhadas</h3>
                    <div className="space-y-1 max-h-72 overflow-y-auto">
                      {sessionAnswers[session.id]
                        .sort((a, b) => a.question_id - b.question_id)
                        .map((ans) => {
                          const q = questions.find((q) => q.id === ans.question_id);
                          return (
                            <div key={ans.question_id} className={`flex items-start gap-2 p-2 rounded text-xs ${ans.is_correct ? "bg-exam-success/10" : "bg-destructive/10"}`}>
                              <span className={`shrink-0 font-mono font-bold ${ans.is_correct ? "text-exam-success" : "text-destructive"}`}>
                                {ans.is_correct ? "✓" : "✗"}
                              </span>
                              <div className="min-w-0">
                                <p className="font-medium truncate">Q{ans.question_id}: {q?.question_text?.slice(0, 80)}...</p>
                                <p className="text-muted-foreground">
                                  Resposta: <span className="font-semibold">{ans.selected_option.toUpperCase()}</span>
                                  {!ans.is_correct && <span> | Correta: <span className="font-semibold text-exam-success">{q?.correct_option.toUpperCase()}</span></span>}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}

          {sessions.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma prova realizada ainda.
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminResults;
