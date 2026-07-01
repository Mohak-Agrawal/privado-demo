import type { Finding } from "./types"

export function exportAsMarkdown(findings: Finding[], source: string): void {
  const date = new Date().toISOString().split("T")[0]

  const high = findings.filter((f) => f.riskLevel === "high").length
  const medium = findings.filter((f) => f.riskLevel === "medium").length
  const low = findings.filter((f) => f.riskLevel === "low").length

  const sections = findings.map((f, i) => {
    const riskLabel = f.riskLevel.toUpperCase()
    return `### ${i + 1}. ${f.dataElement} — ${riskLabel} RISK
**File:** \`${f.location.file}\` line ${f.location.line}
**Code:** \`${f.location.snippet}\`
**Destination:** ${f.destination}
**Risk:** ${f.riskReason}

**Assessment Statement:**
${f.draftedAssessment}

---`
  })

  const md = `# Privacy Assessment Report
**Source:** ${source}
**Generated:** ${date}
**Risk Summary:** ${high} High · ${medium} Medium · ${low} Low

---

## Findings

${sections.join("\n\n")}
`

  const blob = new Blob([md], { type: "text/markdown" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `privacy-assessment-${date}.md`
  a.click()
  URL.revokeObjectURL(url)
}
