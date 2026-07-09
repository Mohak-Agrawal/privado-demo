import { GoogleGenAI } from "@google/genai"
import type { ScanInput, ScanResult } from "./types"


const SYSTEM_PROMPT = `You are a privacy code scanner. Identify personal data risks in source code.

Rules:
- Only flag findings involving actual personal data (emails, names, IPs, credentials, payment info, health data, device IDs).
- If no personal data found, return empty findings array.
- riskLevel: "high"=data leak/unencrypted PII/unknown third party, "medium"=logged/analytics, "low"=safe handling
- riskReason: max 10 words describing the risk
- draftedAssessment: exactly 1 sentence, formal, third person, past tense
- Respond ONLY with valid JSON. No markdown.`

export const MOCK_RESULT: ScanResult = {
  findings: [
    {
      id: "f1",
      dataElement: "Email Address",
      location: { file: "server.js", line: 42, snippet: "console.log('User login:', req.body.email)" },
      destination: "Server logs",
      riskLevel: "high",
      riskReason: "Email address is written to server logs in plaintext, creating an unintended data retention risk.",
      draftedAssessment: "The application was found to log user email addresses to server output without redaction. This practice constitutes an uncontrolled data flow that may violate GDPR Article 5(1)(f) requirements for appropriate security. It is recommended that all personal identifiers be masked or omitted from application logs.",
    },
    {
      id: "f2",
      dataElement: "IP Address",
      location: { file: "server.js", line: 87, snippet: "analytics.track({ ip: req.ip, event: 'page_view' })" },
      destination: "Analytics platform",
      riskLevel: "medium",
      riskReason: "Raw IP addresses are forwarded to a third-party analytics service without anonymization.",
      draftedAssessment: "The application was observed transmitting user IP addresses to a third-party analytics provider without prior anonymization or pseudonymization. Under GDPR Recital 26, IP addresses constitute personal data when linkable to an individual. It is recommended that IP addresses be truncated or hashed before transmission to external services.",
    },
    {
      id: "f3",
      dataElement: "Authentication Credentials",
      location: { file: "server.js", line: 113, snippet: "db.query(`SELECT * FROM users WHERE token='${req.headers.authorization}'`)" },
      destination: "Database query (unsanitized)",
      riskLevel: "high",
      riskReason: "Authentication token is interpolated directly into a SQL query, exposing credentials and creating SQL injection risk.",
      draftedAssessment: "The application was found to construct database queries by directly interpolating user-supplied authentication tokens into SQL strings. This practice exposes credential values in query logs and introduces SQL injection vulnerabilities that could compromise the entire user dataset. Parameterized queries must be used for all database interactions involving personal data.",
    },
  ],
  summary: {
    high: 2,
    medium: 1,
    low: 0,
    topThirdParties: ["Analytics Platform"],
  },
}

export async function scanCode(input: ScanInput, apiKey: string): Promise<ScanResult> {
  const client = new GoogleGenAI({ apiKey })
  const userPrompt = `Analyze the following code for privacy risks.

Filename: ${input.filename}

Return a JSON object with this exact shape:
{
  "findings": [
    {
      "id": "f1",
      "dataElement": "Email Address",
      "location": { "file": "${input.filename}", "line": 42, "snippet": "exact code line" },
      "destination": "Server logs",
      "riskLevel": "high",
      "riskReason": "Email logged in plaintext",
      "draftedAssessment": "One formal sentence."
    }
  ],
  "summary": { "high": 0, "medium": 0, "low": 0, "topThirdParties": [] }
}

Code:
"""
${input.code}
"""`

  const interaction = await client.interactions.create({
    model: "gemini-3.5-flash",
    input: `${SYSTEM_PROMPT}\n\n${userPrompt}`,
  })

  console.log("[scan] tokens — in:", interaction.usage?.total_input_tokens, "out:", interaction.usage?.total_output_tokens, "total:", interaction.usage?.total_tokens)
  const raw = interaction.output_text ?? ""
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim()

  return JSON.parse(cleaned) as ScanResult
}
