import { useEffect, useMemo, useState } from "react";
import BrandBackdrop from "@/components/BrandBackdrop";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, Plus, Pencil, Trash2, ArrowLeft, ArrowRightLeft, Copy, Loader2, Search, BookOpen } from "lucide-react";

type ExamType = { id: string; name: string };
type Difficulty = { id: string; name: string; sort_order: number };
type ExamCategory = { exam_type_id: string; category: string };
type Question = {
  id: number; question_text: string; option_a: string; option_b: string; option_c: string;
  option_d: string | null; option_e: string | null; correct_option: string; category: string;
  exam_type_id: string; difficulty_level_id: string;
};
const blank = {
  question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", option_e: "",
  correct_option: "a", exam_type_id: "", category: "", difficulty_level_id: "",
};

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(blank);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadAll = async () => {
    const [q, t, c, d] = await Promise.all([
      supabase.from("questions").select("*").order("id"),
      supabase.from("exam_types").select("id,name").order("name"),
      supabase.from("exam_type_categories").select("exam_type_id,category").order("category"),
      supabase.from("difficulty_levels").select("id,name,sort_order").order("sort_order"),
    ]);
    if (q.error || t.error || c.error || d.error) {
      toast({ title: "Erro ao carregar banco de perguntas", description: q.error?.message || t.error?.message || c.error?.message || d.error?.message, variant: "destructive" });
    }
    setQuestions((q.data || []) as Question[]);
    setExamTypes(t.data || []);
    setCategories(c.data || []);
    setDifficulties(d.data || []);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/admin"); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (!roles?.some((r: any) => r.role === "admin")) {
        await supabase.auth.signOut(); navigate("/admin"); return;
      }
      await loadAll();
    })();
  }, [navigate]);

  const availableCategories = useMemo(
    () => categories.filter(c => c.exam_type_id === form.exam_type_id).map(c => c.category),
    [categories, form.exam_type_id]
  );

  const openCreate = () => {
    const typeId = examTypes[0]?.id || "";
    const category = categories.find(c => c.exam_type_id === typeId)?.category || "";
    setEditingId(null);
    setForm({ ...blank, exam_type_id: typeId, category, difficulty_level_id: difficulties[0]?.id || "" });
    setShowDialog(true);
  };

  const openEdit = (q: Question) => {
    setEditingId(q.id);
    setForm({
      question_text: q.question_text, option_a: q.option_a, option_b: q.option_b, option_c: q.option_c,
      option_d: q.option_d || "", option_e: q.option_e || "", correct_option: q.correct_option,
      exam_type_id: q.exam_type_id, category: q.category, difficulty_level_id: q.difficulty_level_id,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.question_text.trim() || !form.option_a.trim() || !form.option_b.trim() || !form.option_c.trim() ||
      !form.exam_type_id || !form.category || !form.difficulty_level_id) {
      toast({ title: "Preencha a pergunta, opções A/B/C, tipo, categoria e dificuldade", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      question_text: form.question_text.trim(), option_a: form.option_a.trim(), option_b: form.option_b.trim(),
      option_c: form.option_c.trim(), option_d: form.option_d.trim() || null, option_e: form.option_e.trim() || null,
      correct_option: form.correct_option, exam_type_id: form.exam_type_id, category: form.category,
      difficulty_level_id: form.difficulty_level_id,
    };
    const result = editingId
      ? await supabase.from("questions").update(payload).eq("id", editingId)
      : await supabase.from("questions").insert(payload);
    if (result.error) {
      toast({ title: editingId ? "Erro ao atualizar" : "Erro ao criar", description: result.error.message, variant: "destructive" });
      setSaving(false); return;
    }
    toast({ title: editingId ? "Pergunta atualizada!" : "Pergunta criada!" });
    setShowDialog(false); setSaving(false); await loadAll();
  };

  const chooseTarget = async (current: string) => {
    const entered = window.prompt("Digite exatamente a categoria de destino:\n" + [...new Set(categories.map(c => c.category))].join("\n"), current);
    if (!entered) return null;
    const target = [...new Set(categories.map(c => c.category))].find(c => c.toLowerCase() === entered.trim().toLowerCase());
    if (!target) toast({ title: "Categoria não reconhecida", variant: "destructive" });
    return target || null;
  };

  const handleMoveCategory = async (q: Question) => {
    const target = await chooseTarget(q.category);
    if (!target || target === q.category) return;
    const valid = categories.find(c => c.exam_type_id === q.exam_type_id && c.category === target);
    if (!valid) { toast({ title: "Categoria não pertence a este tipo de prova", description: "Edite o tipo de prova da pergunta para movê-la.", variant: "destructive" }); return; }
    const { error } = await supabase.from("questions").update({ category: target }).eq("id", q.id);
    if (error) { toast({ title: "Erro ao mover pergunta", description: error.message, variant: "destructive" }); return; }
    await loadAll();
  };

  const handleCopyCategory = async (q: Question) => {
    const target = await chooseTarget(q.category);
    if (!target) return;
    const valid = categories.find(c => c.exam_type_id === q.exam_type_id && c.category === target);
    if (!valid) { toast({ title: "Categoria não pertence a este tipo de prova", description: "A cópia deve permanecer em uma categoria permitida para o tipo atual.", variant: "destructive" }); return; }
    const { error } = await supabase.from("questions").insert({
      question_text: q.question_text, option_a: q.option_a, option_b: q.option_b, option_c: q.option_c,
      option_d: q.option_d, option_e: q.option_e, correct_option: q.correct_option, category: target,
      exam_type_id: q.exam_type_id, difficulty_level_id: q.difficulty_level_id,
    });
    if (error) { toast({ title: "Erro ao copiar pergunta", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Pergunta copiada", description: "A original foi preservada." }); await loadAll();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta pergunta?")) return;
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) { toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" }); return; }
    setQuestions(prev => prev.filter(q => q.id !== id));
    toast({ title: "Pergunta excluída" });
  };

  const filtered = questions.filter(q =>
    (!search || q.question_text.toLowerCase().includes(search.toLowerCase())) &&
    (filterType === "all" || q.exam_type_id === filterType) &&
    (filterCategory === "all" || q.category === filterCategory) &&
    (filterDifficulty === "all" || q.difficulty_level_id === filterDifficulty)
  );
  const typeName = (id: string) => examTypes.find(t => t.id === id)?.name || "Tipo não identificado";
  const difficultyName = (id: string) => difficulties.find(d => d.id === id)?.name || "Nível não identificado";
  const categoryOptions = filterType === "all" ? [...new Set(categories.map(c => c.category))] : categories.filter(c => c.exam_type_id === filterType).map(c => c.category);

  const logout = async () => { await supabase.auth.signOut(); navigate("/admin"); };
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return <div className="brand-screen min-h-screen bg-background">
      <BrandBackdrop />
    <header className="border-b bg-card sticky top-0 z-10"><div className="container max-w-6xl px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={() => navigate("/admin/results")}><ArrowLeft className="h-4 w-4" /></Button>
        <div><h1 className="text-lg font-bold font-['Space_Grotesk']">Smart Home Premium</h1><p className="text-xs text-muted-foreground">Banco de Perguntas</p></div></div>
      <Button variant="outline" size="sm" onClick={logout}><LogOut className="h-4 w-4 mr-1" /> Sair</Button>
    </div></header>
    <main className="container max-w-6xl px-4 py-6 space-y-4">
      <div className="flex items-center gap-4 flex-wrap"><div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /><span className="font-semibold text-lg">{questions.length} perguntas</span></div>
        <Badge variant="secondary">{examTypes.length} tipos de prova</Badge><Badge variant="outline">{difficulties.length} níveis de dificuldade</Badge></div>
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar pergunta..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <Select value={filterType} onValueChange={v => { setFilterType(v); setFilterCategory("all"); }}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo de prova" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os tipos</SelectItem>{examTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}><SelectTrigger className="w-[190px]"><SelectValue placeholder="Categoria" /></SelectTrigger><SelectContent><SelectItem value="all">Todas categorias</SelectItem>{categoryOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Dificuldade" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os níveis</SelectItem>{difficulties.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select>
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Pergunta</Button>
      </div>
      <div className="space-y-2">
        {filtered.map(q => <Card key={q.id}><CardContent className="p-4"><div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1 flex-wrap"><Badge className="text-xs">#{q.id}</Badge><Badge variant="outline" className="text-xs">{typeName(q.exam_type_id)}</Badge><Badge variant="outline" className="text-xs">{q.category}</Badge><Badge variant="secondary" className="text-xs">{difficultyName(q.difficulty_level_id)}</Badge><Badge variant="secondary" className="text-xs">Resp: {q.correct_option.toUpperCase()}</Badge></div>
            <p className="text-sm leading-snug">{q.question_text}</p><div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-muted-foreground"><span><strong>A:</strong> {q.option_a.slice(0,70)}</span><span><strong>B:</strong> {q.option_b.slice(0,70)}</span><span><strong>C:</strong> {q.option_c.slice(0,70)}</span>{q.option_d && <span><strong>D:</strong> {q.option_d.slice(0,70)}</span>}{q.option_e && <span><strong>E:</strong> {q.option_e.slice(0,70)}</span>}</div>
          </div><div className="flex gap-1 shrink-0"><Button variant="outline" size="icon" onClick={() => handleMoveCategory(q)} title="Mover categoria"><ArrowRightLeft className="h-4 w-4" /></Button><Button variant="outline" size="icon" onClick={() => handleCopyCategory(q)} title="Copiar pergunta"><Copy className="h-4 w-4" /></Button><Button variant="outline" size="icon" onClick={() => openEdit(q)} title="Editar"><Pencil className="h-4 w-4" /></Button><Button variant="outline" size="icon" onClick={() => handleDelete(q.id)} className="text-destructive" title="Excluir"><Trash2 className="h-4 w-4" /></Button></div>
        </div></CardContent></Card>)}
        {filtered.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhuma pergunta encontrada.</CardContent></Card>}
      </div>
    </main>
    <Dialog open={showDialog} onOpenChange={setShowDialog}><DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingId ? `Editar Pergunta #${editingId}` : "Nova Pergunta"}</DialogTitle><DialogDescription>Defina o tipo de prova, a categoria e o nível de dificuldade.</DialogDescription></DialogHeader>
      <div className="space-y-4 pt-2">
        <div className="grid sm:grid-cols-3 gap-3">
          <div><Label>Tipo de prova *</Label><Select value={form.exam_type_id} onValueChange={v => { const first = categories.find(c => c.exam_type_id === v)?.category || ""; setForm(f => ({...f,exam_type_id:v,category:first})); }}><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{examTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Categoria *</Label><Select value={form.category} onValueChange={v => setForm(f => ({...f,category:v}))}><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{availableCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Nível de dificuldade *</Label><Select value={form.difficulty_level_id} onValueChange={v => setForm(f => ({...f,difficulty_level_id:v}))}><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione o nível" /></SelectTrigger><SelectContent>{difficulties.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <div><Label>Pergunta *</Label><Textarea value={form.question_text} onChange={e => setForm(f => ({...f,question_text:e.target.value}))} className="mt-1 min-h-[80px]" placeholder="Digite a pergunta..." /></div>
        {(["a","b","c","d","e"] as const).map(letter => { const key = `option_${letter}` as keyof typeof form; const required = ["a","b","c"].includes(letter); return <div key={letter}><Label>Opção {letter.toUpperCase()} {required ? "*" : "(opcional)"}</Label><Textarea value={form[key] as string} onChange={e => setForm(f => ({...f,[key]:e.target.value}))} className="mt-1 min-h-[50px]" placeholder={`Opção ${letter.toUpperCase()}...`} /></div>; })}
        <div><Label>Resposta correta *</Label><Select value={form.correct_option} onValueChange={v => setForm(f => ({...f,correct_option:v}))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{["a","b","c","d","e"].map(o => <SelectItem key={o} value={o}>{o.toUpperCase()}</SelectItem>)}</SelectContent></Select></div>
        <Button onClick={handleSave} disabled={saving} className="w-full">{saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}{editingId ? "Salvar Alterações" : "Criar Pergunta"}</Button>
      </div>
    </DialogContent></Dialog>
  </div>;
}




