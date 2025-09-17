export type ThreatRiskLevel = "High" | "Medium" | "Low";

export interface Threat {
  id: string; // A unique identifier for the threat
  title: string; // A short, descriptive title (e.g., "Suspicious Script Blocked")
  riskLevel: ThreatRiskLevel;
  riskScore: number; // A score from 0-100
  message: string; // A more detailed explanation of the threat
  source: string; // The URL where the threat was detected
  timestamp: number; // The time the threat was detected
  type: "URL" | "Content" | "Transaction"; // The category of the threat
  details?: {
    pattern?: string; // The specific malicious pattern that was matched
    content?: string; // A snippet of the malicious content
  };
}
