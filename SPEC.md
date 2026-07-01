# Privacy Assessment Copilot — Build Spec

## Goal
Build and deploy a working web app that scans source code for privacy risks and auto-generates a compliance assessment. This is a demo for Privado.ai's CEO — it should look and feel like something their team would be proud to ship.

## Deliverable
- Next.js 14 app (App Router)
- Deployed to Vercel
- Works end to end: paste code or GitHub file URL → scan → findings with citations → exportable assessment

---

## Stack
- Next.js 14 (App Router)
- TypeScript (strict)
- Tailwind CSS
- Anthropic Claude API (claude-sonnet-4-6)
- No database. No auth. No external state. Pure stateless tool.

---

## Environment Variables
```
ANTHROPIC_API_KEY=
```
Create `.env.local` with this. Do not commit it.

---

## File Structure
```
/app
  layout.tsx
  page.tsx
  api/
    scan/
      route.ts
/components
  InputPanel.tsx
  FindingsList.tsx
  FindingCard.tsx
  AssessmentPanel.tsx
  SummaryBar.tsx
  ExportButton.tsx
/lib
  types.ts
  scan.ts
  github.ts
  export.ts
/public
  (empty)
```

---

## Data Types — `/lib/types.ts`

```typescript
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
}

export type ScanInput = {
  code: string
  filename: string
}
```

---

## Claude API Logic — `/lib/scan.ts`

### System prompt
```
You are a privacy engineering expert trained to analyze source code for personal data handling risks. You think like a GDPR/CCPA compliance officer but communicate like a senior engineer.

When analyzing code you identify:
1. Personal data elements being collected or processed — emails, names, phone numbers, payment info, location data, device IDs, IP addresses, health data, behavioral data, authentication credentials
2. Where that data flows — third-party APIs, databases, logs, external services, analytics platforms
3. Privacy risks — logging sensitive data, sending to unexpected third parties, missing encryption, excessive collection, data stored longer than needed
4. The exact file and approximate line number where each issue occurs

Rules:
- Only report findings where personal data is actually involved. Do not flag general code patterns.
- If no personal data is found, return an empty findings array.
- riskLevel "high" = data leak, unencrypted PII, sent to unknown third party
- riskLevel "medium" = data logged, sent to analytics, stored without clear need
- riskLevel "low" = data collected but handled safely, minor concern
- draftedAssessment must be 2-3 sentences, formal tone, third person, past tense, ready to paste into a compliance document
- Respond ONLY with valid JSON. No markdown. No explanation outside the JSON.
```

### User prompt template
```
Analyze the following code for privacy risks.

Filename: {filename}

Return a JSON object with this exact shape:
{
  "findings": [
    {
      "id": "f1",
      "dataElement": "specific personal data type",
      "location": {
        "file": "{filename}",
        "line": 0,
        "snippet": "the exact code line"
      },
      "destination": "where data is sent or stored",
      "riskLevel": "high" | "medium" | "low",
      "riskReason": "one clear sentence explaining the risk",
      "draftedAssessment": "2-3 sentence formal compliance statement ready to copy into a privacy document"
    }
  ],
  "summary": {
    "high": 0,
    "medium": 0,
    "low": 0,
    "topThirdParties": []
  }
}

Code:
"""
{code}
"""
```

### API call
- Model: `claude-sonnet-4-6`
- max_tokens: 4000
- Parse response, strip any accidental markdown fences before JSON.parse
- On parse error, throw with message "Failed to parse scan results"

---

## GitHub Fetch — `/lib/github.ts`

Accept a raw GitHub file URL (github.com/user/repo/blob/main/file.js) or raw URL.

Convert github.com URLs:
- Replace `github.com` with `raw.githubusercontent.com`
- Remove `/blob/` segment (replace `/blob/` with `/`)

Fetch the raw content. Return `{ code: string, filename: string }`.

If fetch fails, throw with a clear message.

Only accept URLs that include `github.com` or `raw.githubusercontent.com`. Reject others.

---

## API Route — `/app/api/scan/route.ts`

POST endpoint. Body: `{ code: string, filename: string }`

- Validate body — if either field missing, return 400
- Call scanCode from lib/scan.ts
- Return ScanResult as JSON
- On error, return 500 with `{ error: message }`

---

## Export — `/lib/export.ts`

Function `exportAsMarkdown(findings: Finding[], source: string): void`

Output format:
```markdown
# Privacy Assessment Report
**Source:** {source}
**Generated:** {date}
**Risk Summary:** {high} High · {medium} Medium · {low} Low

---

## Findings

### 1. {dataElement} — HIGH RISK
**File:** `{file}` line {line}
**Code:** `{snippet}`
**Destination:** {destination}
**Risk:** {riskReason}

**Assessment Statement:**
{draftedAssessment}

---
```

