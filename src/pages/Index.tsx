import { useState } from "react";
import BrandBackdrop from "@/components/BrandBackdrop";
import { Shield, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface StartExamResult {
  session_id: string;
  session_token: string;
  duration_minutes: number;
  total_questions: number;
}

const Index = () => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleStart = async () => {
    if (!name.trim() || !code.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("start_exam", {
        p_code: code.trim(),
        p_candidate_name: name.trim(),
      });

      if (error) throw error;
      const result = data as unknown as StartExamResult;
      if (!result?.session_id || !result.session_token) {
        throw new Error("O servidor não retornou os dados da sessão.");
      }

      // O token fica somente na sessão atual do navegador, nunca na URL.
      sessionStorage.setItem(`prova_session_${result.session_id}`, JSON.stringify({
        token: result.session_token,
        candidateName: name.trim(),
        durationMinutes: result.duration_minutes,
        totalQuestions: result.total_questions,
        startedAt: new Date().toISOString(),
      }));
      navigate("/exam/" + result.session_id);
    } catch (error) {
      toast({
        title: "Não foi possível iniciar a prova",
        description: error instanceof Error ? error.message : "Verifique o código e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brand-screen min-h-screen flex items-center justify-center p-4 bg-background">
      <BrandBackdrop />
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Shield className="h-9 w-9 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display">Smart Home Premium</CardTitle>
          <CardDescription className="text-sm">Avaliação Técnica — Dispositivos Inteligentes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" placeholder="Digite seu nome completo" value={name}
              onChange={(e) => setName(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Código de acesso</Label>
            <Input id="code" placeholder="Digite o código fornecido" value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())} disabled={loading} />
          </div>
          <Button className="w-full" size="lg" onClick={handleStart}
            disabled={loading || !name.trim() || !code.trim()}>
            <LogIn className="h-4 w-4 mr-2" />
            {loading ? "Verificando..." : "Iniciar Prova"}
          </Button>
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>
          <Button variant="outline" className="w-full" size="lg"
            onClick={() => navigate("/admin")} disabled={loading}>
            <Shield className="h-4 w-4 mr-2" /> Entrar como Administrador
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            O código de acesso é fornecido pela equipe Smart Home Premium.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;




