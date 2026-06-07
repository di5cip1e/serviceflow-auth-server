import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Review Agent — AI-Powered Review Responses",
  description: "Never leave a review unanswered. AI-generated response drafts for your Google Business Profile reviews.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
