"use client"

import { TopNav } from "@/components/top-nav"
import { Sidebar } from "@/components/sidebar"
import Whiteboard  from "@/components/whiteboard"
import { ThemeProvider } from "@/components/theme-provider"
// import { TldrawWhiteboard } from "@/components/TldrawWhiteboard";
export default function WhiteboardPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background flex flex-col">
        <TopNav />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isCollapsed={false} />
          <main className="flex-1">
            <Whiteboard />
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
