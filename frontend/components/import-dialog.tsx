"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  importType: "figma" | "image" | null
  onImport: (data: any) => void
}

export function ImportDialog({ open, onOpenChange, importType, onImport }: ImportDialogProps) {
  const [figmaUrl, setFigmaUrl] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleImport = () => {
    if (importType === "figma" && figmaUrl) {
      onImport({ type: "figma", url: figmaUrl })
    } else if (importType === "image" && selectedFile) {
      onImport({ type: "image", file: selectedFile })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Design</DialogTitle>
          <DialogDescription>Import your design from Figma or an image file.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue={importType || "figma"}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="figma">Figma</TabsTrigger>
            <TabsTrigger value="image">Image</TabsTrigger>
          </TabsList>
          <TabsContent value="figma">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="figma-url" className="text-right">
                  Figma URL
                </Label>
                <Input
                  id="figma-url"
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="image">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image-file" className="text-right">
                  Image File
                </Label>
                <Input
                  id="image-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="col-span-3"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button onClick={handleImport}>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
