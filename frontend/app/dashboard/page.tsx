"use client"

import { useState, useCallback } from "react"
import { NewProjectDialog } from "../../components/new-project-dialog"
import { TopNav } from "../../components/top-nav"
import { Sidebar } from "../../components/sidebar"
import { ThemeProvider } from "../../components/theme-provider"
import { Button } from "@/components/ui/button"
import { ProjectGrid } from "../../components/project-grid"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Grid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { DeploymentManager } from "../../components/deployment-manager"

interface Project {
  id: string
  name: string
  description: string
  status: "production" | "development" | "archived"
  lastDeployed: string
  url: string
  image: string
  visitors: number
  spaceUsed: string
}

const sampleProjects: Project[] = [
  {
    id: "1",
    name: "E-commerce Platform",
    description: "A full-stack e-commerce solution with product management and user authentication.",
    status: "production",
    lastDeployed: "2 hours ago",
    url: "https://ecommerce.example.com",
    image: "/placeholder.svg?height=100&width=100",
    visitors: 1500,
    spaceUsed: "2.5 GB",
  },
  {
    id: "2",
    name: "Task Management App",
    description: "A React-based task management application with drag-and-drop functionality.",
    status: "development",
    lastDeployed: "1 day ago",
    url: "https://tasks-dev.example.com",
    image: "/placeholder.svg?height=100&width=100",
    visitors: 500,
    spaceUsed: "1.2 GB",
  },
  {
    id: "3",
    name: "Portfolio Website",
    description: "A personal portfolio website showcasing projects and skills.",
    status: "archived",
    lastDeployed: "1 month ago",
    url: "https://portfolio.example.com",
    image: "/placeholder.svg?height=100&width=100",
    visitors: 200,
    spaceUsed: "500 MB",
  },
]

export default function Home() {
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [projects, setProjects] = useState(sampleProjects)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const handleProjectCreate = useCallback((project: Project) => {
    setProjects((prev) => [project, ...prev])
  }, [])

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.url.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDuplicate = useCallback(
    (id: string) => {
      const projectToDuplicate = projects.find((p) => p.id === id)
      if (projectToDuplicate) {
        const newProject = {
          ...projectToDuplicate,
          id: Date.now().toString(),
          name: `${projectToDuplicate.name} (Copy)`,
        }
        setProjects((prev) => [newProject, ...prev])
        toast({ title: "Project duplicated", description: `${newProject.name} has been created.` })
      }
    },
    [projects, toast],
  )

  const handleEdit = useCallback(
    (id: string) => {
      toast({ title: "Edit project", description: `Editing project with ID: ${id}` })
    },
    [toast],
  )

  const handleTransfer = useCallback(
    (id: string) => {
      toast({ title: "Transfer project", description: `Transferring project with ID: ${id}` })
    },
    [toast],
  )

  const handleDelete = useCallback(
    (id: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== id))
      toast({ title: "Project deleted", description: "The project has been removed." })
    },
    [toast],
  )

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div className="flex">
          <Sidebar isCollapsed={false} />
          <main className="flex-1 p-8">
            <div className="mb-8 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-foreground">Your Projects</h1>
              <div className="flex items-center space-x-4">
                <ToggleGroup
                  type="single"
                  value={viewMode}
                  onValueChange={(value) => setViewMode(value as "grid" | "list")}
                >
                  <ToggleGroupItem value="grid" aria-label="Grid view">
                    <Grid className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="list" aria-label="List view">
                    <List className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
                <Button
                  onClick={() => setShowNewProjectDialog(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Create New Project
                </Button>
              </div>
            </div>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <ProjectGrid
              projects={filteredProjects}
              viewMode={viewMode}
              onDuplicate={handleDuplicate}
              onEdit={handleEdit}
              onTransfer={handleTransfer}
              onDelete={handleDelete}
            />
            <div className="mt-8">
              <DeploymentManager />
            </div>
            <NewProjectDialog
              open={showNewProjectDialog}
              onOpenChange={setShowNewProjectDialog}
              onProjectCreate={handleProjectCreate}
            />
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
