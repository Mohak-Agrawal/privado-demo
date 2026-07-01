"use client"

import { useState, useEffect } from "react"
import type { Finding } from "@/lib/types"

const riskColors: Record<Finding["riskLevel"], string> = {
  high: "bg-red-500 text-white",
  medium: "bg-amber-500 text-white",
  low: "bg-emerald-500 text-white",
}

interface Props {
  finding: Finding | null
}

export default function AssessmentPanel({ finding }: Props) {
  const [text, setText] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setText(finding?.draftedAssessment ?? "")
    setCopied(false)
  }, [finding])

  if (!finding) {
    return (
      <div className="flex items-center justify-center h-40 text-[#9CA3AF] text-sm">
        Select a finding to review its assessment.
      </div>
    )
  }

  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <h3 className="font-bold text-[#F9FAFB] text-base">{finding.dataElement}</h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${riskColors[finding.riskLevel]}`}>
          {finding.riskLevel.toUpperCase()}
        </span>
      </div>

      <section>
        <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">Evidence</p>
        <pre className="bg-[#0A0E1A] border border-[#1F2937] rounded p-3 text-xs text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap">
          <code>{finding.location.snippet}</code>
        </pre>
        <p className="text-xs text-[#9CA3AF] font-mono mt-1">
          {finding.location.file}:{finding.location.line}
        </p>
      </section>

      <section>
        <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">Risk</p>
        <p className="text-sm text-[#F9FAFB]">{finding.riskReason}</p>
      </section>

      <section>
        <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
          Assessment Statement
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="w-full bg-[#0A0E1A] border border-[#1F2937] rounded p-3 text-sm text-[#F9FAFB] resize-y focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={handleCopy}
          className="mt-2 px-4 py-2 text-sm font-medium rounded border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 transition-colors"
        >
          {copied ? "Copied!" : "Copy Statement"}
        </button>
      </section>
    </div>
  )
}
