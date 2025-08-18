"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe, GitBranch, Clock, Users, HardDrive, MoreHorizontal, Box } from "lucide-react"
import Link from "next/link"

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
  applications: string[]
}

interface ProjectGridProps {
  projects: Project[]
  viewMode: "grid" | "list"
  onDuplicate: (id: string) => void
  onEdit: (id: string) => void
  onTransfer: (id: string) => void
  onDelete: (id: string) => void
}

export function ProjectGrid({ projects, viewMode, onDuplicate, onEdit, onTransfer, onDelete }: ProjectGridProps) {
  if (!Array.isArray(projects)) {
    console.error("Projects is not an array:", projects)
    return <div>Error: Unable to display projects</div>
  }

  const renderProject = (project: Project) => (
    <Card key={project.id} className={`hover:shadow-lg transition-shadow ${viewMode === "list" ? "flex" : ""}`}>
      <div className={`${viewMode === "list" ? "w-1/3" : ""}`}>
        <img
          src={project.image || "/placeholder.svg"}
          alt={project.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      </div>
      <div className={`flex flex-col ${viewMode === "list" ? "w-2/3" : ""}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl mb-2">
                <Link href={`/projects/${project.id}`} className="hover:text-primary transition-colors">
                  {project.name}
                </Link>
              </CardTitle>
              <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant={
                  project.status === "production"
                    ? "default"
                    : project.status === "development"
                      ? "secondary"
                      : "outline"
                }
              >
                {project.status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onDuplicate(project.id)}>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/projects/${project.id}`}>View</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(project.id)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onTransfer(project.id)}>Transfer</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(project.id)}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            {project.url && (
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-2 text-primary" />
                <span>{project.url}</span>
              </div>
            )}
            {project.visitors !== undefined && (
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-primary" />
                <span>{project.visitors} visitors</span>
              </div>
            )}
            {project.spaceUsed && (
              <div className="flex items-center">
                <HardDrive className="w-4 h-4 mr-2 text-primary" />
                <span>{project.spaceUsed} used</span>
              </div>
            )}
            {project.applications && project.applications.length > 0 && (
              <div className="flex items-center">
                <Box className="w-4 h-4 mr-2 text-primary" />
                <span>Applications: {project.applications.join(", ")}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground mt-auto">
          <div className="flex items-center">
            <GitBranch className="w-4 h-4 mr-2 text-primary" />
            <span>main</span>
          </div>
          {project.lastDeployed && (
            <div className="flex items-center">
              <Clock className="w-4 w-4 mr-2 text-primary" />
              <span>{project.lastDeployed}</span>
            </div>
          )}
        </CardFooter>
      </div>
    </Card>
  )

  return (
    <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}>
      {projects.map((project) => {
        if (!project || typeof project !== "object") {
          console.error("Invalid project:", project)
          return null
        }
        return renderProject(project)
      })}
    </div>
  )
}
