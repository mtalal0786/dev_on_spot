"use client"

import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Laptop, Smartphone, Tablet, Monitor, MessageSquare, Database } from "lucide-react"

interface ToolbarProps {
  viewportSize: string
  setViewportSize: (size: string) => void
  showPromptTool: boolean
  setShowPromptTool: (show: boolean) => void
  showBackendDesigner: boolean
  setShowBackendDesigner: (show: boolean) => void
}

export function Toolbar({
  viewportSize,
  setViewportSize,
  showPromptTool,
  setShowPromptTool,
  showBackendDesigner,
  setShowBackendDesigner,
}: ToolbarProps) {
  return (
    <div className="border-b p-2 flex justify-between items-center">
      <ToggleGroup type="single" value={viewportSize} onValueChange={(value) => value && setViewportSize(value)}>
        <ToggleGroupItem value="desktop" aria-label="Desktop view">
          <Monitor className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="laptop" aria-label="Laptop view">
          <Laptop className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="tablet" aria-label="Tablet view">
          <Tablet className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="mobile" aria-label="Mobile view">
          <Smartphone className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
      <div className="flex space-x-2">
        <Button
          variant={showPromptTool ? "default" : "outline"}
          size="sm"
          onClick={() => setShowPromptTool(!showPromptTool)}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          AI Prompt
        </Button>
        <Button
          variant={showBackendDesigner ? "default" : "outline"}
          size="sm"
          onClick={() => setShowBackendDesigner(!showBackendDesigner)}
        >
          <Database className="h-4 w-4 mr-2" />
          Backend
        </Button>
      </div>
    </div>
  )
}
