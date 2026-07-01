import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Privacy Assessment Copilot",
  description: "Scan source code for privacy risks and generate compliance assessments",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`} style={{ background: "#0A0E1A", color: "#F9FAFB" }}>
        {children}
      </body>
    </html>
  )
}
