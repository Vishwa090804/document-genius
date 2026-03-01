import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QuizConfigProps {
  numQuestions: number;
  difficulty: string;
  onNumQuestionsChange: (n: number) => void;
  onDifficultyChange: (d: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  hasFile: boolean;
}

export default function QuizConfig({
  numQuestions,
  difficulty,
  onNumQuestionsChange,
  onDifficultyChange,
  onGenerate,
  isLoading,
  hasFile,
}: QuizConfigProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Questions</Label>
          <Select value={String(numQuestions)} onValueChange={(v) => onNumQuestionsChange(Number(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 Questions</SelectItem>
              <SelectItem value="10">10 Questions</SelectItem>
              <SelectItem value="15">15 Questions</SelectItem>
              <SelectItem value="20">20 Questions</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Difficulty</Label>
          <Select value={difficulty} onValueChange={onDifficultyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={onGenerate}
        disabled={!hasFile || isLoading}
        className="w-full gradient-primary text-primary-foreground font-display font-semibold h-12 text-base hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Generating Quiz...
          </span>
        ) : (
          "Generate Quiz"
        )}
      </Button>
    </div>
  );
}
