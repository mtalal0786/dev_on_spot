"use client"

import { useState, useEffect } from "react"
import { TopNav } from "../../components/top-nav"
import { Sidebar } from "../../components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeProvider } from "../../components/theme-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Star, Download, Settings } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Plugin {
  _id: string;
  name: string;
  description: string;
  author: string;
  category: string;
  rating: number;
  downloads: string;
  status: 'installed' | 'available';
  version: string;
  updatedAt: string;
  createdAt: string;
  isFavorite: boolean;
}

function timeAgo(date: string): string {
  const units = [
    { name: 'year', seconds: 31536000 },
    { name: 'month', seconds: 2592000 },
    { name: 'day', seconds: 86400 },
    { name: 'hour', seconds: 3600 },
    { name: 'minute', seconds: 60 },
    { name: 'second', seconds: 1 }
  ];
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  for (let unit of units) {
    const interval = Math.floor(seconds / unit.seconds);
    if (interval >= 1) {
      return `${interval} ${unit.name}${interval > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPlugin, setEditingPlugin] = useState<Plugin | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    author: '',
    category: '',
    rating: 0,
    downloads: '0',
    status: 'available' as 'installed' | 'available',
    version: '1.0.0',
    isFavorite: false
  })

  useEffect(() => {
    fetchPlugins()
  }, [])

  useEffect(() => {
    if (editingPlugin) {
      setForm({
        name: editingPlugin.name,
        description: editingPlugin.description,
        author: editingPlugin.author,
        category: editingPlugin.category,
        rating: editingPlugin.rating,
        downloads: editingPlugin.downloads,
        status: editingPlugin.status,
        version: editingPlugin.version,
        isFavorite: editingPlugin.isFavorite
      })
    } else {
      setForm({
        name: '',
        description: '',
        author: '',
        category: '',
        rating: 0,
        downloads: '0',
        status: 'available',
        version: '1.0.0',
        isFavorite: false
      })
    }
  }, [editingPlugin, modalOpen])

  async function fetchPlugins() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/plugins`)
    if (res.ok) {
      const data = await res.json()
      setPlugins(data)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseFloat(value) || 0 : value
    }))
  }
  const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api'
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const url = editingPlugin ? `${API_BASE_URL}/plugins/${editingPlugin._id}` : `${API_BASE_URL}/plugins`
    const method = editingPlugin ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (res.ok) {
      setModalOpen(false)
      fetchPlugins()
    }
  }

  const handleDelete = async () => {
    if (!editingPlugin) return
    const res = await fetch(`${API_BASE_URL}/plugins/${editingPlugin._id}`, { method: 'DELETE' })
    if (res.ok) {
      setModalOpen(false)
      fetchPlugins()
    }
  }

  const handleInstall = async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/plugins/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'installed' })
    })
    if (res.ok) {
      fetchPlugins()
    }
  }

  const handleUninstall = async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/plugins/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
    if (res.ok) {
      fetchPlugins()
    }
  }

  const handleEdit = (plugin: Plugin) => {
    setEditingPlugin(plugin)
    setModalOpen(true)
  }

  const handleToggleFavorite = async (id: string, currentFavorite: boolean) => {
    const res = await fetch(`${API_BASE_URL}/plugins/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFavorite: !currentFavorite })
    })
    if (res.ok) {
      fetchPlugins()
    }
  }

  const filteredPlugins = plugins.filter((plugin) =>
    plugin.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar isCollapsed={false} />
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
                <Button onClick={() => { setEditingPlugin(null); setModalOpen(true) }}>
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
                  {filteredPlugins.map((plugin) => (
                    <Card key={plugin._id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center space-x-2">
                              <span>{plugin.name}</span>
                              <Badge variant="outline">{plugin.category}</Badge>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">by {plugin.author}</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleToggleFavorite(plugin._id, plugin.isFavorite)}>
                            <Star className="h-4 w-4" fill={plugin.isFavorite ? "yellow" : "none"} />
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
                          <Button 
                            variant={plugin.status === "installed" ? "outline" : "default"}
                            onClick={() => plugin.status === "installed" ? handleEdit(plugin) : handleInstall(plugin._id)}
                          >
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
                  {filteredPlugins
                    .filter((plugin) => plugin.status === "installed")
                    .map((plugin) => (
                      <Card key={plugin._id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <span>{plugin.name}</span>
                                <Badge variant="outline">{plugin.category}</Badge>
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">by {plugin.author}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(plugin)}>
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">{plugin.description}</p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <Badge variant="secondary">{plugin.version}</Badge>
                              <span>Last updated: {timeAgo(plugin.updatedAt)}</span>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => handleUninstall(plugin._id)}>
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPlugin ? 'Edit Plugin' : 'Add Plugin'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" value={form.name} onChange={handleChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Input id="description" name="description" value={form.description} onChange={handleChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="author" className="text-right">Author</Label>
                <Input id="author" name="author" value={form.author} onChange={handleChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Input id="category" name="category" value={form.category} onChange={handleChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rating" className="text-right">Rating</Label>
                <Input id="rating" name="rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={handleChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="downloads" className="text-right">Downloads</Label>
                <Input id="downloads" name="downloads" value={form.downloads} onChange={handleChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="version" className="text-right">Version</Label>
                <Input id="version" name="version" value={form.version} onChange={handleChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select value={form.status} onValueChange={(value: 'installed' | 'available') => setForm({ ...form, status: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="installed">Installed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isFavorite" className="text-right">Favorite</Label>
                <Select value={form.isFavorite ? 'true' : 'false'} onValueChange={(value) => setForm({ ...form, isFavorite: value === 'true' })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              {editingPlugin && (
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              )}
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  )
}