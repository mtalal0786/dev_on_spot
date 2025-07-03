"use client"

import { TopNav } from "../../components/top-nav"
import { Sidebar } from "../../components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Server, Database, Cloud } from "lucide-react"
import { ThemeProvider } from "../../components/theme-provider"

export default function InfrastructurePage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <h1 className="text-3xl font-bold text-foreground mb-8">Infrastructure</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="mr-2" />
                    Server Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-500 font-semibold">All systems operational</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="mr-2" />
                    Database Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>65% of 1TB used</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Cloud className="mr-2" />
                    CDN Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Active in 5 regions</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
