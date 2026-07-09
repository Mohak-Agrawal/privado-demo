"use client"

import { useState } from "react"

export default function ApiKeyGate({ onKey }: { onKey: (key: string) => void }) {
  const [value, setValue] = useState("")
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) {
      setError("Please enter your Gemini API key.")
      return
    }
    onKey(trimmed)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#0A0A0F" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl overflow-hidden mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-green-400/20 border border-purple-500/20 rounded-xl" />
            <svg className="relative w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[#F8FAFC] tracking-tight">Privado <span className="text-[#475569] font-normal">Demo</span></h1>
          <p className="text-sm text-[#475569] mt-1">Privacy risk detection · GDPR · CCPA</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#1E1E2E] bg-[#111118] p-6">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-[#F8FAFC] mb-1">Enter your Gemini API key</h2>
            <p className="text-xs text-[#475569] leading-relaxed">
              Your key is used only for this session and never sent to our servers — it is passed directly to the Gemini API.
              Get one free at{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 underline underline-offset-2"
              >
                aistudio.google.com
              </a>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#475569] uppercase tracking-widest">
                API Key
              </label>
              <input
                type="password"
                autoComplete="off"
                placeholder="AIza..."
                value={value}
                onChange={(e) => { setValue(e.target.value); setError("") }}
                className="w-full rounded-lg bg-[#0A0A0F] border border-[#1E1E2E] text-sm text-[#F8FAFC] placeholder-[#334155] px-3 py-2.5 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-mono"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-green-400 text-[#0A0A0F] text-sm font-semibold hover:bg-green-300 transition-all shadow-[0_0_12px_rgba(74,222,128,0.2)] cursor-pointer"
            >
              Start Application
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-[#334155] mt-4">
          Key is stored in your browser&apos;s localStorage and cleared when you clear site data.
        </p>
      </div>
    </div>
  )
}
