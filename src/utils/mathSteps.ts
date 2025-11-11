import { parse, simplify } from "mathjs";

export interface Step {
  description: string;
  expression: string;
  result?: string;
}

export interface Alternative {
  title: string;
  steps: Step[];
}

export interface StepAnalysis {
  steps: Step[];
  alternatives: Alternative[];
}

function detectPattern(expr: string): string | null {
  // Remove spaces for pattern matching
  const cleaned = expr.replace(/\s/g, "");
  
  // Detect patterns
  if (/\(\d+[+\-]\d+\)\^\d+/.test(cleaned)) return "binomial_power";
  if (/\d+\/\d+/.test(cleaned) && !cleaned.includes("+") && !cleaned.includes("-") && !cleaned.includes("*") && cleaned.split("/").length === 2) return "fraction";
  if (/\d+\*\([^)]+\)/.test(cleaned) || /\([^)]+\)\*\d+/.test(cleaned)) return "distributive";
  if (/[+\-]/.test(cleaned) && /[*\/]/.test(cleaned)) return "order_ops";
  
  return null;
}

function generateBasicSteps(expr: string, result: string): Step[] {
  const steps: Step[] = [];
  const cleaned = expr.replace(/\s/g, "");
  
  try {
    const node = parse(expr);
    
    // Check for parentheses
    if (cleaned.includes("(")) {
      steps.push({
        description: "Evaluate expressions in parentheses first",
        expression: expr,
      });
    }
    
    // Check for exponents
    if (cleaned.includes("^")) {
      steps.push({
        description: "Calculate exponents",
        expression: expr,
      });
    }
    
    // Check for multiplication/division
    if (cleaned.match(/[*\/]/)) {
      steps.push({
        description: "Perform multiplication and division from left to right",
        expression: expr,
      });
    }
    
    // Check for addition/subtraction
    if (cleaned.match(/[+\-]/) && steps.length > 0) {
      steps.push({
        description: "Perform addition and subtraction from left to right",
        expression: expr,
      });
    }
    
    // If no steps identified, add a simple evaluation step
    if (steps.length === 0) {
      steps.push({
        description: "Evaluate the expression",
        expression: expr,
      });
    }
    
    // Add final result
    steps.push({
      description: "Final result",
      expression: result,
      result: result,
    });
    
  } catch (e) {
    steps.push({
      description: "Evaluate the expression",
      expression: expr,
      result: result,
    });
  }
  
  return steps;
}

function generateOrderOpsSteps(expr: string, result: string): Step[] {
  const steps: Step[] = [
    {
      description: "Original expression",
      expression: expr,
    },
  ];
  
  // Example: 3 + 5 * 2
  if (expr.includes("*")) {
    steps.push({
      description: "Multiplication has higher precedence (PEMDAS)",
      expression: "First calculate the multiplication",
    });
  } else if (expr.includes("/")) {
    steps.push({
      description: "Division has higher precedence (PEMDAS)",
      expression: "First calculate the division",
    });
  }
  
  steps.push({
    description: "Then perform addition/subtraction",
    expression: `Result: ${result}`,
    result: result,
  });
  
  return steps;
}

function generateBinomialPowerAlternatives(expr: string, result: string): Alternative[] {
  const alternatives: Alternative[] = [];
  
  // Method A: Direct evaluation
  alternatives.push({
    title: "Method A: Evaluate parentheses, then exponent",
    steps: [
      { description: "Original expression", expression: expr },
      { description: "Evaluate inside parentheses first", expression: "Calculate the sum or difference" },
      { description: "Apply the exponent", expression: "Raise the result to the power" },
      { description: "Final result", expression: result, result },
    ],
  });
  
  // Method B: Expand
  alternatives.push({
    title: "Method B: Expand using (a+b)² = a² + 2ab + b²",
    steps: [
      { description: "Original expression", expression: expr },
      { description: "Apply the formula (a+b)² = a² + 2ab + b²", expression: "Expand the binomial" },
      { description: "Simplify each term", expression: "Calculate individual terms" },
      { description: "Sum the terms", expression: result, result },
    ],
  });
  
  return alternatives;
}

function generateFractionAlternatives(expr: string, result: string): Alternative[] {
  const alternatives: Alternative[] = [];
  const parts = expr.split("/");
  
  if (parts.length === 2) {
    const num = parseInt(parts[0].trim());
    const den = parseInt(parts[1].trim());
    
    // Check if reducible
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(num, den);
    
    if (divisor > 1) {
      alternatives.push({
        title: "Method A: Reduce the fraction",
        steps: [
          { description: "Original fraction", expression: expr },
          { description: `Find GCD of ${num} and ${den}`, expression: `GCD = ${divisor}` },
          { description: "Divide both numerator and denominator by GCD", expression: `${num}÷${divisor} / ${den}÷${divisor} = ${num/divisor}/${den/divisor}` },
          { description: "Simplified form", expression: `${num/divisor}/${den/divisor}`, result: `${num/divisor}/${den/divisor}` },
        ],
      });
    }
    
    alternatives.push({
      title: "Method B: Convert to decimal",
      steps: [
        { description: "Original fraction", expression: expr },
        { description: "Divide numerator by denominator", expression: `${num} ÷ ${den}` },
        { description: "Decimal result", expression: result, result },
      ],
    });
  }
  
  return alternatives;
}

function generateDistributiveAlternatives(expr: string, result: string): Alternative[] {
  const alternatives: Alternative[] = [];
  
  alternatives.push({
    title: "Method A: Evaluate parentheses first",
    steps: [
      { description: "Original expression", expression: expr },
      { description: "Calculate the sum inside parentheses", expression: "Add the numbers in parentheses" },
      { description: "Multiply the result", expression: "Multiply the outside number by the sum" },
      { description: "Final result", expression: result, result },
    ],
  });
  
  alternatives.push({
    title: "Method B: Use distributive property",
    steps: [
      { description: "Original expression", expression: expr },
      { description: "Apply a(b+c) = ab + ac", expression: "Distribute multiplication over addition" },
      { description: "Calculate each product", expression: "Multiply each term" },
      { description: "Add the products", expression: result, result },
    ],
  });
  
  return alternatives;
}

export function analyzeExpression(expr: string, result: string): StepAnalysis {
  const pattern = detectPattern(expr);
  let steps: Step[] = [];
  let alternatives: Alternative[] = [];
  
  switch (pattern) {
    case "order_ops":
      steps = generateOrderOpsSteps(expr, result);
      break;
    case "binomial_power":
      steps = generateBasicSteps(expr, result);
      alternatives = generateBinomialPowerAlternatives(expr, result);
      break;
    case "fraction":
      steps = generateBasicSteps(expr, result);
      alternatives = generateFractionAlternatives(expr, result);
      break;
    case "distributive":
      steps = generateBasicSteps(expr, result);
      alternatives = generateDistributiveAlternatives(expr, result);
      break;
    default:
      steps = generateBasicSteps(expr, result);
  }
  
  return { steps, alternatives };
}
