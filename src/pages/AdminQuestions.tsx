import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LogOut,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Loader2,
  Search,
  BookOpen,
} from "lucide-react";

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

const CATEGORIES = [
  "Interruptor Wi-Fi",
  "Interruptor Zigbee",
  "Controlador Universal",
  "Fechadura Digital",
  "Interfone Inteligente",
  "Fita de LED",
  "Sensor de Presença",
  "Sensor de Movimento",
  "Tomada Inteligente",
  "Câmera de Segurança",
  "Assistente de Voz",
  "Lâmpada Inteligente",
  "Cortina Motorizada",
  "Gateway/Hub",
  "Sirene Inteligente",
  "Detector de Fumaça",
  "Sensor Porta/Janela",
  "Roteador Mesh",
];

const emptyForm = {
  question_text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  option_e: "",
  correct_option: "a",
  category: CATEGORIES[0],
};

const AdminQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadQuestions = async () => {
    const { data } = await supabase
      .from("questions")
      .select("*")
      .order("id");
    setQuestions((data as Question[]) || []);
    setLoading(false);
  };

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
      await loadQuestions();
    };
    checkAuth();
  }, [navigate]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowDialog(true);
  };

  const openEdit = (q: Question) => {
    setEditingId(q.id);
    setForm({
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d || "",
      option_e: q.option_e || "",
      correct_option: q.correct_option,
      category: q.category,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.question_text.trim() || !form.option_a.trim() || !form.option_b.trim() || !form.option_c.trim()) {
      toast({ title: "Preencha pelo menos a pergunta e opções A, B e C", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      question_text: form.question_text.trim(),
      option_a: form.option_a.trim(),
      option_b: form.option_b.trim(),
      option_c: form.option_c.trim(),
      option_d: form.option_d.trim() || null,
      option_e: form.option_e.trim() || null,
      correct_option: form.correct_option,
      category: form.category,
    };

    if (editingId) {
      const { error } = await supabase.from("questions").update(payload).eq("id", editingId);
      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      toast({ title: "Pergunta atualizada!" });
    } else {
      const { error } = await supabase.from("questions").insert(payload);
      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      toast({ title: "Pergunta criada!" });
    }

    setShowDialog(false);
    setSaving(false);
    await loadQuestions();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta pergunta?")) return;
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Pergunta excluída" });
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  const filtered = questions.filter((q) => {
    const matchSearch = !search || q.question_text.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || q.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const categoryCounts = questions.reduce((acc, q) => {
    acc[q.category] = (acc[q.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/results")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold font-['Space_Grotesk']">Smart Home Premium</h1>
              <p className="text-xs text-muted-foreground">Banco de Perguntas</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" /> Sair
          </Button>
        </div>
      </header>

      <main className="container max-w-6xl px-4 py-6 space-y-4">
        {/* Stats */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">{questions.length} perguntas</span>
          </div>
          <Badge variant="secondary">{Object.keys(categoryCounts).length} categorias</Badge>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pergunta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {CATEGORIES.filter((c) => categoryCounts[c]).map((c) => (
                <SelectItem key={c} value={c}>{c} ({categoryCounts[c]})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Nova Pergunta
          </Button>
        </div>

        {/* Questions List */}
        <div className="space-y-2">
          {filtered.map((q) => (
            <Card key={q.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="text-xs shrink-0 bg-primary/10 text-primary border-primary/20">
                        #{q.id}
                      </Badge>
                      <Badge variant="outline" className="text-xs shrink-0">{q.category}</Badge>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        Resp: {q.correct_option.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm leading-snug">{q.question_text}</p>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-muted-foreground">
                      <span><strong>A:</strong> {q.option_a.slice(0, 60)}{q.option_a.length > 60 ? "..." : ""}</span>
                      <span><strong>B:</strong> {q.option_b.slice(0, 60)}{q.option_b.length > 60 ? "..." : ""}</span>
                      <span><strong>C:</strong> {q.option_c.slice(0, 60)}{q.option_c.length > 60 ? "..." : ""}</span>
                      {q.option_d && <span><strong>D:</strong> {q.option_d.slice(0, 60)}{q.option_d.length > 60 ? "..." : ""}</span>}
                      {q.option_e && <span><strong>E:</strong> {q.option_e.slice(0, 60)}{q.option_e.length > 60 ? "..." : ""}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="outline" size="icon" onClick={() => openEdit(q)} title="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(q.id)}
                      className="text-destructive hover:text-destructive"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Nenhuma pergunta encontrada.
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? `Editar Pergunta #${editingId}` : "Nova Pergunta"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Atualize os campos da pergunta. O número da pergunta não será alterado." : "Preencha os dados da nova pergunta."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Resposta Correta</Label>
                <Select value={form.correct_option} onValueChange={(v) => setForm((f) => ({ ...f, correct_option: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["a", "b", "c", "d", "e"].map((o) => (
                      <SelectItem key={o} value={o}>{o.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Pergunta *</Label>
              <Textarea
                value={form.question_text}
                onChange={(e) => setForm((f) => ({ ...f, question_text: e.target.value }))}
                className="mt-1 min-h-[80px]"
                placeholder="Digite a pergunta..."
              />
            </div>

            {(["a", "b", "c", "d", "e"] as const).map((letter) => {
              const key = `option_${letter}` as keyof typeof form;
              const required = ["a", "b", "c"].includes(letter);
              return (
                <div key={letter}>
                  <Label>Opção {letter.toUpperCase()} {required ? "*" : "(opcional)"}</Label>
                  <Textarea
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="mt-1 min-h-[50px]"
                    placeholder={`Opção ${letter.toUpperCase()}...`}
                  />
                </div>
              );
            })}

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              {editingId ? "Salvar Alterações" : "Criar Pergunta"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminQuestions;
