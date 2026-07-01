"use client"

import type { Finding } from "@/lib/types"

const riskColors: Record<Finding["riskLevel"], string> = {
  high: "bg-red-500 text-white",
  medium: "bg-amber-500 text-white",
  low: "bg-emerald-500 text-white",
}

interface Props {
  finding: Finding
  selected: boolean
  onClick: () => void
}

export default function FindingCard({ finding, selected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        selected
          ? "border-l-4 border-l-indigo-500 border-t-indigo-500/30 border-r-indigo-500/30 border-b-indigo-500/30 bg-indigo-950/30"
          : "border-[#1F2937] bg-[#111827] hover:bg-[#1a2234]"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${riskColors[finding.riskLevel]}`}>
          {finding.riskLevel.toUpperCase()}
        </span>
      </div>
      <p className="font-semibold text-[#F9FAFB] text-sm mb-1">{finding.dataElement}</p>
      <p className="font-mono text-xs text-[#9CA3AF] mb-1">
        {finding.location.file}:{finding.location.line}
      </p>
      <p className="text-xs text-[#9CA3AF] truncate">{finding.destination}</p>
    </button>
  )
}
