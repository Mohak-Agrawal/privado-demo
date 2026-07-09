import { GoogleGenAI } from "@google/genai"
import type { Finding } from "./types"


export async function generateReport(findings: Finding[], source: string, apiKey: string): Promise<string> {
  const client = new GoogleGenAI({ apiKey })
  const findingsSummary = findings.map((f, i) => `
Finding ${i + 1}:
  Data Element: ${f.dataElement}
  File: ${f.location.file}, Line ${f.location.line}
  Code: ${f.location.snippet}
  Destination: ${f.destination}
  Risk Level: ${f.riskLevel.toUpperCase()}
  Risk Reason: ${f.riskReason}
`).join("\n")

  const highCount = findings.filter(f => f.riskLevel === "high").length
  const medCount = findings.filter(f => f.riskLevel === "medium").length
  const lowCount = findings.filter(f => f.riskLevel === "low").length

  const response = await client.models.generateContent({
    model: "gemini-1.5-flash-8b",
    contents: `Generate a structured DPIA report for the following code scan findings.

Source: ${source}
Findings: ${findings.length} total (${highCount} High, ${medCount} Medium, ${lowCount} Low)

${findingsSummary}

Write the report with EXACTLY these five sections, using these exact headers:

## Executive Summary
(2-3 sentences. Formal. State what was scanned, what was found, and the overall risk posture.)

## Data Elements Identified
(Markdown table with columns: Data Element | File Location | Destination | Risk Level)

## Risk Analysis
(One formal paragraph per HIGH-risk finding only. Reference the specific code location. Write as a DPO would for a regulatory submission.)

## Recommended Remediation
(Bulleted action items. One per high or medium finding. Start each with a strong verb. Be specific — name the file and the fix.)

## Assessment Conclusion
(One paragraph. Formal sign-off language. State whether the system meets GDPR/CCPA obligations as-is or requires remediation before processing.)

Use formal compliance language throughout. Do not use bullet points in Risk Analysis — only in Remediation.`,
    config: {
      systemInstruction: `You are a Data Protection Officer (DPO) drafting formal Data Protection Impact Assessments (DPIAs). Write in formal, third-person, past-tense compliance language. Use precise legal terminology. Be specific about findings — do not be vague.`,
      maxOutputTokens: 2000,
    },
  })

  return response.text ?? ""
}
