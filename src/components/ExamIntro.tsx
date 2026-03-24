import { Shield, Clock, BookOpen, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ExamIntroProps {
  durationMinutes: number;
}

const ExamIntro = ({ durationMinutes }: ExamIntroProps) => {
  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <Shield className="h-6 w-6 text-primary mt-0.5 shrink-0" />
          <div>
            <h2 className="text-lg font-bold font-display">Avaliação Técnica — Smart Home Premium</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Esta prova tem como objetivo avaliar o nível técnico avançado do candidato 
              na instalação e configuração de dispositivos inteligentes residenciais.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span><strong>30</strong> perguntas técnicas</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span><strong>{durationMinutes}</strong> minutos de duração</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Save className="h-4 w-4 text-muted-foreground" />
            <span>Respostas salvas automaticamente</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4 border-t pt-3">
          Temas: Interruptores Wi-Fi/Zigbee • Controlador Universal • Fechadura Digital • 
          Interfone Inteligente • Fita de LED • Sensores de Presença e Movimento
        </p>
      </CardContent>
    </Card>
  );
};

export default ExamIntro;
