import { NextRequest } from "next/server"
import { scanCode, MOCK_RESULT } from "@/lib/scan"

export const runtime = "edge"

const MAX_CODE_BYTES = 500_000
const DEMO_KEY = "__demo__"

export async function POST(req: NextRequest) {
  let body: { code?: string; filename?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers: { "Content-Type": "application/json" } })
  }

  if (!body.code || !body.filename) {
    return new Response(JSON.stringify({ error: "Missing required fields: code and filename" }), { status: 400, headers: { "Content-Type": "application/json" } })
  }

  if (body.code.length > MAX_CODE_BYTES) {
    return new Response(JSON.stringify({ error: "Code too large — maximum 500 KB" }), { status: 413, headers: { "Content-Type": "application/json" } })
  }

  if (body.filename.length > 255) {
    return new Response(JSON.stringify({ error: "Filename too long" }), { status: 400, headers: { "Content-Type": "application/json" } })
  }

  const apiKey = req.headers.get("x-gemini-key") ?? ""

  const mockWithFile = {
    ...MOCK_RESULT,
    findings: MOCK_RESULT.findings.map((f) => ({ ...f, location: { ...f.location, file: body.filename! } })),
  }

  if (apiKey === DEMO_KEY) {
    return new Response(JSON.stringify({ ...mockWithFile, _isMock: true, _mockReason: "Demo mode — sample data for illustration" }), {
      headers: { "Content-Type": "application/json" },
    })
  }

  // Stream the response so Edge Function has no timeout.
  // Send a leading space immediately to open the stream, then write the result.
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(" "))
      try {
        const result = await scanCode({ code: body.code!, filename: body.filename! }, apiKey)
        controller.enqueue(encoder.encode(JSON.stringify(result)))
      } catch (err) {
        const raw = err instanceof Error ? err.message : String(err)
        const reason = raw.includes("API_KEY_INVALID") || raw.includes("API key not valid") || raw.includes("401") || raw.includes("403")
          ? "Invalid or expired API key — showing demo data"
          : raw.includes("429") || raw.includes("RESOURCE_EXHAUSTED") || raw.includes("TooManyRequests")
          ? "Rate limit hit — showing demo data"
          : "Scan failed — showing demo data"
        controller.enqueue(encoder.encode(JSON.stringify({ ...mockWithFile, _isMock: true, _mockReason: reason })))
      }
      controller.close()
    },
  })

  return new Response(stream, { headers: { "Content-Type": "application/json" } })
}
