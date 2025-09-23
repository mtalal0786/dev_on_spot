// app/layout.tsx
import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "../components/theme-provider"
import { AuthProvider } from "@/lib/auth"
import ErrorBoundary from "@/components/error-boundary"

// NEW: mount both toasts
import { Toaster } from "@/components/ui/toaster" // existing top/center app toasts
import { NotificationToaster } from "@/components/ui/notification-toaster" // new bottom-right notifications

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AI Software Engineer",
  description: "Build entire projects with AI",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}

              {/* Keep both toasters at the root so they work across the app */}
              <Toaster />
              <NotificationToaster />
            </ThemeProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
