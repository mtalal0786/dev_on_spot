"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const techStacks: Record<string, string[]> = {
  desktop: ["Electron", "Qt", "JavaFX", ".NET"],
  mobile: ["React Native", "Flutter", "Ionic", "Native Android", "Native iOS"],
  website: ["React", "Vue", "Angular", "Svelte", "Next.js"],
  webportal: ["React", "Angular", "Vue", "ASP.NET Core", "Django"],
  ai: ["TensorFlow", "PyTorch", "scikit-learn", "Keras", "OpenAI API"],
  multiple: ["React", "Node.js", "Python", "TensorFlow", "Flutter"],
}

interface TechStackPopupProps {
  projectType: string
  isOpen: boolean
  onClose: () => void
  onSelect: (technologies: string[]) => void
}

export function TechStackPopup({ projectType, isOpen, onClose, onSelect }: TechStackPopupProps) {
  const [selectedTech, setSelectedTech] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSelect(selectedTech)
    onClose()
  }

  const toggleTech = (tech: string) => {
    setSelectedTech((prev) => (prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]))
  }

  const availableTechStack = techStacks[projectType] || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Technology Stack</DialogTitle>
          <DialogDescription>Choose the technologies you want to use for your {projectType} project</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            {availableTechStack.length > 0 ? (
              availableTechStack.map((tech) => (
                <div key={tech} className="flex items-center space-x-2">
                  <Checkbox id={tech} checked={selectedTech.includes(tech)} onCheckedChange={() => toggleTech(tech)} />
                  <Label htmlFor={tech}>{tech}</Label>
                </div>
              ))
            ) : (
              <p>No technologies available for this project type.</p>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={selectedTech.length === 0}>
              Continue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
