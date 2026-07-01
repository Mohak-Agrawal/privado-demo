"use client"

import { exportAsMarkdown } from "@/lib/export"
import type { Finding } from "@/lib/types"

interface Props {
  findings: Finding[]
  source: string
}

export default function ExportButton({ findings, source }: Props) {
  if (findings.length === 0) return null

  return (
    <button
      onClick={() => exportAsMarkdown(findings, source)}
      className="px-4 py-2 text-sm font-medium rounded border border-[#6366F1] text-[#6366F1] hover:bg-indigo-500/10 transition-colors"
    >
      Export Report
    </button>
  )
}
