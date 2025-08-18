"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const techStacks = {
  website: ["React", "Vue", "Angular", "Next.js", "Svelte"],
  mobileApp: ["React Native", "Flutter", "Ionic", "Native Android", "Native iOS"],
  desktopApp: ["Electron", "Qt", "JavaFX", ".NET"],
  ai: ["TensorFlow", "PyTorch", "scikit-learn", "Keras"],
  backend: ["Node.js", "Django", "Flask", "Spring Boot", "ASP.NET Core"],
  consoleApplication: ["Python", "Java", "C++", "C#", "Rust"],
}

interface TechStackSelectorProps {
  projectType: string
  onSelect: (technologies: string[]) => void
}

export function TechStackSelector({ projectType, onSelect }: TechStackSelectorProps) {
  const [selectedTech, setSelectedTech] = useState<string[]>([])

  const handleTechChange = (tech: string) => {
    setSelectedTech((prev) => (prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSelect(selectedTech)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        {techStacks[projectType].map((tech) => (
          <div key={tech} className="flex items-center space-x-2">
            <Checkbox id={tech} checked={selectedTech.includes(tech)} onCheckedChange={() => handleTechChange(tech)} />
            <Label htmlFor={tech}>{tech}</Label>
          </div>
        ))}
      </div>
      <Button type="submit" className="w-full">
        Continue
      </Button>
    </form>
  )
}
