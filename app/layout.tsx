import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import "./globals.css"

const font = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Privado Demo",
  description: "Scan source code for privacy risks and generate compliance assessments",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.variable}>
      <body className="font-sans min-h-screen" style={{ background: "#020617", color: "#F8FAFC", fontFamily: "var(--font-sans)" }}>
        {children}
      </body>
    </html>
  )
}
