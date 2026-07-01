import Anthropic from "@anthropic-ai/sdk"
import type { ScanInput, ScanResult } from "./types"

const client = new Anthropic()

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

export async function scanCode(input: ScanInput): Promise<ScanResult> {
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

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  })

  const raw = message.content[0].type === "text" ? message.content[0].text : ""

  // Strip accidental markdown fences
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim()

  try {
    return JSON.parse(cleaned) as ScanResult
  } catch {
    throw new Error("Failed to parse scan results")
  }
}
