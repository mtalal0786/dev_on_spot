"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Folder, File, ChevronRight, ChevronDown, Plus } from "lucide-react"

interface FolderStructureProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addConsoleOutput: (message: string) => void
}

interface FileSystemItem {
  id: string
  name: string
  type: "file" | "folder"
  children?: FileSystemItem[]
}

export function FolderStructure({ open, onOpenChange, addConsoleOutput }: FolderStructureProps) {
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>([
    {
      id: "1",
      name: "src",
      type: "folder",
      children: [
        { id: "2", name: "components", type: "folder", children: [] },
        { id: "3", name: "pages", type: "folder", children: [] },
        { id: "4", name: "styles", type: "folder", children: [] },
        { id: "5", name: "App.tsx", type: "file" },
        { id: "6", name: "index.tsx", type: "file" },
      ],
    },
    { id: "7", name: "public", type: "folder", children: [] },
    { id: "8", name: "package.json", type: "file" },
    { id: "9", name: "tsconfig.json", type: "file" },
  ])

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["1"]))

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const renderFileSystemItem = (item: FileSystemItem, depth = 0) => {
    const isExpanded = expandedFolders.has(item.id)
    const Icon = item.type === "folder" ? Folder : File
    const ChevronIcon = isExpanded ? ChevronDown : ChevronRight

    return (
      <div key={item.id} style={{ marginLeft: `${depth * 20}px` }}>
        <div className="flex items-center py-1">
          {item.type === "folder" && (
            <Button variant="ghost" size="sm" className="p-0 h-6 w-6" onClick={() => toggleFolder(item.id)}>
              <ChevronIcon className="h-4 w-4" />
            </Button>
          )}
          <Icon className="h-4 w-4 mr-2" />
          <span>{item.name}</span>
        </div>
        {item.type === "folder" && isExpanded && item.children && (
          <div>{item.children.map((child) => renderFileSystemItem(child, depth + 1))}</div>
        )}
      </div>
    )
  }

  const addItem = (type: "file" | "folder") => {
    const newItem: FileSystemItem = {
      id: Date.now().toString(),
      name: type === "file" ? "New File" : "New Folder",
      type: type,
      children: type === "folder" ? [] : undefined,
    }
    setFileSystem([...fileSystem, newItem])
    addConsoleOutput(`Added new ${type}: ${newItem.name}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Folder Structure</DialogTitle>
          <DialogDescription>Manage your project's folder structure and files.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          {fileSystem.map((item) => renderFileSystemItem(item))}
        </ScrollArea>
        <DialogFooter>
          <div className="flex space-x-2">
            <Button onClick={() => addItem("file")}>
              <Plus className="h-4 w-4 mr-2" />
              Add File
            </Button>
            <Button onClick={() => addItem("folder")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Folder
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
