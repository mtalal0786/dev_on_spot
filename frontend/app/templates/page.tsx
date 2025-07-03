"use client"

import { TopNav } from "../../components/top-nav"
import { Sidebar } from "../../components/sidebar"
import { ThemeProvider } from "../../components/theme-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Sparkles } from "lucide-react"
import Link from "next/link"

const categories = [
  { id: "for-you", name: "For you", active: true },
  { id: "all", name: "All templates" },
  { id: "recent", name: "Recent" },
  { id: "custom", name: "Custom templates" },
]

const useCategories = [
  { id: "meetings", name: "Meetings & Workshops" },
  { id: "ideation", name: "Ideation & Brainstorming" },
  { id: "research", name: "Research & Design" },
  { id: "agile", name: "Agile Workflows" },
  { id: "strategy", name: "Strategy & Planning" },
  { id: "diagramming", name: "Diagramming & Mapping" },
  { id: "presentations", name: "Presentations & Slides" },
]

const templates = [
  {
    id: 1,
    title: "Start, Stop, Continue",
    provider: "DevOnSpot",
    category: "Agile",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-21%20at%209.36.31%E2%80%AFPM-gcbksoTgkwgWR0St2MpPCIz4Qt4EDK.png",
    isIntelligent: true,
  },
  {
    id: 2,
    title: "Roadmap Planning",
    provider: "DevOnSpot",
    category: "Strategy",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-21%20at%209.36.31%E2%80%AFPM-gcbksoTgkwgWR0St2MpPCIz4Qt4EDK.png",
    isIntelligent: true,
  },
  {
    id: 3,
    title: "Research Insight Synthesis",
    provider: "DevOnSpot",
    category: "Research",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-21%20at%209.36.31%E2%80%AFPM-gcbksoTgkwgWR0St2MpPCIz4Qt4EDK.png",
    isIntelligent: true,
  },
]

export default function TemplatesPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar />
          <div className="w-64 border-r h-[calc(100vh-4rem)] p-4 space-y-6">
            {categories.map((category) => (
              <div key={category.id}>
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    category.active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  {category.name}
                </button>
              </div>
            ))}

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2 px-3">BY USE CASE</h3>
              {useCategories.map((category) => (
                <button
                  key={category.id}
                  className="w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-muted"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search templates by name, category or company" className="pl-10" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="show-board" />
                  <Label htmlFor="show-board">Show when creating a board</Label>
                </div>
              </div>

              <Card className="bg-blue-50 border-blue-100">
                <CardContent className="p-8">
                  <div className="flex justify-between items-center">
                    <div className="space-y-4">
                      <h2 className="text-2xl font-semibold flex items-center gap-2">
                        Z, intelligent templates are here to explore
                        <Sparkles className="text-yellow-400" />
                      </h2>
                      <p className="text-muted-foreground">
                        Achieve more with AI-powered workflows, integrations and intelligent widgets.
                      </p>
                      <Button className="bg-blue-600 text-white hover:bg-blue-700">Explore templates</Button>
                    </div>
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-21%20at%209.36.31%E2%80%AFPM-gcbksoTgkwgWR0St2MpPCIz4Qt4EDK.png"
                      alt="Template preview"
                      className="w-64 rounded-lg shadow-lg"
                    />
                  </div>
                </CardContent>
              </Card>

              <div>
                <h3 className="text-xl font-semibold mb-4">For you</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <Link key={template.id} href={`/templates/${template.id}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-0">
                          <div className="relative">
                            {template.isIntelligent && (
                              <Badge className="absolute top-2 left-2 bg-blue-600 text-white hover:bg-blue-600">
                                Intelligent
                              </Badge>
                            )}
                            <img
                              src={template.image || "/placeholder.svg"}
                              alt={template.title}
                              className="w-full aspect-video object-cover rounded-t-lg"
                            />
                          </div>
                          <div className="p-4">
                            <h4 className="font-medium">{template.title}</h4>
                            <p className="text-sm text-muted-foreground">{template.provider}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
