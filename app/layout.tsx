import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Umasha Parami Abekoon - Fashion Designer & Product Developer",
  description:
    "Portfolio of Umasha Parami Abekoon, a passionate fashion design and product development student specializing in sustainable practices and cultural heritage preservation.",
  keywords: [
    "fashion design",
    "product development",
    "sustainable fashion",
    "batik art",
    "textile design",
    "Sri Lanka",
  ],
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} antialiased`}>
      <body className="font-sans bg-background text-foreground">{children}</body>
    </html>
  )
}
