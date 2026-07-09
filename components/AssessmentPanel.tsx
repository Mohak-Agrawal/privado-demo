"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { Finding } from "@/lib/types"

const riskConfig: Record<Finding["riskLevel"], { badge: string; label: string }> = {
  high: { badge: "bg-red-500/10 text-red-400 border border-red-500/20", label: "HIGH RISK" },
  medium: { badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20", label: "MEDIUM RISK" },
  low: { badge: "bg-green-400/10 text-green-400 border border-green-400/20", label: "LOW RISK" },
}

interface Props { finding: Finding | null }

export default function AssessmentPanel({ finding }: Props) {
  const [text, setText] = useState("")
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = "auto"
      el.style.height = el.scrollHeight + "px"
    }
  }, [])

  useEffect(() => {
    setText(finding?.draftedAssessment ?? "")
    setCopied(false)
    // let state flush before measuring
    setTimeout(autoResize, 0)
  }, [finding, autoResize])

  if (!finding) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <div className="w-10 h-10 rounded-full bg-[#1A1A24] border border-[#1E1E2E] flex items-center justify-center">
          <svg className="w-5 h-5 text-[#2D2D3D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-[#334155]">Select a finding</p>
          <p className="text-xs text-[#1E1E2E] mt-0.5">Click any finding to review its compliance assessment</p>
        </div>
      </div>
    )
  }

  const cfg = riskConfig[finding.riskLevel]

  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <p className="font-bold text-[#F8FAFC] text-sm leading-snug">{finding.dataElement}</p>
        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>

      <div className="h-px bg-[#1E1E2E]" />

      {/* Evidence */}
      <section>
        <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-2">Evidence</p>
        <div className="rounded-lg bg-[#0A0A0F] border border-[#1E1E2E] overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1E1E2E]">
            <span className="font-mono text-[10px] text-[#475569]">{finding.location.file}:{finding.location.line}</span>
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-[#1E1E2E]" />
              <span className="w-2 h-2 rounded-full bg-[#1E1E2E]" />
              <span className="w-2 h-2 rounded-full bg-[#1E1E2E]" />
            </div>
          </div>
          <pre className="px-4 py-3 text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
            <code>{finding.location.snippet}</code>
          </pre>
        </div>
      </section>

      {/* Risk */}
      <section>
        <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-2">Risk</p>
        <p className="text-xs text-[#94A3B8] leading-relaxed">{finding.riskReason}</p>
      </section>

      {/* Assessment */}
      <section>
        <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-2">Assessment Statement</p>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => { setText(e.target.value); autoResize() }}
          rows={3}
          className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2.5 text-xs text-[#F8FAFC] resize-none overflow-hidden focus:outline-none focus:border-green-400/30 focus:ring-1 focus:ring-green-400/10 leading-relaxed transition-colors"
        />
        <button onClick={handleCopy}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#1E1E2E] text-[#475569] hover:border-green-400/30 hover:text-green-400 hover:bg-green-400/5 transition-all duration-200 cursor-pointer"
        >
          {copied ? (
            <>
              <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
              Copy Statement
            </>
          )}
        </button>
      </section>
    </div>
  )
}
