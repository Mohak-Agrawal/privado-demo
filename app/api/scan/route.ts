import { NextRequest, NextResponse } from "next/server"
import { scanCode } from "@/lib/scan"

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

  try {
    const result = await scanCode({ code: body.code, filename: body.filename })
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scan failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
