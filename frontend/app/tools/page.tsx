"use client"

import { TopNav } from "../../components/top-nav"
import { Sidebar } from "../../components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeProvider } from "../../components/theme-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Image,
  PenTool,
  Layout,
  Square,
  Video,
  Music,
  Webcam,
  FileText,
  Code,
  Network,
  Database,
  GitGraphIcon as Git,
  CheckSquare,
  Clock,
  FileOutput,
} from "lucide-react"

const tools = [
  {
    category: "Design",
    items: [
      { name: "Image Editor", icon: Image, description: "Edit and manipulate images" },
      { name: "Vector Editor", icon: PenTool, description: "Create and edit vector graphics" },
      { name: "UI Designer", icon: Layout, description: "Design user interfaces" },
      { name: "Icon Creator", icon: Square, description: "Create custom icons" },
    ],
  },
  {
    category: "Video & Audio",
    items: [
      { name: "Video Editor", icon: Video, description: "Edit and compose videos" },
      { name: "Audio Editor", icon: Music, description: "Edit and mix audio files" },
      { name: "Screen Recorder", icon: Webcam, description: "Record your screen" },
      { name: "Subtitle Generator", icon: FileText, description: "Generate and edit subtitles" },
    ],
  },
  {
    category: "Development",
    items: [
      { name: "Code Editor", icon: Code, description: "Write and edit code" },
      { name: "API Tester", icon: Network, description: "Test API endpoints" },
      { name: "Database Manager", icon: Database, description: "Manage databases" },
      { name: "Git Client", icon: Git, description: "Manage git repositories" },
    ],
  },
  {
    category: "Productivity",
    items: [
      { name: "Note Taking", icon: FileText, description: "Take and organize notes" },
      { name: "Task Manager", icon: CheckSquare, description: "Manage tasks and projects" },
      { name: "Time Tracker", icon: Clock, description: "Track time and productivity" },
      { name: "File Converter", icon: FileOutput, description: "Convert between file formats" },
    ],
  },
]

export default function ToolsPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-foreground">Tools</h1>
              <div className="flex items-center space-x-4">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search tools..." className="pl-8" />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {tools.map((category) => (
                <div key={category.category}>
                  <h2 className="text-xl font-semibold mb-4">{category.category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {category.items.map((tool) => (
                      <Card key={tool.name} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <tool.icon className="h-5 w-5 text-primary" />
                            </div>
                            <span>{tool.name}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                          <Button className="w-full">Open Tool</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
