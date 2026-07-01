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

  function extractFilename(url: string): string {
    try {
      const parts = new URL(url).pathname.split("/").filter(Boolean)
      return parts[parts.length - 1] ?? ""
    } catch {
      return ""
    }
  }

  async function handleScan() {
    setError("")
    try {
      if (tab === "github") {
        if (!githubUrl.trim()) {
          setError("Enter a GitHub URL")
          return
        }
        const { code, filename } = await fetchGitHubFile(githubUrl.trim())
        await onScan(code, filename, githubUrl.trim())
      } else {
        if (!pasteCode.trim()) {
          setError("Paste some code to scan")
          return
        }
        const filename = pasteFilename.trim() || "code.js"
        await onScan(pasteCode, filename, filename)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex rounded-lg border border-[#1F2937] overflow-hidden">
        {(["github", "paste"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-[#6366F1] text-white"
                : "bg-[#111827] text-[#9CA3AF] hover:text-[#F9FAFB]"
            }`}
          >
            {t === "github" ? "GitHub URL" : "Paste Code"}
          </button>
        ))}
      </div>

      {tab === "github" ? (
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/user/repo/blob/main/file.js"
            disabled={scanning}
            className="w-full bg-[#0A0E1A] border border-[#1F2937] rounded px-3 py-2 text-sm text-[#F9FAFB] placeholder-[#4B5563] focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
          {githubUrl && (
            <p className="text-xs text-[#9CA3AF] font-mono">
              {extractFilename(githubUrl) || "—"}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <textarea
            value={pasteCode}
            onChange={(e) => setPasteCode(e.target.value)}
            rows={20}
            placeholder="Paste source code here..."
            disabled={scanning}
            className="w-full bg-[#0A0E1A] border border-[#1F2937] rounded px-3 py-2 text-sm text-[#F9FAFB] placeholder-[#4B5563] font-mono focus:outline-none focus:border-indigo-500 resize-y disabled:opacity-50"
          />
          <input
            type="text"
            value={pasteFilename}
            onChange={(e) => setPasteFilename(e.target.value)}
            placeholder="Filename (e.g. app.js)"
            disabled={scanning}
            className="w-full bg-[#0A0E1A] border border-[#1F2937] rounded px-3 py-2 text-sm text-[#F9FAFB] placeholder-[#4B5563] focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
        </div>
      )}

      <button
        onClick={handleScan}
        disabled={scanning}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-[#6366F1] text-white text-sm font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {scanning ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Scanning…
          </>
        ) : (
          "Scan Code →"
        )}
      </button>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
