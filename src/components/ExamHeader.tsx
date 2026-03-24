import { useEffect, useState } from "react";
import { Shield, Clock, AlertTriangle } from "lucide-react";

interface ExamHeaderProps {
  candidateName: string;
  totalSeconds: number;
  onTimeUp: () => void;
}

const ExamHeader = ({ candidateName, totalSeconds, onTimeUp }: ExamHeaderProps) => {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft <= 0]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isWarning = secondsLeft <= 300 && secondsLeft > 60;
  const isDanger = secondsLeft <= 60;

  const timerColor = isDanger
    ? "text-exam-danger animate-pulse-warning"
    : isWarning
    ? "text-exam-warning"
    : "text-primary";

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-base font-bold font-display leading-tight">Smart Home Premium</h1>
            <p className="text-xs text-muted-foreground">Avaliação Técnica</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-xs text-muted-foreground">Candidato</p>
            <p className="text-sm font-semibold truncate max-w-[180px]">{candidateName}</p>
          </div>

          <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-lg font-bold ${timerColor}`}>
            {isDanger && <AlertTriangle className="h-4 w-4" />}
            {!isDanger && <Clock className="h-4 w-4" />}
            <span>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ExamHeader;
