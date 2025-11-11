import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { GitBranch, ChevronDown } from "lucide-react";
import { Alternative } from "@/utils/mathSteps";
import { useState } from "react";

interface AlternativesPanelProps {
  alternatives: Alternative[];
}

export function AlternativesPanel({ alternatives }: AlternativesPanelProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (alternatives.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold text-foreground">Alternative Solution Paths</h2>
      </div>
      <div className="space-y-3">
        {alternatives.map((alt, altIdx) => (
          <Collapsible
            key={altIdx}
            open={openIndex === altIdx}
            onOpenChange={(open) => setOpenIndex(open ? altIdx : null)}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted transition-colors group text-left">
              <span className="font-medium text-foreground">{alt.title}</span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openIndex === altIdx ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ol className="space-y-2 mt-3 pl-3">
                {alt.steps.map((step, stepIdx) => (
                  <li key={stepIdx} className="flex gap-2 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-semibold">
                      {stepIdx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-foreground mb-1">{step.description}</p>
                      <code className="monospace text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                        {step.expression}
                      </code>
                    </div>
                  </li>
                ))}
              </ol>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </Card>
  );
}
