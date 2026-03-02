import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ChevronRight } from "lucide-react";

export default function QuizPlayer({ questions, onFinish }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [answers, setAnswers] = useState([]);
    const [score, setScore] = useState(0);

    const current = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;

    const handleSelect = (optionIndex) => {
        if (showAnswer) return;
        setSelectedOption(optionIndex);
        setShowAnswer(true);
        const isCorrect = optionIndex === current.correctIndex;
        if (isCorrect) setScore((s) => s + 1);
        setAnswers((a) => [...a, optionIndex]);
    };

    const handleNext = () => {
        if (isLast) {
            onFinish(score, answers);
        } else {
            setCurrentIndex((i) => i + 1);
            setSelectedOption(null);
            setShowAnswer(false);
        }
    };

    const getOptionStyle = (index) => {
        if (!showAnswer) {
            return "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer";
        }
        if (index === current.correctIndex) {
            return "border-secondary bg-secondary/10 text-foreground";
        }
        if (index === selectedOption && index !== current.correctIndex) {
            return "border-destructive bg-destructive/10 text-foreground";
        }
        return "border-border opacity-50";
    };

    return (
        <div className="animate-fade-in space-y-6">
            {/* Progress */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Question {currentIndex + 1} of {questions.length}</span>
                    <span>Score: {score}/{currentIndex + (showAnswer ? 1 : 0)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                        className="h-full rounded-full gradient-primary transition-all duration-500"
                        style={{ width: `${((currentIndex + (showAnswer ? 1 : 0)) / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Question */}
            <h2 className="font-display text-xl font-semibold text-foreground leading-relaxed">
                {current.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
                {current.options.map((option, i) => (
                    <button
                        key={i}
                        onClick={() => handleSelect(i)}
                        disabled={showAnswer}
                        className={`w-full flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all ${getOptionStyle(i)}`}
                    >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-display font-semibold text-sm text-muted-foreground">
                            {String.fromCharCode(65 + i)}
                        </span>
                        <span className="flex-1 text-sm font-medium">{option}</span>
                        {showAnswer && i === current.correctIndex && (
                            <CheckCircle2 className="h-5 w-5 text-secondary shrink-0" />
                        )}
                        {showAnswer && i === selectedOption && i !== current.correctIndex && (
                            <XCircle className="h-5 w-5 text-destructive shrink-0" />
                        )}
                    </button>
                ))}
            </div>

            {/* Explanation */}
            {showAnswer && (
                <div className="animate-fade-in rounded-lg bg-muted/50 border border-border p-4">
                    <p className="text-sm font-medium text-primary mb-1">Explanation</p>
                    <p className="text-sm text-muted-foreground">{current.explanation}</p>
                </div>
            )}

            {/* Next */}
            {showAnswer && (
                <Button
                    onClick={handleNext}
                    className="w-full gradient-primary text-primary-foreground font-display font-semibold h-12 hover:opacity-90 transition-opacity"
                >
                    {isLast ? "View Results" : "Next Question"}
                    <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
