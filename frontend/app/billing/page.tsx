"use client"

import { TopNav } from "../../components/top-nav"
import { Sidebar } from "../../components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, DollarSign, Calendar } from "lucide-react"
import { ThemeProvider } from "../../components/theme-provider"

export default function BillingPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <h1 className="text-3xl font-bold text-foreground mb-8">Billing</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">Pro Plan</p>
                  <p className="text-muted-foreground">$49.99/month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="mr-2" />
                    Next Invoice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">$49.99</p>
                  <p className="text-muted-foreground">Due on May 1, 2023</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2" />
                    Billing Cycle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Monthly</p>
                  <p className="text-muted-foreground">Renews automatically</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
