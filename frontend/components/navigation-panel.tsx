"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trash2 } from "lucide-react"

interface Page {
  id: string
  name: string
}

export function NavigationPanel() {
  const [pages, setPages] = useState<Page[]>([
    { id: "1", name: "Home" },
    { id: "2", name: "About" },
    { id: "3", name: "Contact" },
  ])
  const [newPageName, setNewPageName] = useState("")

  const addPage = () => {
    if (newPageName) {
      setPages([...pages, { id: Date.now().toString(), name: newPageName }])
      setNewPageName("")
    }
  }

  const removePage = (id: string) => {
    setPages(pages.filter((page) => page.id !== id))
  }

  return (
    <div className="w-64 border-l bg-background">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Navigation</h2>
        <div className="flex space-x-2 mb-4">
          <Input placeholder="New page name" value={newPageName} onChange={(e) => setNewPageName(e.target.value)} />
          <Button size="sm" onClick={addPage}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <ul className="space-y-2">
            {pages.map((page) => (
              <li key={page.id} className="flex items-center justify-between">
                <span>{page.name}</span>
                <Button variant="ghost" size="sm" onClick={() => removePage(page.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>
    </div>
  )
}
