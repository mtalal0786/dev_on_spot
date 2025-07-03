"use client"

import { useState } from "react"
import { Folder, ChevronRight, Code, Package, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

type Project = {
  id: string
  name: string
  description: string
  status: "in-progress" | "completed"
  files: string[]
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "E-commerce Platform",
    description: "A full-stack e-commerce solution with product management and user authentication.",
    status: "completed",
    files: ["app/page.tsx", "components/ProductList.tsx", "lib/db.ts"],
  },
  {
    id: "2",
    name: "Task Management App",
    description: "A React-based task management application with drag-and-drop functionality.",
    status: "in-progress",
    files: ["app/page.tsx", "components/TaskBoard.tsx", "hooks/useTasks.ts"],
  },
]

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
      {projects.map((project) => (
        <Collapsible key={project.id} className="mb-4">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <div className="flex items-center">
                <Folder className="mr-2 h-4 w-4" />
                {project.name}
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 py-2">
            <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
            <div className="flex items-center mb-2">
              <Code className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">Status: {project.status}</span>
            </div>
            <div className="mb-2">
              <h3 className="text-sm font-medium mb-1">Files:</h3>
              <ul className="text-sm text-muted-foreground">
                {project.files.map((file) => (
                  <li key={file} className="flex items-center">
                    <Package className="mr-2 h-3 w-3" /> {file}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <Code className="mr-2 h-4 w-4" /> View Code
              </Button>
              <Button size="sm" variant="outline">
                <GitBranch className="mr-2 h-4 w-4" /> Deploy
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  )
}
