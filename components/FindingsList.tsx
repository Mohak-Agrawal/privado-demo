"use client"

import type { Finding } from "@/lib/types"
import FindingCard from "./FindingCard"

interface Props {
  findings: Finding[]
  selectedId: string | null
  onSelect: (id: string) => void
  scanning: boolean
}

function SkeletonCard() {
  return (
    <div className="p-4 rounded-lg border border-[#1F2937] bg-[#111827] animate-pulse">
      <div className="h-4 w-16 bg-[#1F2937] rounded-full mb-3" />
      <div className="h-4 w-3/4 bg-[#1F2937] rounded mb-2" />
      <div className="h-3 w-1/2 bg-[#1F2937] rounded mb-1" />
      <div className="h-3 w-2/3 bg-[#1F2937] rounded" />
    </div>
  )
}

export default function FindingsList({ findings, selectedId, onSelect, scanning }: Props) {
  if (scanning) {
    return (
      <div className="flex flex-col gap-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (findings.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-[#9CA3AF] text-sm">
        No privacy findings detected.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto">
      {findings.map((f) => (
        <FindingCard
          key={f.id}
          finding={f}
          selected={f.id === selectedId}
          onClick={() => onSelect(f.id)}
        />
      ))}
    </div>
  )
}
