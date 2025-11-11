import { Card } from "@/components/ui/card";
import { ListOrdered } from "lucide-react";
import { Step } from "@/utils/mathSteps";

interface StepsPanelProps {
  steps: Step[];
}

export function StepsPanel({ steps }: StepsPanelProps) {
  if (steps.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <ListOrdered className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Solution Steps</h2>
      </div>
      <ol className="space-y-3">
        {steps.map((step, idx) => (
          <li key={idx} className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
              {idx + 1}
            </span>
            <div className="flex-1">
              <p className="text-sm text-foreground mb-1">{step.description}</p>
              <code className="monospace text-sm bg-muted px-2 py-1 rounded text-muted-foreground">
                {step.expression}
              </code>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
