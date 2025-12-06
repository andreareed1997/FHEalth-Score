export type RiskLevel = {
  label: "Low" | "Guarded" | "Medium" | "High" | "Critical";
  color: string;
  bgGradient: string;
  advice: string;
};

// Maps risk level number (0-4) to RiskLevel
export function mapRiskLevel(level: number): RiskLevel {
  switch (level) {
    case 0:
      return {
        label: "Low",
        color: "green.400",
        bgGradient: "linear(to-r, green.500, green.300)",
        advice: "Excellent! Your health indicators are within optimal ranges. Maintain your healthy lifestyle with regular exercise and balanced nutrition.",
      };
    case 1:
      return {
        label: "Guarded",
        color: "teal.400",
        bgGradient: "linear(to-r, teal.500, cyan.400)",
        advice: "Good overall health. Consider minor improvements in diet or activity levels. Schedule an annual check-up to stay on track.",
      };
    case 2:
      return {
        label: "Medium",
        color: "yellow.400",
        bgGradient: "linear(to-r, yellow.500, orange.300)",
        advice: "Some health factors need attention. Focus on improving diet, increasing physical activity, and managing stress. Consider consulting a healthcare provider.",
      };
    case 3:
      return {
        label: "High",
        color: "orange.500",
        bgGradient: "linear(to-r, orange.500, red.400)",
        advice: "Multiple risk factors detected. We strongly recommend consulting a healthcare professional for a comprehensive evaluation and personalized health plan.",
      };
    case 4:
    default:
      return {
        label: "Critical",
        color: "red.500",
        bgGradient: "linear(to-r, red.600, red.400)",
        advice: "Immediate medical attention recommended. Please consult a healthcare provider as soon as possible for a thorough health assessment and intervention plan.",
      };
  }
}

