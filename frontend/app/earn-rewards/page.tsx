"use client"

import { TopNav } from "../../components/top-nav"
import { Sidebar } from "../../components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeProvider } from "../../components/theme-provider"
import { Gift, Star, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

const rewardOptions = [
  { name: "Refer a Friend", icon: Users, description: "Earn points by inviting your friends to join", points: 500 },
  { name: "Complete Challenges", icon: Zap, description: "Earn points by completing coding challenges", points: 100 },
  { name: "Write a Blog Post", icon: Star, description: "Earn points by contributing to our blog", points: 300 },
]

export default function EarnRewardsPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <h1 className="text-3xl font-bold text-foreground mb-8">Earn Rewards</h1>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="mr-2 h-6 w-6" />
                  Your Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">1,250 points</p>
                <p className="text-muted-foreground">Keep earning to unlock exclusive perks!</p>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewardOptions.map((option, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <option.icon className="mr-2 h-6 w-6" />
                      {option.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{option.description}</p>
                    <p className="font-bold mb-2">Earn {option.points} points</p>
                    <Button>Start Earning</Button>
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
