import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle, Mail, Phone } from "lucide-react";

interface ExamCompletionModalProps {
  open: boolean;
  candidateName: string;
  timedOut: boolean;
}

const ExamCompletionModal = ({ open, candidateName, timedOut }: ExamCompletionModalProps) => {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader className="text-center items-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-exam-success/10">
            <CheckCircle className="h-10 w-10 text-exam-success" />
          </div>
          <DialogTitle className="text-xl font-display">
            {timedOut ? "Tempo Esgotado!" : "Prova Concluída!"}
          </DialogTitle>
          <DialogDescription className="text-center space-y-3 pt-2">
            <p className="text-base">
              Parabéns, <strong>{candidateName}</strong>! 
              {timedOut
                ? " O tempo da prova se encerrou."
                : " Você completou a avaliação técnica."}
            </p>
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>O resultado será enviado pela equipe administrativa da Smart Home Premium.</span>
            </div>
            <p className="text-xs text-muted-foreground pt-2 border-t">
              Agradecemos sua participação neste processo seletivo.
            </p>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ExamCompletionModal;
