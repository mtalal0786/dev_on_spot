"use client"

import { TopNav } from "../../components/top-nav"
import { Sidebar } from "../../components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, LineChart } from "../../components/charts"
import { ThemeProvider } from "../../components/theme-provider"

export default function AnalyticsPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <h1 className="text-3xl font-bold text-foreground mb-8">Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Visitors</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Page Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
