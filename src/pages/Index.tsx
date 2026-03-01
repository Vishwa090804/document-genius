import { useState } from "react";
import { toast } from "sonner";
import { Brain, Sparkles } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import QuizConfig from "@/components/QuizConfig";
import QuizPlayer, { type Question } from "@/components/QuizPlayer";
import QuizResults from "@/components/QuizResults";

type AppState = "upload" | "quiz" | "results";

const Index = () => {
  const [state, setState] = useState<AppState>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("Medium");
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  const handleGenerate = async () => {
    if (!file) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("numQuestions", String(numQuestions));
      formData.append("difficulty", difficulty);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-quiz`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate quiz");
      }

      const data = await response.json();

      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("Invalid quiz data received");
      }

      setQuestions(data.questions);
      setState("quiz");
      toast.success(`${data.questions.length} questions generated!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = (finalScore: number, answers: number[]) => {
    setScore(finalScore);
    setUserAnswers(answers);
    setState("results");
  };

  const handleRetry = () => {
    setState("quiz");
  };

  const handleNewQuiz = () => {
    setFile(null);
    setQuestions([]);
    setScore(0);
    setUserAnswers([]);
    setState("upload");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg gradient-primary p-2">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">QuizAI</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>Powered by AI</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-10">
        {state === "upload" && (
          <div className="animate-fade-in space-y-8">
            {/* Hero */}
            <div className="text-center space-y-3">
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Document to Quiz
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Upload any document and let AI generate an interactive quiz in seconds
              </p>
            </div>

            {/* Upload + Config Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-6">
              <FileUpload file={file} onFileSelected={setFile} onClear={() => setFile(null)} />
              <QuizConfig
                numQuestions={numQuestions}
                difficulty={difficulty}
                onNumQuestionsChange={setNumQuestions}
                onDifficultyChange={setDifficulty}
                onGenerate={handleGenerate}
                isLoading={isLoading}
                hasFile={!!file}
              />
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: "📄", title: "Multi-Format", desc: "PDF, DOCX & TXT" },
                { icon: "🎯", title: "Customizable", desc: "Difficulty & count" },
                { icon: "⚡", title: "Instant", desc: "AI-powered speed" },
              ].map((f) => (
                <div key={f.title} className="text-center space-y-1.5 rounded-xl bg-muted/50 p-4">
                  <span className="text-2xl">{f.icon}</span>
                  <p className="font-display text-sm font-semibold text-foreground">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {state === "quiz" && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <QuizPlayer questions={questions} onFinish={handleFinish} />
          </div>
        )}

        {state === "results" && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <QuizResults
              score={score}
              total={questions.length}
              answers={userAnswers}
              questions={questions}
              onRetry={handleRetry}
              onNewQuiz={handleNewQuiz}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
