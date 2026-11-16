import { useEffect, useState } from "react";
import BrandBackdrop from "@/components/BrandBackdrop";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Pencil, Trash2, LogOut, Loader2, ClipboardList } from "lucide-react";

const CATEGORIES = [
  "Interruptor Wi-Fi","Interruptor Zigbee","Controlador Universal","Fechadura Digital",
  "Interfone Inteligente","Fita de LED","Sensor de Presença","Sensor de Movimento",
  "Tomada Inteligente","Câmera de Segurança","Assistente de Voz","Lâmpada Inteligente",
  "Cortina Motorizada","Gateway/Hub","Sirene Inteligente","Detector de Fumaça",
  "Sensor Porta/Janela","Roteador Mesh"
];

type ExamType = {
  id: string; name: string; description: string | null;
  duration_minutes: number; question_count: number; is_active: boolean;
};
const blank = { name: "", description: "", duration_minutes: "45", question_count: "30", categories: [] as string[] };

export default function AdminExamTypes() {
  const [items, setItems] = useState<ExamType[]>([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const load = async () => {
    const { data, error } = await supabase.from("exam_types").select("*").order("name");
    if (error) toast({ title: "Erro ao carregar tipos", description: error.message, variant: "destructive" });
    setItems((data || []) as ExamType[]);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/admin"); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (!roles?.some((r: any) => r.role === "admin")) { await supabase.auth.signOut(); navigate("/admin"); return; }
      await load();
    })();
  }, [navigate]);

  const openEdit = async (item: ExamType) => {
    const { data } = await supabase.from("exam_type_categories").select("category").eq("exam_type_id", item.id);
    setEditing(item.id);
    setForm({ name: item.name, description: item.description || "", duration_minutes: String(item.duration_minutes), question_count: String(item.question_count), categories: (data || []).map(x => x.category) });
  };
  const openNew = () => { setEditing(null); setForm(blank); };

  const save = async () => {
    const duration = Number(form.duration_minutes), count = Number(form.question_count);
    if (!form.name.trim() || !Number.isInteger(duration) || duration < 1 || duration > 600 || !Number.isInteger(count) || count < 1 || count > 500 || form.categories.length === 0) {
      toast({ title: "Confira os dados", description: "Informe nome, duração, quantidade e pelo menos uma categoria.", variant: "destructive" }); return;
    }
    setSaving(true);
    let typeId = editing;
    if (editing) {
      const { error } = await supabase.from("exam_types").update({ name: form.name.trim(), description: form.description.trim() || null, duration_minutes: duration, question_count: count, updated_at: new Date().toISOString() }).eq("id", editing);
      if (error) { toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" }); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from("exam_types").insert({ name: form.name.trim(), description: form.description.trim() || null, duration_minutes: duration, question_count: count }).select("id").single();
      if (error || !data) { toast({ title: "Erro ao criar tipo", description: error?.message, variant: "destructive" }); setSaving(false); return; }
      typeId = data.id;
    }
    const { error: deleteError } = await supabase.from("exam_type_categories").delete().eq("exam_type_id", typeId!);
    if (deleteError) { toast({ title: "Erro ao atualizar categorias", description: deleteError.message, variant: "destructive" }); setSaving(false); return; }
    const { error: insertError } = await supabase.from("exam_type_categories").insert(form.categories.map(category => ({ exam_type_id: typeId!, category })));
    if (insertError) { toast({ title: "Erro ao salvar categorias", description: insertError.message, variant: "destructive" }); setSaving(false); return; }
    toast({ title: editing ? "Tipo de prova atualizado" : "Tipo de prova criado" });
    setForm(blank); setEditing(null); setSaving(false); await load();
  };

  const remove = async (item: ExamType) => {
    if (!confirm("Excluir este tipo de prova? Códigos e provas já realizados não devem ser apagados.")) return;
    const { error } = await supabase.from("exam_types").delete().eq("id", item.id);
    if (error) { toast({ title: "Não foi possível excluir", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Tipo de prova excluído" }); await load();
  };
  const logout = async () => { await supabase.auth.signOut(); navigate("/admin"); };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  return <div className="brand-screen min-h-screen bg-background">
      <BrandBackdrop />
    <header className="border-b bg-card sticky top-0 z-10"><div className="container max-w-5xl px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={() => navigate("/admin/results")}><ArrowLeft className="h-4 w-4" /></Button><div><h1 className="font-bold">Smart Home Premium</h1><p className="text-xs text-muted-foreground">Tipos de Prova</p></div></div>
      <Button variant="outline" size="sm" onClick={logout}><LogOut className="h-4 w-4 mr-1" /> Sair</Button>
    </div></header>
    <main className="container max-w-5xl px-4 py-6 space-y-5">
      <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Gerenciar tipos de prova</h2><p className="text-sm text-muted-foreground">Cada tipo possui categorias, quantidade e duração independentes.</p></div><Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Novo tipo</Button></div>
      <Card><CardContent className="p-4 space-y-4">
        <h3 className="font-semibold">{editing ? "Editar tipo" : "Criar tipo de prova"}</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><Label>Nome do tipo</Label><Input className="mt-1" value={form.name} onChange={e => setForm(f => ({...f,name:e.target.value}))} placeholder="Ex.: Segurança" /></div>
          <div className="grid grid-cols-2 gap-2"><div><Label>Duração (minutos)</Label><Input type="number" min="1" max="600" className="mt-1" value={form.duration_minutes} onChange={e => setForm(f => ({...f,duration_minutes:e.target.value}))} /></div><div><Label>Quantidade de perguntas</Label><Input type="number" min="1" max="500" className="mt-1" value={form.question_count} onChange={e => setForm(f => ({...f,question_count:e.target.value}))} /></div></div>
        </div>
        <div><Label>Descrição (opcional)</Label><Textarea className="mt-1" value={form.description} onChange={e => setForm(f => ({...f,description:e.target.value}))} /></div>
        <div><Label>Categorias que podem compor esta prova</Label><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
          {CATEGORIES.map(category => <label key={category} className="flex items-center gap-2 text-sm border rounded-md p-2"><Checkbox checked={form.categories.includes(category)} onCheckedChange={v => setForm(f => ({...f,categories:v ? [...f.categories,category] : f.categories.filter(c=>c!==category)}))} />{category}</label>)}
        </div></div>
        <div className="flex gap-2"><Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}{editing ? "Salvar alterações" : "Criar tipo"}</Button>{editing && <Button variant="outline" onClick={openNew}>Cancelar edição</Button>}</div>
      </CardContent></Card>
      <div className="space-y-3">{items.map(item => <Card key={item.id}><CardContent className="p-4 flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2 flex-wrap"><h3 className="font-semibold">{item.name}</h3><Badge variant="secondary">{item.question_count} perguntas</Badge><Badge variant="outline">{item.duration_minutes} min</Badge></div><p className="text-sm text-muted-foreground mt-1">{item.description}</p><p className="text-xs text-muted-foreground mt-2">{/* category labels are displayed from saved relation below */}Configuração independente por tipo</p></div><div className="flex gap-1 shrink-0"><Button variant="outline" size="icon" onClick={() => openEdit(item)} title="Editar"><Pencil className="h-4 w-4" /></Button><Button variant="outline" size="icon" onClick={() => remove(item)} title="Excluir"><Trash2 className="h-4 w-4" /></Button></div></CardContent></Card>)}</div>
      {items.length===0 && <Card><CardContent className="py-10 text-center text-muted-foreground"><ClipboardList className="mx-auto mb-2" />Nenhum tipo cadastrado.</CardContent></Card>}
    </main>
  </div>;
}




