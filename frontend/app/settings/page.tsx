"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { useAppStore } from "@/lib/store"
import { TopNav } from "@/components/top-nav"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useAppStore()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
    }
  }, [user])

  const handleSave = () => {
    // In a real app, you'd call an API to update the user's information
    console.log("Saving user information:", { name, email })
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>
          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="dark-mode" checked={darkMode} onCheckedChange={toggleDarkMode} />
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                </div>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
          <Button variant="outline" className="mt-4" onClick={logout}>
            Logout
          </Button>
        </main>
      </div>
    </div>
  )
}
