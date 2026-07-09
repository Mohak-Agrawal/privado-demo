"use client"

import { useEffect, useRef } from "react"
import hljs from "highlight.js/lib/core"
import javascript from "highlight.js/lib/languages/javascript"
import type { Finding } from "@/lib/types"

hljs.registerLanguage("javascript", javascript)

const riskConfig: Record<Finding["riskLevel"], {
  badge: string; dot: string; borderL: string; selectedBg: string; selectedBorder: string
}> = {
  high: {
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    dot: "bg-red-500",
    borderL: "border-l-red-500",
    selectedBg: "bg-red-950/20",
    selectedBorder: "border-t-red-900/40 border-r-red-900/40 border-b-red-900/40",
  },
  medium: {
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-500",
    borderL: "border-l-amber-500",
    selectedBg: "bg-amber-950/20",
    selectedBorder: "border-t-amber-900/40 border-r-amber-900/40 border-b-amber-900/40",
  },
  low: {
    badge: "bg-green-400/10 text-green-400 border-green-400/20",
    dot: "bg-green-400",
    borderL: "border-l-green-400",
    selectedBg: "bg-green-950/20",
    selectedBorder: "border-t-green-900/40 border-r-green-900/40 border-b-green-900/40",
  },
}

interface Props {
  finding: Finding
  selected: boolean
  onClick: () => void
}

function CodeSnippet({ code }: { code: string }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    if (ref.current && !ref.current.dataset.highlighted) {
      hljs.highlightElement(ref.current)
    }
  }, [code])
  return (
    <pre className="mt-2 px-3 py-2 rounded-md bg-[#0A0A0F] border border-[#1E1E2E] overflow-x-auto text-[10px] leading-relaxed">
      <code ref={ref} className="language-javascript">{code}</code>
    </pre>
  )
}

export default function FindingCard({ finding, selected, onClick }: Props) {
  const cfg = riskConfig[finding.riskLevel]

  return (
    <button onClick={onClick} className={`w-full text-left rounded-lg border border-l-4 transition-all duration-200 cursor-pointer group ${cfg.borderL} ${
      selected
        ? `${cfg.selectedBg} ${cfg.selectedBorder}`
        : "bg-[#0A0A0F] border-t-[#1E1E2E] border-r-[#1E1E2E] border-b-[#1E1E2E] hover:bg-[#111118] hover:border-t-[#2D2D3D] hover:border-r-[#2D2D3D] hover:border-b-[#2D2D3D]"
    }`}>
      <div className="px-3.5 py-3">
        <div className="mb-2">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md border ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {finding.riskLevel.toUpperCase()}
          </span>
        </div>
        <p className="font-semibold text-[#F8FAFC] text-[13px] mb-1.5 leading-snug">{finding.dataElement}</p>
        <p className="font-mono text-[10px] text-[#475569] mb-1 flex items-center gap-1">
          <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
          <span className="text-[#94A3B8]">{finding.location.file}</span>
          <span className="text-[#2D2D3D]">:</span>
          <span className="text-[#475569]">{finding.location.line}</span>
        </p>
        <p className="text-[10px] text-[#475569] truncate flex items-center gap-1 mb-2">
          <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
          {finding.destination}
        </p>
        <CodeSnippet code={finding.location.snippet} />
      </div>
    </button>
  )
}
