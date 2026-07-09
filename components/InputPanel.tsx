"use client"

import { useState } from "react"
import { fetchGitHubFile } from "@/lib/github"

type Tab = "github" | "paste"

interface Props {
  onScan: (code: string, filename: string, source: string) => Promise<void>
  scanning: boolean
}

export default function InputPanel({ onScan, scanning }: Props) {
  const [tab, setTab] = useState<Tab>("github")
  const [githubUrl, setGithubUrl] = useState("")
  const [pasteCode, setPasteCode] = useState("")
  const [pasteFilename, setPasteFilename] = useState("")
  const [error, setError] = useState("")
  const [fetching, setFetching] = useState(false)

  function extractFilename(url: string): string {
    try {
      const parts = new URL(url).pathname.split("/").filter(Boolean)
      return parts[parts.length - 1] ?? ""
    } catch { return "" }
  }

  async function handleScan() {
    setError("")
    try {
      if (tab === "github") {
        if (!githubUrl.trim()) { setError("Enter a GitHub URL"); return }
        setFetching(true)
        const { code, filename } = await fetchGitHubFile(githubUrl.trim())
        setFetching(false)
        await onScan(code, filename, githubUrl.trim())
      } else {
        if (!pasteCode.trim()) { setError("Paste some code to scan"); return }
        const filename = pasteFilename.trim() || "code.js"
        await onScan(pasteCode, filename, filename)
      }
    } catch (err) {
      setFetching(false)
      setError(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  const detectedFile = tab === "github" ? extractFilename(githubUrl) : ""

  const busy = scanning || fetching
  const inputClass = "w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] placeholder-[#2D2D3D] focus:outline-none focus:border-green-400/40 focus:ring-1 focus:ring-green-400/10 disabled:opacity-40 transition-colors"

  return (
    <div className="flex flex-col gap-3.5">
      {/* Tabs */}
      <div className="flex rounded-lg bg-[#0A0A0F] border border-[#1E1E2E] p-0.5 gap-0.5">
        {(["github", "paste"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${
              tab === t ? "bg-[#1A1A24] text-[#F8FAFC]" : "text-[#475569] hover:text-[#94A3B8]"
            }`}
          >
            {t === "github" ? (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub URL
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
                Paste Code
              </>
            )}
          </button>
        ))}
      </div>

      {tab === "github" ? (
        <div className="flex flex-col gap-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#2D2D3D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            <input type="text" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="github.com/user/repo/blob/main/file.js"
              disabled={busy} className={`${inputClass} pl-9`} />
          </div>
          {detectedFile && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1A1A24] border border-[#1E1E2E]">
              <svg className="w-3 h-3 text-[#475569]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="font-mono text-[11px] text-[#94A3B8]">{detectedFile}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <textarea value={pasteCode} onChange={(e) => setPasteCode(e.target.value)} rows={17}
            placeholder="// Paste source code here..." disabled={busy}
            className={`${inputClass} font-mono text-xs leading-relaxed resize-y`} />
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#2D2D3D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <input type="text" value={pasteFilename} onChange={(e) => setPasteFilename(e.target.value)}
              placeholder="filename.js (optional)" disabled={busy}
              className={`${inputClass} pl-9`} />
          </div>
        </div>
      )}

      {/* Scan button — Privado green */}
      <button onClick={handleScan} disabled={busy}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-400 text-[#0A0A0F] text-sm font-semibold hover:bg-green-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99] shadow-[0_0_20px_rgba(74,222,128,0.2)]"
      >
        {busy ? (
          <>
            <svg className="animate-spin h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="animate-pulse">Scanning for personal data…</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Scan for Privacy Risks
          </>
        )}
      </button>

      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-950/20 border border-red-900/30">
          <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-xs text-red-400 leading-relaxed">{error}</p>
        </div>
      )}
    </div>
  )
}
