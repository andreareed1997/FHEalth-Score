export type RiskLevel = {
  label: "Low" | "Guarded" | "Medium" | "High" | "Critical";
  color: string;
};

// Maps risk level number (0-4) to RiskLevel
export function mapRiskLevel(level: number): RiskLevel {
  switch (level) {
    case 0:
      return { label: "Low", color: "green.400" };
    case 1:
      return { label: "Guarded", color: "cyan.400" };
    case 2:
      return { label: "Medium", color: "yellow.400" };
    case 3:
      return { label: "High", color: "orange.400" };
    case 4:
    default:
      return { label: "Critical", color: "red.500" };
  }
}

// Maps total score to RiskLevel (for backward compatibility)
export function mapRisk(score: number): RiskLevel {
  if (score < 5) return { label: "Low", color: "green.400" };
  if (score < 8) return { label: "Guarded", color: "cyan.400" };
  if (score < 11) return { label: "Medium", color: "yellow.400" };
  if (score < 14) return { label: "High", color: "orange.400" };
  return { label: "Critical", color: "red.500" };
}

