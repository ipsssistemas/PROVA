import { useEffect, useMemo, useState } from "react";
import BrandBackdrop from "@/components/BrandBackdrop";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, LogOut, Search, Users, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SessionRow {
  id: string;
  candidate_name: string;
  candidate_email: string;
  status: string;
  score: number | null;
  total_questions: number;
  started_at: string;
  finished_at: string | null;
  exam_type_id: string | null;
}
interface ExamTypeRow { id: string; name: string; }
interface SessionQuestionRow { session_id: string; question_id: number; }
interface QuestionRow { id: number; difficulty_level_id: string | null; }
interface DifficultyRow { id: string; name: string; sort_order: number; }

const AdminStudents = () => {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [examTypes, setExamTypes] = useState<ExamTypeRow[]>([]);
  const [sessionQuestions, setSessionQuestions] = useState<SessionQuestionRow[]>([]);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [difficulties, setDifficulties] = useState<DifficultyRow[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/admin"); return; }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    if (!roles?.some((r: any) => r.role === "admin")) {
      await supabase.auth.signOut();
      navigate("/admin");
      return;
    }

    const [sessionsRes, typesRes, sessionQuestionsRes, questionsRes, difficultiesRes] = await Promise.all([
      supabase.from("exam_sessions").select("id,candidate_name,candidate_email,status,score,total_questions,started_at,finished_at,exam_type_id").order("started_at", { ascending: false }),
      supabase.from("exam_types").select("id,name").order("name"),
      supabase.from("exam_session_questions").select("session_id,question_id"),
      supabase.from("questions").select("id,difficulty_level_id"),
      supabase.from("difficulty_levels").select("id,name,sort_order").order("sort_order"),
    ]);
    const failed = [sessionsRes, typesRes, sessionQuestionsRes, questionsRes, difficultiesRes].find((r) => r.error);
    if (failed?.error) {
      toast({ title: "Erro ao carregar alunos", description: failed.error.message, variant: "destructive" });
    }
    setSessions((sessionsRes.data || []) as SessionRow[]);
    setExamTypes((typesRes.data || []) as ExamTypeRow[]);
    setSessionQuestions((sessionQuestionsRes.data || []) as SessionQuestionRow[]);
    setQuestions((questionsRes.data || []) as QuestionRow[]);
    setDifficulties((difficultiesRes.data || []) as DifficultyRow[]);
    setLoading(false);
  };

  useEffect(() => { void loadData(); }, [navigate]);

  const examTypeById = useMemo(() => new Map(examTypes.map((t) => [t.id, t.name])), [examTypes]);
  const questionById = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions]);
  const difficultyById = useMemo(() => new Map(difficulties.map((d) => [d.id, d.name])), [difficulties]);

  const rows = useMemo(() => sessions.map((session) => {
    const ids = sessionQuestions.filter((sq) => sq.session_id === session.id).map((sq) => sq.question_id);
    const counts = new Map<string, number>();
    ids.forEach((id) => {
      const difficultyId = questionById.get(id)?.difficulty_level_id;
      const name = difficultyId ? difficultyById.get(difficultyId) : undefined;
      if (name) counts.set(name, (counts.get(name) || 0) + 1);
    });
    const breakdown = difficulties
      .map((d) => ({ name: d.name, count: counts.get(d.name) || 0 }))
      .filter((d) => d.count > 0);
    const difficultyLabel = breakdown.length === 0 ? "Não registrada"
      : breakdown.length === 1 ? breakdown[0].name
      : "Mista: " + breakdown.map((d) => `${d.name} ${d.count}`).join(" • ");
    return {
      ...session,
      examType: session.exam_type_id ? examTypeById.get(session.exam_type_id) || "Tipo não identificado" : "Não informado",
      difficultyLabel,
      difficultyNames: breakdown.map((d) => d.name),
      questionCount: ids.length || session.total_questions,
    };
  }), [sessions, sessionQuestions, questionById, difficultyById, difficulties, examTypeById]);

  const filteredRows = rows.filter((row) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || row.candidate_name?.toLowerCase().includes(term) || row.candidate_email?.toLowerCase().includes(term);
    const matchesType = typeFilter === "all" || row.exam_type === typeFilter;
    const matchesDifficulty = difficultyFilter === "all" || row.difficultyNames.includes(difficultyFilter);
    return matchesSearch && matchesType && matchesDifficulty;
  });

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/admin"); };
  const formatDate = (value: string) => new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  const statusLabel = (status: string) => status === "completed" ? "Concluída" : status === "timed_out" ? "Tempo esgotado" : status === "in_progress" ? "Em andamento" : status;

  return (
    <div className="brand-screen min-h-screen bg-background">
      <BrandBackdrop />
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/results")}><ArrowLeft className="h-4 w-4" /></Button>
            <div><h1 className="text-lg font-bold font-['Space_Grotesk']">Smart Home Premium</h1><p className="text-xs text-muted-foreground">Alunos e provas realizadas</p></div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void loadData()} disabled={loading}><RefreshCw className="h-4 w-4 mr-1" /> Atualizar</Button>
            <Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="h-4 w-4 mr-1" /> Sair</Button>
          </div>
        </div>
      </header>
      <main className="container max-w-7xl px-4 py-6 space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div><h2 className="text-xl font-semibold">Lista de Alunos</h2><p className="text-sm text-muted-foreground">{filteredRows.length} prova(s) encontrada(s)</p></div>
          <Badge variant="secondary" className="text-sm px-3 py-1"><Users className="h-4 w-4 mr-1" /> {sessions.length} registros</Badge>
        </div>
        <Card>
          <CardContent className="p-4 grid gap-3 md:grid-cols-3">
            <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Buscar aluno ou e-mail" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">Todos os testes</option>{examTypes.map((type) => <option key={type.id} value={type.name}>{type.name}</option>)}
            </select>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
              <option value="all">Todas as dificuldades</option>{difficulties.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </CardContent>
        </Card>
        {loading ? <div className="py-12 text-center text-muted-foreground">Carregando lista...</div> : (
          <Card>
            <CardHeader><CardTitle className="text-base">Histórico de avaliações</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-y bg-muted/40 text-left">
                    <th className="p-3 font-medium">Aluno</th><th className="p-3 font-medium">Data / hora</th><th className="p-3 font-medium">Teste</th><th className="p-3 font-medium">Dificuldade</th><th className="p-3 font-medium">Resultado</th><th className="p-3 font-medium">Perguntas</th><th className="p-3 font-medium">Status</th>
                  </tr></thead>
                  <tbody>
                    {filteredRows.map((row) => (
                      <tr key={row.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="p-3 min-w-48"><div className="font-medium">{row.candidate_name || "Nome não informado"}</div><div className="text-xs text-muted-foreground">{row.candidate_email}</div></td>
                        <td className="p-3 whitespace-nowrap">{formatDate(row.started_at)}</td>
                        <td className="p-3">{row.examType}</td>
                        <td className="p-3 min-w-40 text-xs">{row.difficultyLabel}</td>
                        <td className="p-3 whitespace-nowrap font-semibold">{row.score === null ? "—" : `${row.score} / ${row.total_questions}`}</td>
                        <td className="p-3 text-center">{row.questionCount}</td>
                        <td className="p-3"><Badge variant={row.status === "completed" ? "default" : row.status === "timed_out" ? "destructive" : "secondary"}>{statusLabel(row.status)}</Badge></td>
                      </tr>
                    ))}
                    {filteredRows.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Nenhum aluno encontrado com esses filtros.</td></tr>}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AdminStudents;




