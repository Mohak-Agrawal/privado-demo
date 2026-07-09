"use client"

import { exportAsMarkdown } from "@/lib/export"
import type { Finding } from "@/lib/types"

interface Props { findings: Finding[]; source: string }

export default function ExportButton({ findings, source }: Props) {
  if (findings.length === 0) return null
  return (
    <button onClick={() => exportAsMarkdown(findings, source)}
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-[#1E1E2E] text-[#475569] hover:border-green-400/30 hover:text-green-400 hover:bg-green-400/5 transition-all duration-200 cursor-pointer"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      Export Report
    </button>
  )
}
