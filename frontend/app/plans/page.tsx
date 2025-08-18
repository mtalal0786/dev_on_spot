"use client"

import { TopNav } from "../../components/top-nav"
import { Sidebar } from "../../components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeProvider } from "../../components/theme-provider"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Basic",
    price: "$9.99/month",
    features: ["5 projects", "Basic AI assistance", "Community support"],
  },
  {
    name: "Pro",
    price: "$24.99/month",
    features: ["Unlimited projects", "Advanced AI tools", "Priority support", "Custom templates"],
  },
  {
    name: "Enterprise",
    price: "Custom pricing",
    features: ["Unlimited everything", "Dedicated account manager", "Custom integrations", "On-premise deployment"],
  },
]

export default function PlansPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <h1 className="text-3xl font-bold text-foreground mb-8">Plans</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <Card key={index} className={index === 1 ? "border-primary" : ""}>
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold mb-4">{plan.price}</p>
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full">{index === 1 ? "Upgrade to Pro" : "Choose Plan"}</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
