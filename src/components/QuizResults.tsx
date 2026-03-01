import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw, Target, CheckCircle2, XCircle } from "lucide-react";
import type { Question } from "./QuizPlayer";

interface QuizResultsProps {
  score: number;
  total: number;
  answers: number[];
  questions: Question[];
  onRetry: () => void;
  onNewQuiz: () => void;
}

export default function QuizResults({ score, total, answers, questions, onRetry, onNewQuiz }: QuizResultsProps) {
  const percentage = Math.round((score / total) * 100);

  const getGrade = () => {
    if (percentage >= 90) return { label: "Excellent!", color: "text-secondary" };
    if (percentage >= 70) return { label: "Great Job!", color: "text-primary" };
    if (percentage >= 50) return { label: "Good Effort!", color: "text-accent" };
    return { label: "Keep Practicing!", color: "text-destructive" };
  };

  const grade = getGrade();

  return (
    <div className="animate-fade-in space-y-8">
      {/* Score Card */}
      <div className="text-center space-y-4">
        <div className="inline-flex rounded-full bg-primary/10 p-5">
          <Trophy className={`h-12 w-12 ${grade.color}`} />
        </div>
        <h2 className={`font-display text-3xl font-bold ${grade.color}`}>{grade.label}</h2>
        <div className="flex items-center justify-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <span className="font-display text-2xl font-bold text-foreground">{percentage}%</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <span className="text-lg">{score} / {total} correct</span>
        </div>
      </div>

      {/* Answer Review */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-foreground">Review Answers</h3>
        {questions.map((q, i) => {
          const isCorrect = answers[i] === q.correctIndex;
          return (
            <div key={i} className={`rounded-lg border p-4 ${isCorrect ? "border-secondary/30 bg-secondary/5" : "border-destructive/30 bg-destructive/5"}`}>
              <div className="flex items-start gap-2">
                {isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{q.question}</p>
                  {!isCorrect && (
                    <p className="text-xs text-muted-foreground">
                      Your answer: {q.options[answers[i]]} · Correct: {q.options[q.correctIndex]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={onRetry} variant="outline" className="h-12 font-display font-semibold">
          <RotateCcw className="mr-2 h-4 w-4" /> Retry Quiz
        </Button>
        <Button onClick={onNewQuiz} className="h-12 gradient-primary text-primary-foreground font-display font-semibold hover:opacity-90 transition-opacity">
          New Quiz
        </Button>
      </div>
    </div>
  );
}