Trigger browser download via Blob + anchor click. Filename: `privacy-assessment-{date}.md`

---

## UI Design

### Visual Identity
- Background: `#0A0E1A` (near-black, deep navy)
- Surface: `#111827` (card backgrounds)
- Border: `#1F2937`
- Accent: `#6366F1` (indigo — privacy/trust feel, not Privado's green, this is a demo not a clone)
- High risk: `#EF4444` red
- Medium risk: `#F59E0B` amber
- Low risk: `#10B981` emerald
- Text primary: `#F9FAFB`
- Text secondary: `#9CA3AF`
- Font: Inter (Google Fonts)

### Layout — Three Columns (desktop), Stacked (mobile)

```
┌─────────────────────────────────────────────────────────┐
│  Privacy Assessment Copilot          [Export Report]     │
├──────────────┬────────────────────┬─────────────────────┤
│              │                    │                      │
│  INPUT       │  FINDINGS          │  ASSESSMENT          │
│              │                    │                      │
│  [GitHub URL]│  ● High (2)        │  Selected finding    │
│  or          │  ● Medium (3)      │  drafted text        │
│  [Paste code]│  ● Low (1)         │  (editable)          │
│              │                    │                      │
│  [Scan →]    │  [Finding cards]   │  [Copy to clipboard] │
│              │                    │                      │
└──────────────┴────────────────────┴─────────────────────┘
```

Mobile: Input → Findings → Assessment (stacked, full width)

### SummaryBar
Shows after scan completes. Sits above the three columns.
Displays: `2 High · 3 Medium · 1 Low · Third parties: Sendgrid, Mixpanel`
Background matches risk severity of highest finding.

### InputPanel — `/components/InputPanel.tsx`
- Tab toggle: "GitHub URL" | "Paste Code"
- GitHub URL tab: single text input + filename auto-extracted from URL
- Paste Code tab: textarea (monospace font, 20 rows) + filename text input
- "Scan Code →" button — indigo, full width, shows spinner while loading
- Disabled state while scanning
- Error message display below button (red, small text)

### FindingsList — `/components/FindingsList.tsx`
- Scrollable list of FindingCard components
- "No findings" empty state if array is empty
- Selected card highlighted with indigo left border

### FindingCard — `/components/FindingCard.tsx`
- Risk badge (colored pill): HIGH / MEDIUM / LOW
- Data element name (bold, white)
- File + line reference (monospace, secondary color): `src/auth/login.js:42`
- Destination (secondary color, smaller)
- Clicking card selects it and populates AssessmentPanel
- Subtle hover state

### AssessmentPanel — `/components/AssessmentPanel.tsx`
- Shows when a finding is selected
- Header: data element name + risk badge
- Section: "Evidence" — shows code snippet in a styled code block
- Section: "Risk" — riskReason in plain text
- Section: "Assessment Statement" — draftedAssessment in an editable textarea
- "Copy Statement" button — copies textarea content to clipboard, shows "Copied!" for 2 seconds
- Empty state when no finding selected: "Select a finding to review its assessment"

### ExportButton — `/components/ExportButton.tsx`
- Only visible after scan completes and findings exist
- Calls exportAsMarkdown
- Label: "Export Report"
- Outlined style (not filled)

---

## States to Handle

| State | What to show |
|-------|-------------|
| Initial | Input panel only. Findings and Assessment panels show placeholder. |
| Scanning | Button spinner. Input disabled. |
| Complete (findings) | SummaryBar appears. All three columns populated. First finding auto-selected. |
| Complete (no findings) | SummaryBar shows "No privacy risks detected." Empty state in FindingsList. |
| Error | Error message below scan button. Red text. |

---

## Loading State
While scanning, show a subtle pulsing skeleton in the FindingsList area. Not a spinner — actual skeleton cards, 3 of them, with the risk badge area and text lines as gray animated blocks.

---

## Demo Test Case
The app should work correctly when given this GitHub URL:
`https://github.com/Privado-Inc/njs_accounts/blob/master/server.js`

This is a real repo with personal data handling code. It should produce at least 2-3 meaningful findings. Verify this works before considering the build done.

---

## Vercel Deployment
- Add ANTHROPIC_API_KEY to Vercel environment variables
- Deploy via `vercel --prod`
- Confirm live URL works end to end before marking complete

---

## Definition of Done
- [ ] GitHub URL input works and fetches real code
- [ ] Paste code input works
- [ ] Scan produces findings with real data elements, file references, risk levels
- [ ] Clicking a finding populates the assessment panel
- [ ] Assessment text is editable
- [ ] Copy button works
- [ ] Export produces a valid markdown file download
- [ ] SummaryBar shows correct counts
- [ ] Responsive on mobile
- [ ] Deployed to Vercel with live URL
- [ ] Tested with `https://github.com/Privado-Inc/njs_accounts/blob/master/server.js`
