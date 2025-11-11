import { useState, useEffect, useRef } from "react";
import { evaluate } from "mathjs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Calculator, History, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StepsPanel } from "@/components/StepsPanel";
import { AlternativesPanel } from "@/components/AlternativesPanel";
import { analyzeExpression, StepAnalysis } from "@/utils/mathSteps";

const STORAGE_KEY = "qms.history";
const MAX_HISTORY = 10;

const examples = [
  { expr: "3 + 5 * 2", note: "PEMDAS: multiplication first" },
  { expr: "sqrt(16)", note: "square root" },
  { expr: "sin(pi/4)", note: "trigonometry with radians" },
  { expr: "(2+3)^4", note: "parentheses then exponent" },
  { expr: "log(100, 10)", note: "logarithm base 10" },
  { expr: "abs(-42)", note: "absolute value" },
];

const Index = () => {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [stepAnalysis, setStepAnalysis] = useState<StepAnalysis | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (expr: string) => {
    const newHistory = [expr, ...history.filter((h) => h !== expr)].slice(0, MAX_HISTORY);
    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  };

  const handleSolve = () => {
    const trimmed = expression.trim();
    if (!trimmed) {
      setError("Please enter an expression");
      setResult(null);
      return;
    }

    try {
      const computed = evaluate(trimmed);
      const resultText = typeof computed === "number" ? computed.toString() : String(computed);
      setResult(resultText);
      setError(null);
      
      // Generate step-by-step analysis
      const analysis = analyzeExpression(trimmed, resultText);
      setStepAnalysis(analysis);
      
      saveToHistory(trimmed);
      setHistoryIndex(-1);
      toast({
        title: "Solved!",
        description: `Result: ${resultText}`,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid expression");
      setResult(null);
      setStepAnalysis(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSolve();
    } else if (e.key === "ArrowUp" && history.length > 0) {
      e.preventDefault();
      const newIndex = historyIndex + 1;
      if (newIndex < history.length) {
        setHistoryIndex(newIndex);
        setExpression(history[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const newIndex = historyIndex - 1;
      if (newIndex >= 0) {
        setHistoryIndex(newIndex);
        setExpression(history[newIndex]);
      } else if (newIndex === -1) {
        setHistoryIndex(-1);
        setExpression("");
      }
    }
  };

  const loadExample = (expr: string) => {
    setExpression(expr);
    inputRef.current?.focus();
  };

  const loadFromHistory = (expr: string) => {
    setExpression(expr);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Calculator className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Quick Math Solver</h1>
                <p className="text-sm text-muted-foreground">Fast, safe expression evaluation in your browser</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Input Section */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="expression" className="block text-sm font-medium text-foreground mb-2">
                  Enter your expression
                </label>
                <Textarea
                  ref={inputRef}
                  id="expression"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., 3 + 5 * 2, sqrt(16), sin(pi/4)"
                  className="monospace text-lg min-h-[100px] resize-none"
                  aria-label="Math expression input"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-muted">Enter</kbd> to solve, <kbd className="px-1.5 py-0.5 rounded bg-muted">↑</kbd> to recall history
                </p>
              </div>

              <Button onClick={handleSolve} className="w-full text-base h-12" size="lg">
                Solve Expression
              </Button>
            </div>
          </Card>

          {/* Result Section */}
          {(result || error) && (
            <Card className={`p-6 ${error ? 'bg-destructive/5 border-destructive/20' : 'bg-result border-result/20'}`}>
              <h2 className="text-sm font-medium text-foreground mb-2">
                {error ? "Error" : "Result"}
              </h2>
              <div
                className={`monospace text-2xl font-semibold p-4 rounded-lg ${
                  error ? 'text-destructive bg-destructive/10' : 'text-result-foreground bg-result'
                }`}
                role="status"
                aria-live="polite"
              >
                {error || result}
              </div>
            </Card>
          )}

          {/* Steps Panel */}
          {stepAnalysis && !error && (
            <StepsPanel steps={stepAnalysis.steps} />
          )}

          {/* Alternatives Panel */}
          {stepAnalysis && stepAnalysis.alternatives.length > 0 && !error && (
            <AlternativesPanel alternatives={stepAnalysis.alternatives} />
          )}

          {/* Examples */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Examples</h2>
            </div>
            <div className="grid gap-2">
              {examples.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => loadExample(ex.expr)}
                  className="text-left p-3 rounded-lg hover:bg-muted transition-colors group"
                >
                  <div className="monospace text-sm font-medium text-foreground group-hover:text-primary">
                    {ex.expr}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{ex.note}</div>
                </button>
              ))}
            </div>
          </Card>

          {/* History */}
          {history.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Recent History</h2>
              </div>
              <div className="grid gap-2">
                {history.map((expr, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadFromHistory(expr)}
                    className="text-left p-3 rounded-lg hover:bg-muted transition-colors monospace text-sm text-foreground hover:text-primary"
                  >
                    {expr}
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              Built with <a href="https://mathjs.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">math.js</a>
            </p>
            <p>All computations happen in your browser. No data is sent to any server.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
