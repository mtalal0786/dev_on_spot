"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { TopNav } from "../../../components/top-nav"
import { Sidebar } from "../../../components/sidebar"
import { ThemeProvider } from "../../../components/theme-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Globe, GitBranch, Clock, Users, HardDrive, Download, Folder, Code, Settings, Play, Pause } from "lucide-react"
import { ProjectLogs } from "../../../components/project-logs"
import { DeploymentHistory } from "../../../components/deployment-history"
import { DatabaseManagement } from "../../../components/database-management"
import { ExportCodeDialog } from "../../../components/export-code-dialog"

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
  applications: Application[]
}

interface Application {
  id: string
  name: string
  status: "running" | "stopped"
  language: string
  framework: string
}

const mockProject: Project = {
  id: "1",
  name: "E-commerce Platform",
  description: "A full-stack e-commerce solution with product management and user authentication.",
  status: "production",
  lastDeployed: "2 hours ago",
  url: "https://ecommerce.example.com",
  image: "/placeholder.svg?height=100&width=100",
  visitors: 1500,
  spaceUsed: "2.5 GB",
  applications: [
    { id: "1", name: "Frontend", status: "running", language: "JavaScript", framework: "React" },
    { id: "2", name: "Backend API", status: "running", language: "Node.js", framework: "Express" },
    { id: "3", name: "Admin Dashboard", status: "stopped", language: "TypeScript", framework: "Next.js" },
  ],
}

export default function ProjectDetailsPage() {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    // In a real application, you would fetch the project data from an API
    setProject(mockProject)
  }, [params.id])

  if (!project) {
    return <div>Loading...</div>
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar isCollapsed={false} />
          <main className="flex-1 p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
              <div className="flex space-x-2">
                <ExportCodeDialog projectId={project.id} />
                <Button>Deploy</Button>
              </div>
            </div>

            <Tabs defaultValue="overview">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="files">File Manager</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
                <TabsTrigger value="deployments">Deployments</TabsTrigger>
                <TabsTrigger value="database">Database</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Globe className="mr-2" />
                        Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-semibold">{project.status}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="mr-2" />
                        Visitors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-semibold">{project.visitors}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <HardDrive className="mr-2" />
                        Space Used
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-semibold">{project.spaceUsed}</p>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{project.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Globe className="mr-2" />
                        <span>{project.url}</span>
                      </div>
                      <div className="flex items-center">
                        <GitBranch className="mr-2" />
                        <span>main</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-2" />
                        <span>Last deployed: {project.lastDeployed}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="applications">
                <Card>
                  <CardHeader>
                    <CardTitle>Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Language</TableHead>
                          <TableHead>Framework</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {project.applications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell>{app.name}</TableCell>
                            <TableCell>{app.status}</TableCell>
                            <TableCell>{app.language}</TableCell>
                            <TableCell>{app.framework}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" className="mr-2">
                                {app.status === "running" ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                              <Button variant="outline" size="sm">
                                Manage
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="files">
                <Card>
                  <CardHeader>
                    <CardTitle>File Manager</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between mb-4">
                      <Input type="text" placeholder="Search files..." className="w-64" />
                      <div>
                        <Button variant="outline" className="mr-2">
                          <Folder className="mr-2 h-4 w-4" />
                          New Folder
                        </Button>
                        <Button variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Upload
                        </Button>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Last Modified</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <Folder className="inline mr-2" />
                            src
                          </TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>2023-05-15 14:30</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              Open
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Code className="inline mr-2" />
                            index.js
                          </TableCell>
                          <TableCell>15 KB</TableCell>
                          <TableCell>2023-05-14 09:15</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logs">
                <ProjectLogs projectId={project.id} />
              </TabsContent>

              <TabsContent value="deployments">
                <DeploymentHistory
                  deployments={[
                    { id: "1", version: "v1.0.0", date: "2023-05-15", status: "success" },
                    { id: "2", version: "v1.0.1", date: "2023-05-16", status: "failed" },
                    { id: "3", version: "v1.0.2", date: "2023-05-17", status: "success" },
                  ]}
                />
              </TabsContent>

              <TabsContent value="database">
                <DatabaseManagement projectId={project.id} />
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="project-name" className="block text-sm font-medium mb-1">
                          Project Name
                        </label>
                        <Input id="project-name" defaultValue={project.name} />
                      </div>
                      <div>
                        <label htmlFor="project-description" className="block text-sm font-medium mb-1">
                          Description
                        </label>
                        <Input id="project-description" defaultValue={project.description} />
                      </div>
                      <div>
                        <label htmlFor="project-url" className="block text-sm font-medium mb-1">
                          Project URL
                        </label>
                        <Input id="project-url" defaultValue={project.url} />
                      </div>
                      <Button>
                        <Settings className="mr-2 h-4 w-4" />
                        Save Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
