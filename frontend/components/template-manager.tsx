"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Template {
  id: string
  name: string
  description: string
  thumbnail: string
}

interface TemplateManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addConsoleOutput: (message: string) => void
}

export function TemplateManager({ open, onOpenChange, addConsoleOutput }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "1",
      name: "E-commerce Site",
      description: "A template for online stores",
      thumbnail: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "2",
      name: "Portfolio",
      description: "A template for showcasing your work",
      thumbnail: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "3",
      name: "Blog",
      description: "A template for content creators",
      thumbnail: "/placeholder.svg?height=100&width=100",
    },
  ])
  const [newTemplateName, setNewTemplateName] = useState("")

  const handleUseTemplate = (template: Template) => {
    // TODO: Implement logic to apply the selected template
    addConsoleOutput(`Applied template: ${template.name}`)
    onOpenChange(false)
  }

  const handleSaveAsTemplate = () => {
    if (newTemplateName.trim()) {
      const newTemplate: Template = {
        id: Date.now().toString(),
        name: newTemplateName,
        description: "Custom template",
        thumbnail: "/placeholder.svg?height=100&width=100",
      }
      setTemplates([...templates, newTemplate])
      setNewTemplateName("")
      addConsoleOutput(`New template "${newTemplate.name}" saved`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Template Manager</DialogTitle>
          <DialogDescription>
            Choose a template to start your project or save your current design as a new template.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="grid grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <img src={template.thumbnail || "/placeholder.svg"} alt={template.name} className="w-full h-auto" />
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleUseTemplate(template)}>Use Template</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
        <div className="grid gap-4 py-4">
          <Label htmlFor="new-template">Save current design as template</Label>
          <Input
            id="new-template"
            placeholder="Enter template name"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSaveAsTemplate}>Save as Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
