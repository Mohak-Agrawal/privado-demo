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
      <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-green-950/20 border border-green-900/30">
        <div className="w-7 h-7 rounded-lg bg-green-400/10 border border-green-400/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-green-400">No privacy risks detected</p>
          <p className="text-xs text-green-700">Code appears clean — no personal data handling issues found.</p>
        </div>
      </div>
    )
  }

  const topBorder =
    summary.high > 0 ? "border-red-900/30 bg-red-950/10"
    : summary.medium > 0 ? "border-amber-900/30 bg-amber-950/10"
    : "border-green-900/30 bg-green-950/10"

  const kpis = [
    { count: summary.high, label: "High", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", dot: "bg-red-500" },
    { count: summary.medium, label: "Medium", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", dot: "bg-amber-500" },
    { count: summary.low, label: "Low", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20", dot: "bg-green-400" },
  ]

  return (
    <div className={`rounded-xl border px-4 py-3 ${topBorder}`}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2 flex-wrap">
          {kpis.map(({ count, label, color, bg, dot }) => (
            <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              <span className={`text-lg font-bold leading-none ${color}`}>{count}</span>
              <span className="text-[11px] text-[#94A3B8] font-medium">{label}</span>
            </div>
          ))}
        </div>

        {summary.topThirdParties.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[11px] text-[#475569]">Third parties</span>
            <div className="flex gap-1.5 flex-wrap">
              {summary.topThirdParties.map((tp) => (
                <span key={tp} className="text-[10px] px-2 py-0.5 rounded-md bg-[#1A1A24] border border-[#1E1E2E] text-[#94A3B8] font-medium">
                  {tp}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
