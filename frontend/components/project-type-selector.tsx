"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const projectTypes = [
  { id: "desktop", label: "Desktop Software" },
  { id: "mobile", label: "Mobile App" },
  { id: "website", label: "Website" },
  { id: "webportal", label: "Web Portal" },
  { id: "ai", label: "AI" },
  { id: "multiple", label: "Multiple" },
]

interface ProjectTypeSelectorProps {
  onSelect: (type: string, description: string) => void
}

export function ProjectTypeSelector({ onSelect }: ProjectTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [description, setDescription] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedType && description.trim()) {
      onSelect(selectedType, description)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
        <CardDescription>Select your project type and describe your idea</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select value={selectedType || ""} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Select project type" />
            </SelectTrigger>
            <SelectContent>
              {projectTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Describe your project idea..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
          <Button type="submit" className="w-full" disabled={!selectedType || !description.trim()}>
            Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
