import { GoogleGenAI } from "@google/genai"
import type { ScanInput, ScanResult } from "./types"


const SYSTEM_PROMPT = `You are a privacy engineering expert trained to analyze source code for personal data handling risks. You think like a GDPR/CCPA compliance officer but communicate like a senior engineer.

When analyzing code you identify:
1. Personal data elements being collected or processed — emails, names, phone numbers, payment info, location data, device IDs, IP addresses, health data, behavioral data, authentication credentials
2. Where that data flows — third-party APIs, databases, logs, external services, analytics platforms
3. Privacy risks — logging sensitive data, sending to unexpected third parties, missing encryption, excessive collection, data stored longer than needed
4. The exact file and approximate line number where each issue occurs

Rules:
- Only report findings where personal data is actually involved. Do not flag general code patterns.
- If no personal data is found, return an empty findings array.
- riskLevel "high" = data leak, unencrypted PII, sent to unknown third party
- riskLevel "medium" = data logged, sent to analytics, stored without clear need
- riskLevel "low" = data collected but handled safely, minor concern
- draftedAssessment must be 2-3 sentences, formal tone, third person, past tense, ready to paste into a compliance document
- Respond ONLY with valid JSON. No markdown. No explanation outside the JSON.`

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
      "dataElement": "specific personal data type",
      "location": {
        "file": "${input.filename}",
        "line": 0,
        "snippet": "the exact code line"
      },
      "destination": "where data is sent or stored",
      "riskLevel": "high" | "medium" | "low",
      "riskReason": "one clear sentence explaining the risk",
      "draftedAssessment": "2-3 sentence formal compliance statement ready to copy into a privacy document"
    }
  ],
  "summary": {
    "high": 0,
    "medium": 0,
    "low": 0,
    "topThirdParties": []
  }
}

Code:
"""
${input.code}
"""`

  const response = await client.models.generateContent({
    model: "gemini-1.5-flash-8b",
    contents: userPrompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 2000,
    },
  })

  const raw = response.text ?? ""
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim()

  return JSON.parse(cleaned) as ScanResult
}
