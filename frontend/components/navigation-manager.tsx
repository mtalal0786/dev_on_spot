"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"

interface NavigationManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addConsoleOutput: (message: string) => void
}

interface NavigationItem {
  id: string
  name: string
  path: string
}

export function NavigationManager({ open, onOpenChange, addConsoleOutput }: NavigationManagerProps) {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([
    { id: "1", name: "Home", path: "/" },
    { id: "2", name: "About", path: "/about" },
    { id: "3", name: "Contact", path: "/contact" },
  ])

  const [newItemName, setNewItemName] = useState("")
  const [newItemPath, setNewItemPath] = useState("")

  const addNavigationItem = () => {
    if (newItemName && newItemPath) {
      const newItem: NavigationItem = {
        id: Date.now().toString(),
        name: newItemName,
        path: newItemPath,
      }
      setNavigationItems([...navigationItems, newItem])
      setNewItemName("")
      setNewItemPath("")
      addConsoleOutput(`Added new navigation item: ${newItem.name} (${newItem.path})`)
    }
  }

  const removeNavigationItem = (id: string) => {
    setNavigationItems(navigationItems.filter((item) => item.id !== id))
    addConsoleOutput(`Removed navigation item with id: ${id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Navigation Manager</DialogTitle>
          <DialogDescription>Manage your application's navigation structure.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h4 className="mb-4 text-sm font-medium">Navigation Items</h4>
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            {navigationItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2">
                <div>
                  <h5 className="font-medium">{item.name}</h5>
                  <p className="text-sm text-gray-500">{item.path}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeNavigationItem(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </ScrollArea>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="path" className="text-right">
              Path
            </Label>
            <Input
              id="path"
              value={newItemPath}
              onChange={(e) => setNewItemPath(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={addNavigationItem}>Add Navigation Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
