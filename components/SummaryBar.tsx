"use client"

import type { ScanResult } from "@/lib/types"

interface Props {
  summary: ScanResult["summary"] | null
  noFindings?: boolean
}

export default function SummaryBar({ summary, noFindings }: Props) {
  if (!summary) return null

  if (noFindings) {
    return (
      <div className="rounded-lg px-4 py-3 bg-emerald-900/40 border border-emerald-700/50 text-emerald-400 text-sm font-medium">
        No privacy risks detected.
      </div>
    )
  }

  const bgClass =
    summary.high > 0
      ? "bg-red-900/40 border-red-700/50 text-red-300"
      : summary.medium > 0
      ? "bg-amber-900/40 border-amber-700/50 text-amber-300"
      : "bg-emerald-900/40 border-emerald-700/50 text-emerald-300"

  const parties =
    summary.topThirdParties.length > 0
      ? ` · Third parties: ${summary.topThirdParties.join(", ")}`
      : ""

  return (
    <div className={`rounded-lg px-4 py-3 border text-sm font-medium ${bgClass}`}>
      <span className="text-red-400 font-bold">{summary.high} High</span>
      <span className="text-[#9CA3AF]"> · </span>
      <span className="text-amber-400 font-bold">{summary.medium} Medium</span>
      <span className="text-[#9CA3AF]"> · </span>
      <span className="text-emerald-400 font-bold">{summary.low} Low</span>
      <span className="text-[#9CA3AF]">{parties}</span>
    </div>
  )
}
