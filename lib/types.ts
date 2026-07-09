export type RiskLevel = "high" | "medium" | "low"

export type Finding = {
  id: string
  dataElement: string
  location: {
    file: string
    line: number
    snippet: string
  }
  destination: string
  riskLevel: RiskLevel
  riskReason: string
  draftedAssessment: string
}

export type ScanResult = {
  findings: Finding[]
  summary: {
    high: number
    medium: number
    low: number
    topThirdParties: string[]
  }
  _isMock?: boolean
  _mockReason?: string
}

export type ScanInput = {
  code: string
  filename: string
}
