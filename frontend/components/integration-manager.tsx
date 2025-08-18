"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Github, Trello, MessageSquare, Cloud } from "lucide-react"

export function IntegrationManager() {
  const [integration, setIntegration] = useState("")

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="integration">Integration</Label>
        <Select value={integration} onValueChange={setIntegration}>
          <SelectTrigger id="integration">
            <SelectValue placeholder="Select integration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="github">GitHub</SelectItem>
            <SelectItem value="jira">Jira</SelectItem>
            <SelectItem value="slack">Slack</SelectItem>
            <SelectItem value="aws">AWS</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="api-key">API Key</Label>
        <Input id="api-key" type="password" placeholder="Enter API key" />
      </div>
      <Button className="w-full">
        {integration === "github" && <Github className="mr-2 h-4 w-4" />}
        {integration === "jira" && <Trello className="mr-2 h-4 w-4" />}
        {integration === "slack" && <MessageSquare className="mr-2 h-4 w-4" />}
        {integration === "aws" && <Cloud className="mr-2 h-4 w-4" />}
        Connect {integration}
      </Button>
    </div>
  )
}
