import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  questionText: string;
  options: { key: string; text: string }[];
  selectedOption: string | null;
  category: string;
  onAnswer: (option: string) => void;
  disabled: boolean;
}

const QuestionCard = ({
  questionNumber,
  totalQuestions,
  questionText,
  options,
  selectedOption,
  category,
  onAnswer,
  disabled,
}: QuestionCardProps) => {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-primary">
              Pergunta {questionNumber}/{totalQuestions}
            </span>
            {selectedOption && (
              <CheckCircle className="h-4 w-4 text-exam-success" />
            )}
          </div>
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
        </div>
        <h3 className="text-base font-semibold leading-snug">{questionText}</h3>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedOption || ""}
          onValueChange={onAnswer}
          disabled={disabled}
          className="space-y-3"
        >
          {options.map((opt) => (
            <div
              key={opt.key}
              className={`flex items-start gap-3 rounded-lg border p-3 transition-colors cursor-pointer hover:bg-muted/50 ${
                selectedOption === opt.key
                  ? "border-primary bg-primary/5"
                  : "border-border"
              } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
              onClick={() => !disabled && onAnswer(opt.key)}
            >
              <RadioGroupItem value={opt.key} id={`q${questionNumber}-${opt.key}`} className="mt-0.5" />
              <Label
                htmlFor={`q${questionNumber}-${opt.key}`}
                className="text-sm leading-relaxed cursor-pointer flex-1"
              >
                <span className="font-semibold text-primary mr-1.5">
                  {opt.key.toUpperCase()})
                </span>
                {opt.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
