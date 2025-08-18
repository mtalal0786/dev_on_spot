"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Home, BarChart, Settings, HelpCircle } from "lucide-react"
import Link from "next/link"

export function CollapsibleMainMenu() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={`bg-background border-r transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}>
      <div className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full justify-center"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="space-y-2 p-2">
        <Link href="/" passHref>
          <Button variant="ghost" className="w-full justify-start">
            <Home className="h-4 w-4 mr-2" />
            {!isCollapsed && "Dashboard"}
          </Button>
        </Link>
        <Link href="/analytics" passHref>
          <Button variant="ghost" className="w-full justify-start">
            <BarChart className="h-4 w-4 mr-2" />
            {!isCollapsed && "Analytics"}
          </Button>
        </Link>
        <Link href="/settings" passHref>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            {!isCollapsed && "Settings"}
          </Button>
        </Link>
        <Link href="/help" passHref>
          <Button variant="ghost" className="w-full justify-start">
            <HelpCircle className="h-4 w-4 mr-2" />
            {!isCollapsed && "Help"}
          </Button>
        </Link>
      </nav>
    </div>
  )
}
