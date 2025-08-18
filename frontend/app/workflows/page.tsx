"use client"

import { useState } from "react"
import { TopNav } from "../../components/top-nav"
import { Sidebar } from "../../components/sidebar"
import { ThemeProvider } from "../../components/theme-provider"
import { WorkflowBuilder } from "@/components/workflow-builder"

export default function WorkflowsPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar isCollapsed={isSidebarCollapsed} />
          <main className="flex-1">
            <WorkflowBuilder />
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
