"use client"

import { useState } from "react"
import type { Finding, ScanResult } from "@/lib/types"
import InputPanel from "@/components/InputPanel"
import FindingsList from "@/components/FindingsList"
import AssessmentPanel from "@/components/AssessmentPanel"
import SummaryBar from "@/components/SummaryBar"
import ExportButton from "@/components/ExportButton"

type State = "idle" | "scanning" | "done" | "error"

export default function Home() {
  const [state, setState] = useState<State>("idle")
  const [result, setResult] = useState<ScanResult | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [source, setSource] = useState("")

  const selectedFinding: Finding | null =
    result?.findings.find((f) => f.id === selectedId) ?? null

  async function handleScan(code: string, filename: string, src: string) {
    setState("scanning")
    setResult(null)
    setSelectedId(null)
    setSource(src)

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, filename }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Scan failed")
      }

      const data: ScanResult = await res.json()
      setResult(data)
      setSelectedId(data.findings[0]?.id ?? null)
      setState("done")
    } catch (err) {
      throw err
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1F2937]">
        <div>
          <h1 className="text-lg font-bold text-[#F9FAFB]">Privacy Assessment Copilot</h1>
          <p className="text-xs text-[#9CA3AF]">Scan source code for privacy risks</p>
        </div>
        {result && (
          <ExportButton findings={result.findings} source={source} />
        )}
      </header>

      <main className="flex-1 flex flex-col gap-4 p-6">
        {/* Summary bar */}
        {state === "done" && result && (
          <SummaryBar
            summary={result.summary}
            noFindings={result.findings.length === 0}
          />
        )}

        {/* Three column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          {/* Input */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5">
            <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-4">Input</h2>
            <InputPanel onScan={handleScan} scanning={state === "scanning"} />
          </div>

          {/* Findings */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 flex flex-col">
            <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-4">
              Findings
              {result && result.findings.length > 0 && (
                <span className="ml-2 text-[#6366F1]">({result.findings.length})</span>
              )}
            </h2>
            <div className="flex-1 overflow-y-auto">
              <FindingsList
                findings={result?.findings ?? []}
                selectedId={selectedId}
                onSelect={setSelectedId}
                scanning={state === "scanning"}
              />
            </div>
          </div>

          {/* Assessment */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5">
            <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-4">Assessment</h2>
            <AssessmentPanel finding={selectedFinding} />
          </div>
        </div>
      </main>
    </div>
  )
}
