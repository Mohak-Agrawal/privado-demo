"use client"

import { useState, useEffect } from "react"
import type { Finding, ScanResult } from "@/lib/types"
import InputPanel from "@/components/InputPanel"
import FindingsList from "@/components/FindingsList"
import AssessmentPanel from "@/components/AssessmentPanel"
import SummaryBar from "@/components/SummaryBar"
import ExportButton from "@/components/ExportButton"
import ReportPanel from "@/components/ReportPanel"
import ApiKeyGate from "@/components/ApiKeyGate"

const LS_KEY = "privado_gemini_key"

type AppState = "idle" | "scanning" | "done"
type View = "findings" | "report"
type MobileTab = "source" | "findings" | "assessment"

export default function Home() {
  // undefined = hydrating, null = no key, string = ready
  const [apiKey, setApiKey] = useState<string | null | undefined>(undefined)
  const [appState, setAppState] = useState<AppState>("idle")
  const [result, setResult] = useState<ScanResult | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [source, setSource] = useState("")
  const [view, setView] = useState<View>("findings")
  const [mobileTab, setMobileTab] = useState<MobileTab>("source")

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY)
    setApiKey(stored ?? null)
  }, [])

  function handleKey(key: string) {
    localStorage.setItem(LS_KEY, key)
    setApiKey(key)
  }

  if (apiKey === undefined) return null // SSR/hydration — render nothing
  if (apiKey === null) return <ApiKeyGate onKey={handleKey} />

  const selectedFinding: Finding | null =
    result?.findings.find((f) => f.id === selectedId) ?? null

  async function handleScan(code: string, filename: string, src: string) {
    setAppState("scanning")
    setResult(null)
    setSelectedId(null)
    setSource(src)
    setView("findings")
    setMobileTab("findings")
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-gemini-key": apiKey! },
        body: JSON.stringify({ code, filename }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Scan failed")
      }
      const data: ScanResult = await res.json()
      setResult(data)
      setSelectedId(data.findings[0]?.id ?? null)
      setAppState("done")
    } catch (err) {
      setMobileTab("source")
      throw err
    }
  }

  function handleSelectFinding(id: string) {
    setSelectedId(id)
    setMobileTab("assessment")
  }

  const mobileTabs: { id: MobileTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: "source",
      label: "Source",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      ),
    },
    {
      id: "findings",
      label: "Findings",
      badge: result?.findings.length,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
    },
    {
      id: "assessment",
      label: "Assessment",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0A0A0F" }}>

      {/* Header */}
      <header className="relative border-b border-[#1E1E2E] bg-[#0A0A0F]/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-green-400/20 border border-purple-500/20 rounded-lg" />
              <svg className="relative w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-[#F8FAFC] tracking-tight truncate">Privado <span className="text-[#475569] font-normal">Demo</span></h1>
                <span className="hidden sm:inline-flex flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/20">
                  Demo
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-[#475569]">Privacy risk detection · GDPR · CCPA</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {appState === "done" && result && view === "findings" && (
              <>
                <span className="hidden md:flex items-center gap-1.5 text-[11px] text-[#475569] mr-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Analysis complete
                </span>
                <ExportButton findings={result.findings} source={source} />
                {result.findings.length > 0 && (
                  <button
                    onClick={() => setView("report")}
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-green-400 text-[#0A0A0F] hover:bg-green-300 transition-all cursor-pointer shadow-[0_0_12px_rgba(74,222,128,0.2)]"
                  >
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    <span className="hidden sm:inline">Generate Full Report</span>
                    <span className="sm:hidden">Report</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-5 gap-3 sm:gap-4">

        {/* Mock warning banner */}
        {appState === "done" && result?._isMock && view === "findings" && (
          <div className="animate-slide-up flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-950/30 border border-amber-900/40">
            <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-amber-400">Demo mode — {result._mockReason}</p>
              <p className="text-[11px] text-amber-700 mt-0.5">Check your Gemini API key. Findings below are sample data for illustration only.</p>
            </div>
          </div>
        )}

        {/* Summary bar */}
        {appState === "done" && result && view === "findings" && (
          <div className="animate-slide-up">
            <SummaryBar summary={result.summary} noFindings={result.findings.length === 0} />
          </div>
        )}

        {/* Report view */}
        {view === "report" && result && (
          <ReportPanel findings={result.findings} source={source} onBack={() => setView("findings")} apiKey={apiKey} />
        )}

        {/* Findings view */}
        {view === "findings" && (
          <>
            {/* Mobile tab bar — hidden on md+ */}
            <div className="flex md:hidden rounded-xl bg-[#111118] border border-[#1E1E2E] p-1 gap-1">
              {mobileTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMobileTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer relative ${
                    mobileTab === tab.id
                      ? "bg-[#1A1A24] text-[#F8FAFC]"
                      : "text-[#475569] hover:text-[#94A3B8]"
                  }`}
                >
                  {tab.icon}
                  <span className="hidden xs:inline">{tab.label}</span>
                  {tab.badge != null && tab.badge > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded-full bg-green-400 text-[#0A0A0F]">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Desktop: three columns | Mobile: active tab only */}
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr_1fr] gap-3 sm:gap-4 flex-1 min-h-0">

              {/* Source panel */}
              <div className={`flex-col rounded-xl border border-[#1E1E2E] bg-[#111118] overflow-hidden ${
                mobileTab === "source" ? "flex" : "hidden md:flex"
              }`}>
                <div className="px-4 py-3 border-b border-[#1E1E2E] flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#475569]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                  <span className="text-[10px] font-semibold text-[#475569] uppercase tracking-widest">Source</span>
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                  <InputPanel onScan={handleScan} scanning={appState === "scanning"} />
                </div>
              </div>

              {/* Findings panel */}
              <div className={`flex-col rounded-xl border border-[#1E1E2E] bg-[#111118] overflow-hidden ${
                mobileTab === "findings" ? "flex" : "hidden md:flex"
              }`}>
                <div className="px-4 py-3 border-b border-[#1E1E2E] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-[#475569]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <span className="text-[10px] font-semibold text-[#475569] uppercase tracking-widest">Findings</span>
                  </div>
                  {result && result.findings.length > 0 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/20">
                      {result.findings.length}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  <FindingsList
                    findings={result?.findings ?? []}
                    selectedId={selectedId}
                    onSelect={handleSelectFinding}
                    scanning={appState === "scanning"}
                  />
                </div>
              </div>

              {/* Assessment panel */}
              <div className={`flex-col rounded-xl border border-[#1E1E2E] bg-[#111118] overflow-hidden ${
                mobileTab === "assessment" ? "flex" : "hidden md:flex"
              }`}>
                <div className="px-4 py-3 border-b border-[#1E1E2E] flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#475569]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                  <span className="text-[10px] font-semibold text-[#475569] uppercase tracking-widest">Assessment</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <AssessmentPanel finding={selectedFinding} />
                </div>
              </div>

            </div>
          </>
        )}
      </main>

      <footer className="border-t border-[#1E1E2E] px-4 sm:px-6 py-3">
        <p className="text-[11px] text-[#334155] text-center">
          Privado Demo · For compliance review purposes only
        </p>
      </footer>
    </div>
  )
}
