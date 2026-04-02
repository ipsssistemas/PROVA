import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  LogOut,
  Plus,
  
  Trash2,
  KeyRound,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
} from "lucide-react";

interface AccessCode {
  id: string;
  code: string;
  candidate_name: string | null;
  candidate_email: string;
  exam_duration_minutes: number;
  is_used: boolean;
  created_at: string;
}

const generateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const AdminAccessCodes = () => {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    candidateName: "",
    candidateEmail: "",
    durationMinutes: "45",
    code: generateCode(),
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadCodes = async () => {
    const { data } = await supabase
      .from("access_codes")
      .select("*")
      .order("created_at", { ascending: false });
    setCodes((data as AccessCode[]) || []);
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

      await loadCodes();
    };
    checkAuth();
  }, [navigate]);

  const handleCreate = async () => {
    if (!form.candidateEmail.trim()) {
      toast({ title: "E-mail é obrigatório", variant: "destructive" });
      return;
    }

    setCreating(true);
    const { error } = await supabase.from("access_codes").insert({
      code: form.code,
      candidate_name: form.candidateName.trim() || null,
      candidate_email: form.candidateEmail.trim(),
      exam_duration_minutes: parseInt(form.durationMinutes) || 45,
    });

    if (error) {
      toast({ title: "Erro ao criar código", description: error.message, variant: "destructive" });
      setCreating(false);
      return;
    }

    toast({ title: "Código criado com sucesso!" });
    setShowCreate(false);
    setForm({ candidateName: "", candidateEmail: "", durationMinutes: "45", code: generateCode() });
    setCreating(false);
    await loadCodes();
  };


  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("access_codes").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Código excluído" });
    setCodes((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

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
              <p className="text-xs text-muted-foreground">Códigos de Acesso</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" /> Sair
          </Button>
        </div>
      </header>

      <main className="container max-w-6xl px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold font-['Space_Grotesk']">Gerenciar Códigos</h2>
          <Button onClick={() => setShowCreate(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Novo Código
          </Button>
        </div>

        {/* Codes List */}
        <div className="space-y-3">
          {codes.map((code) => (
            <Card key={code.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono font-bold text-primary text-sm tracking-wider">
                        {code.code}
                      </span>
                      <button
                        onClick={() => handleCopy(code.code, code.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedId === code.id ? (
                          <Check className="h-3.5 w-3.5 text-exam-success" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      {code.is_used ? (
                        <Badge variant="secondary">Usado</Badge>
                      ) : (
                        <Badge className="bg-exam-success/20 text-exam-success border-exam-success/30">
                          Disponível
                        </Badge>
                      )}
                    </div>
                    {code.candidate_name && (
                      <p className="text-sm font-medium">{code.candidate_name}</p>
                    )}
                    <p className="text-xs text-muted-foreground truncate">{code.candidate_email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {code.exam_duration_minutes} min •{" "}
                      {new Date(code.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleSendEmail(code)}
                      disabled={sendingEmail === code.id}
                      title="Enviar código por e-mail"
                    >
                      {sendingEmail === code.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(code.id)}
                      className="text-destructive hover:text-destructive"
                      title="Excluir código"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {codes.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <KeyRound className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Nenhum código criado ainda.</p>
                <Button className="mt-4" size="sm" onClick={() => setShowCreate(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Criar Primeiro Código
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Código de Acesso</DialogTitle>
            <DialogDescription>
              Crie um código para um candidato realizar a prova.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="code">Código</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="code"
                  value={form.code}
                  readOnly
                  className="font-mono tracking-wider bg-muted cursor-not-allowed"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setForm((f) => ({ ...f, code: generateCode() }))}
                  title="Gerar novo código"
                >
                  <KeyRound className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="name">Nome do Candidato</Label>
              <Input
                id="name"
                placeholder="Nome completo"
                value={form.candidateName}
                onChange={(e) => setForm((f) => ({ ...f, candidateName: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">E-mail do Candidato *</Label>
              <Input
                id="email"
                type="email"
                placeholder="candidato@email.com"
                value={form.candidateEmail}
                onChange={(e) => setForm((f) => ({ ...f, candidateEmail: e.target.value }))}
                className="mt-1"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleCreate} disabled={creating} className="flex-1">
                {creating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                Criar Código
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAccessCodes;
