import { NextRequest, NextResponse } from "next/server"
import { generateReport } from "@/lib/report"
import type { Finding } from "@/lib/types"

export const maxDuration = 60

const VALID_RISK_LEVELS = new Set(["high", "medium", "low"])
const MAX_FINDINGS = 50

function isValidFinding(f: unknown): f is Finding {
  if (!f || typeof f !== "object") return false
  const x = f as Record<string, unknown>
  return (
    typeof x.id === "string" &&
    typeof x.dataElement === "string" &&
    typeof x.destination === "string" &&
    typeof x.riskReason === "string" &&
    typeof x.draftedAssessment === "string" &&
    VALID_RISK_LEVELS.has(x.riskLevel as string) &&
    x.location !== null &&
    typeof x.location === "object" &&
    typeof (x.location as Record<string, unknown>).file === "string" &&
    typeof (x.location as Record<string, unknown>).line === "number" &&
    typeof (x.location as Record<string, unknown>).snippet === "string"
  )
}

export async function POST(req: NextRequest) {
  let body: { findings?: unknown; source?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (!body.findings || !Array.isArray(body.findings)) {
    return NextResponse.json({ error: "Missing findings array" }, { status: 400 })
  }

  if (body.findings.length > MAX_FINDINGS) {
    return NextResponse.json({ error: "Too many findings" }, { status: 400 })
  }

  if (!body.findings.every(isValidFinding)) {
    return NextResponse.json({ error: "Invalid findings format" }, { status: 400 })
  }

  const findings = body.findings as Finding[]

  const apiKey = req.headers.get("x-gemini-key") ?? process.env.GEMINI_API_KEY ?? ""
  if (!apiKey) {
    return NextResponse.json({ error: "No API key provided" }, { status: 401 })
  }

  try {
    const report = await generateReport(findings, body.source ?? "Unknown source", apiKey)
    return NextResponse.json({ report })
  } catch (err) {
    const raw = err instanceof Error ? err.message : ""
    const safe = raw.includes("API key") || raw.includes("API_KEY") || raw.includes("401") || raw.includes("403")
      ? "Invalid or expired API key"
      : "Report generation failed — check your API key and try again"
    return NextResponse.json({ error: safe }, { status: 500 })
  }
}
