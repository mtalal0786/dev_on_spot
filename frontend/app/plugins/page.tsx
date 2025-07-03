"use client"

import { useState } from "react"
import { TopNav } from "../../components/top-nav"
import { Sidebar } from "../../components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeProvider } from "../../components/theme-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Star, Download, Settings } from "lucide-react"

const plugins = [
  {
    name: "AI Code Assistant",
    description: "AI-powered code completion and suggestions",
    author: "OpenAI",
    category: "Development",
    rating: 4.8,
    downloads: "50K+",
    status: "installed",
  },
  {
    name: "Image Optimizer",
    description: "Automatically optimize and compress images",
    author: "ImageKit",
    category: "Media",
    rating: 4.6,
    downloads: "25K+",
    status: "available",
  },
  {
    name: "Database Backup",
    description: "Automated database backup and recovery",
    author: "DataOps",
    category: "Database",
    rating: 4.7,
    downloads: "30K+",
    status: "available",
  },
]

export default function PluginsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-foreground">Plugins</h1>
              <div className="flex items-center space-x-4">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search plugins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Plugin
                </Button>
              </div>
            </div>

            <Tabs defaultValue="marketplace" className="space-y-4">
              <TabsList>
                <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                <TabsTrigger value="installed">Installed</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
              </TabsList>

              <TabsContent value="marketplace">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plugins.map((plugin) => (
                    <Card key={plugin.name}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center space-x-2">
                              <span>{plugin.name}</span>
                              <Badge variant="outline">{plugin.category}</Badge>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">by {plugin.author}</p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Star className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{plugin.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1 text-yellow-400 fill-yellow-400" />
                              <span>{plugin.rating}</span>
                            </div>
                            <div className="flex items-center">
                              <Download className="h-4 w-4 mr-1" />
                              <span>{plugin.downloads}</span>
                            </div>
                          </div>
                          <Button variant={plugin.status === "installed" ? "outline" : "default"}>
                            {plugin.status === "installed" ? (
                              <>
                                <Settings className="mr-2 h-4 w-4" />
                                Configure
                              </>
                            ) : (
                              <>
                                <Download className="mr-2 h-4 w-4" />
                                Install
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="installed">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plugins
                    .filter((plugin) => plugin.status === "installed")
                    .map((plugin) => (
                      <Card key={plugin.name}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <span>{plugin.name}</span>
                                <Badge variant="outline">{plugin.category}</Badge>
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">by {plugin.author}</p>
                            </div>
                            <Button variant="ghost" size="icon">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">{plugin.description}</p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <Badge variant="secondary">v1.0.0</Badge>
                              <span>Last updated: 2 days ago</span>
                            </div>
                            <Button variant="destructive" size="sm">
                              Uninstall
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="updates">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center text-muted-foreground">
                      <p>All plugins are up to date</p>
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
