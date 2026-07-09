"use client"

import { useState } from "react"
import type { Finding } from "@/lib/types"

interface Props {
  findings: Finding[]
  source: string
  onBack: () => void
  apiKey: string
}

const SECTION_ORDER = [
  "Executive Summary",
  "Data Elements Identified",
  "Risk Analysis",
  "Recommended Remediation",
  "Assessment Conclusion",
]

function parseReport(raw: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const lines = raw.split("\n")
  let currentSection = ""
  let buffer: string[] = []

  for (const line of lines) {
    const header = SECTION_ORDER.find(s => line.trim() === `## ${s}`)
    if (header) {
      if (currentSection) sections[currentSection] = buffer.join("\n").trim()
      currentSection = header
      buffer = []
    } else if (currentSection) {
      buffer.push(line)
    }
  }
  if (currentSection) sections[currentSection] = buffer.join("\n").trim()
  return sections
}

function renderSection(title: string, content: string) {
  if (title === "Data Elements Identified") {
    // Parse markdown table
    const rows = content.split("\n").filter(l => l.trim().startsWith("|"))
    if (rows.length > 2) {
      const headers = rows[0].split("|").filter(c => c.trim()).map(c => c.trim())
      const dataRows = rows.slice(2).map(r => r.split("|").filter(c => c.trim()).map(c => c.trim()))
      return (
        <div className="overflow-x-auto rounded-lg border border-[#1E1E2E]">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1E1E2E] bg-[#111118]">
                {headers.map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#475569] uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, i) => (
                <tr key={i} className="border-b border-[#1E1E2E] last:border-0 hover:bg-[#111118] transition-colors">
                  {row.map((cell, j) => (
                    <td key={j} className={`px-4 py-2.5 text-[#94A3B8] ${j === 3 ? getRiskCellClass(cell) : ""}`}>
                      {j === 0 ? <span className="font-medium text-[#F8FAFC]">{cell}</span> : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
  }

  if (title === "Recommended Remediation") {
    const items = content.split("\n").filter(l => l.trim().startsWith("-") || l.trim().startsWith("•"))
    if (items.length > 0) {
      return (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
              <span className="text-sm text-[#94A3B8] leading-relaxed">
                {item.replace(/^[-•]\s*/, "")}
              </span>
            </li>
          ))}
        </ul>
      )
    }
  }

  // Default: render paragraphs
  const paragraphs = content.split("\n\n").filter(p => p.trim())
  return (
    <div className="space-y-3">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-sm text-[#94A3B8] leading-relaxed">{p.trim()}</p>
      ))}
    </div>
  )
}

function getRiskCellClass(cell: string): string {
  const lower = cell.toLowerCase()
  if (lower.includes("high")) return "text-red-400 font-semibold"
  if (lower.includes("medium")) return "text-amber-400 font-semibold"
  if (lower.includes("low")) return "text-green-400 font-semibold"
  return ""
}

function SkeletonSection() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-3 w-48 bg-[#1E1E2E] rounded" />
      <div className="h-4 w-full bg-[#1A1A24] rounded" />
      <div className="h-4 w-5/6 bg-[#1A1A24] rounded" />
      <div className="h-4 w-4/5 bg-[#1A1A24] rounded" />
    </div>
  )
}

export default function ReportPanel({ findings, source, onBack, apiKey }: Props) {
  const [reportRaw, setReportRaw] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")

  async function handleGenerate() {
    setGenerating(true)
    setError("")
    setReportRaw(null)
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-gemini-key": apiKey },
        body: JSON.stringify({ findings, source }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Generation failed")
      setReportRaw(data.report)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report")
    } finally {
      setGenerating(false)
    }
  }

  const sections = reportRaw ? parseReport(reportRaw) : {}
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

  function handleExport() {
    if (!reportRaw) return
    const blob = new Blob([reportRaw], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dpia-report-${new Date().toISOString().split("T")[0]}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <button onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#475569] hover:text-[#F8FAFC] transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Findings
        </button>

        <div className="flex items-center gap-2">
          {reportRaw && (
            <button onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#1E1E2E] text-[#475569] hover:border-green-400/30 hover:text-green-400 hover:bg-green-400/5 transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export DPIA
            </button>
          )}
          {!reportRaw && !generating && (
            <button onClick={handleGenerate}
              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg bg-green-400 text-[#0A0A0F] hover:bg-green-300 transition-all cursor-pointer shadow-[0_0_16px_rgba(74,222,128,0.2)]"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Generate with AI
            </button>
          )}
        </div>
      </div>

      {/* Document */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-[#1E1E2E] bg-[#111118]">
        {/* Document header */}
        <div className="px-8 py-6 border-b border-[#1E1E2E] bg-[#0A0A0F]/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">Data Protection Impact Assessment</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1A1A24] border border-[#1E1E2E] text-[#475569]">DRAFT</span>
              </div>
              <h2 className="text-xl font-bold text-[#F8FAFC] mb-1">Privacy Risk Assessment Report</h2>
              <p className="text-xs text-[#475569] font-mono truncate max-w-lg">{source}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] text-[#475569]">Generated</p>
              <p className="text-xs text-[#94A3B8] font-medium">{date}</p>
              <p className="text-[10px] text-[#475569] mt-1">Findings</p>
              <p className="text-xs text-[#94A3B8] font-medium">{findings.length}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {!reportRaw && !generating && !error && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-400/10 border border-green-400/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[#F8FAFC] mb-1">Ready to generate DPIA report</p>
                <p className="text-xs text-[#475569]">AI will draft a formal compliance document from the {findings.length} findings</p>
              </div>
            </div>
          )}

          {generating && (
            <div className="space-y-10">
              {SECTION_ORDER.map((title, i) => (
                <div key={title} style={{ animationDelay: `${i * 150}ms` }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-px flex-1 bg-[#1E1E2E]" />
                    <span className="text-[10px] font-bold text-[#2D2D3D] uppercase tracking-widest px-3">{title}</span>
                    <div className="h-px flex-1 bg-[#1E1E2E]" />
                  </div>
                  <SkeletonSection />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-red-950/20 border border-red-900/30">
              <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <div>
                <p className="text-sm text-red-400 font-medium">Generation failed</p>
                <p className="text-xs text-red-700 mt-0.5">{error}</p>
                <button onClick={handleGenerate} className="text-xs text-red-400 underline mt-1 cursor-pointer">Retry</button>
              </div>
            </div>
          )}

          {reportRaw && (
            <div className="space-y-10 animate-fade-in">
              {SECTION_ORDER.map((title) => (
                <section key={title}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-[#1E1E2E]" />
                    <span className="text-[10px] font-bold text-[#475569] uppercase tracking-widest px-3">{title}</span>
                    <div className="h-px flex-1 bg-[#1E1E2E]" />
                  </div>
                  {sections[title]
                    ? renderSection(title, sections[title])
                    : <p className="text-xs text-[#334155] italic">Section not generated.</p>
                  }
                </section>
              ))}

              <div className="pt-4 border-t border-[#1E1E2E] flex items-center justify-between">
                <p className="text-[10px] text-[#334155]">Generated by Privado Demo · {date}</p>
                <p className="text-[10px] text-[#334155]">DRAFT — Not for regulatory submission without human review</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
