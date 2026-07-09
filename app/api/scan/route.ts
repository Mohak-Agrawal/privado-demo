import { NextRequest, NextResponse } from "next/server"
import { scanCode, MOCK_RESULT } from "@/lib/scan"

const MAX_CODE_BYTES = 500_000

export async function POST(req: NextRequest) {
  let body: { code?: string; filename?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (!body.code || !body.filename) {
    return NextResponse.json({ error: "Missing required fields: code and filename" }, { status: 400 })
  }

  if (body.code.length > MAX_CODE_BYTES) {
    return NextResponse.json({ error: "Code too large — maximum 500 KB" }, { status: 413 })
  }

  if (body.filename.length > 255) {
    return NextResponse.json({ error: "Filename too long" }, { status: 400 })
  }

  const apiKey = req.headers.get("x-gemini-key") ?? process.env.GEMINI_API_KEY ?? ""

  try {
    const result = await scanCode({ code: body.code, filename: body.filename }, apiKey)
    return NextResponse.json(result)
  } catch (err) {
    const raw = err instanceof Error ? err.message : ""
    const reason = raw.includes("API key") || raw.includes("401") || raw.includes("403")
      ? "Invalid or expired API key — showing demo data"
      : "Scan failed — showing demo data"

    const mock = {
      ...MOCK_RESULT,
      findings: MOCK_RESULT.findings.map((f) => ({
        ...f,
        location: { ...f.location, file: body.filename! },
      })),
      _isMock: true,
      _mockReason: reason,
    }
    return NextResponse.json(mock)
  }
}
