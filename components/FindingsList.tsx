"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { Finding } from "@/lib/types"
import FindingCard from "./FindingCard"

interface Props {
  findings: Finding[]
  selectedId: string | null
  onSelect: (id: string) => void
  scanning: boolean
}

function SkeletonCard({ delay }: { delay: string }) {
  return (
    <div className="rounded-lg border border-l-4 border-[#1E1E2E] border-l-[#1E1E2E] bg-[#0A0A0F] px-3.5 py-3 animate-pulse" style={{ animationDelay: delay }}>
      <div className="h-4 w-14 bg-[#1E1E2E] rounded-md mb-2.5" />
      <div className="h-4 w-3/4 bg-[#1A1A24] rounded mb-2" />
      <div className="h-3 w-1/2 bg-[#1A1A24] rounded mb-1.5" />
      <div className="h-3 w-2/3 bg-[#1A1A24] rounded" />
    </div>
  )
}

export default function FindingsList({ findings, selectedId, onSelect, scanning }: Props) {
  if (scanning) {
    return (
      <div className="flex flex-col gap-2.5">
        <SkeletonCard delay="0ms" />
        <SkeletonCard delay="100ms" />
        <SkeletonCard delay="200ms" />
      </div>
    )
  }

  if (findings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <div className="w-10 h-10 rounded-full bg-[#1A1A24] border border-[#1E1E2E] flex items-center justify-center">
          <svg className="w-5 h-5 text-[#2D2D3D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803M10.5 7.5v6m3-3h-6" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-[#334155]">No findings yet</p>
          <p className="text-xs text-[#1E1E2E] mt-0.5">Scan some code to see results</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      <AnimatePresence>
        {findings.map((f, i) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, delay: i * 0.05 }}
          >
            <FindingCard
              finding={f}
              selected={f.id === selectedId}
              onClick={() => onSelect(f.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
