import { useState } from "react";
import { Shield, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
      const { data: accessCode, error } = await supabase
        .from("access_codes")
        .select("*")
        .eq("code", code.trim())
        .eq("is_used", false)
        .maybeSingle();

      if (error || !accessCode) {
        toast({
          title: "Código inválido",
          description: "O código de acesso não foi encontrado ou já foi utilizado.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Mark code as used
      await supabase
        .from("access_codes")
        .update({ is_used: true, candidate_name: name.trim() })
        .eq("id", accessCode.id);

      // Create exam session
      const { data: session, error: sessionError } = await supabase
        .from("exam_sessions")
        .insert({
          access_code_id: accessCode.id,
          candidate_name: name.trim(),
          candidate_email: accessCode.candidate_email,
          duration_minutes: accessCode.exam_duration_minutes,
        })
        .select()
        .single();

      if (sessionError || !session) {
        toast({ title: "Erro ao iniciar prova", variant: "destructive" });
        setLoading(false);
        return;
      }

      navigate(`/exam/${session.id}`);
    } catch {
      toast({ title: "Erro de conexão", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Shield className="h-9 w-9 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display">Smart Home Premium</CardTitle>
          <CardDescription className="text-sm">
            Avaliação Técnica — Dispositivos Inteligentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              placeholder="Digite seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Código de acesso</Label>
            <Input
              id="code"
              placeholder="Digite o código fornecido"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={handleStart}
            disabled={loading || !name.trim() || !code.trim()}
          >
            <LogIn className="h-4 w-4 mr-2" />
            {loading ? "Verificando..." : "Iniciar Prova"}
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
