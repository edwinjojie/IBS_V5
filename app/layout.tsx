import "@/styles/globals.css"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeSync } from "@/components/theme-sync"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AirOps - Airline Operations Dashboard",
  description: "Modern airline operations management dashboard",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system">
          <ThemeSync />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
