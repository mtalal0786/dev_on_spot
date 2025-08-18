"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Plugin {
  id: string
  name: string
  description: string
  enabled: boolean
}

interface PluginManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addConsoleOutput: (message: string) => void
}

export function PluginManager({ open, onOpenChange, addConsoleOutput }: PluginManagerProps) {
  const [plugins, setPlugins] = useState<Plugin[]>([
    { id: "1", name: "AI Code Assistant", description: "Provides AI-powered code suggestions", enabled: true },
    { id: "2", name: "Performance Analyzer", description: "Analyzes and optimizes code performance", enabled: false },
    {
      id: "3",
      name: "Accessibility Checker",
      description: "Checks for accessibility issues in your design",
      enabled: true,
    },
  ])
  const [newPluginUrl, setNewPluginUrl] = useState("")

  const handleTogglePlugin = (id: string) => {
    setPlugins(plugins.map((plugin) => (plugin.id === id ? { ...plugin, enabled: !plugin.enabled } : plugin)))
    const plugin = plugins.find((p) => p.id === id)
    if (plugin) {
      addConsoleOutput(`Plugin "${plugin.name}" ${plugin.enabled ? "disabled" : "enabled"}`)
    }
  }

  const handleAddPlugin = () => {
    if (newPluginUrl.trim()) {
      // TODO: Implement actual plugin installation logic
      const newPlugin: Plugin = {
        id: Date.now().toString(),
        name: `Plugin ${plugins.length + 1}`,
        description: "New plugin description",
        enabled: true,
      }
      setPlugins([...plugins, newPlugin])
      setNewPluginUrl("")
      addConsoleOutput(`New plugin "${newPlugin.name}" added`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Plugin Manager</DialogTitle>
          <DialogDescription>Manage your installed plugins or add new ones.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h4 className="mb-4 text-sm font-medium">Installed Plugins</h4>
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            {plugins.map((plugin) => (
              <div key={plugin.id} className="flex items-center justify-between py-2">
                <div>
                  <h5 className="font-medium">{plugin.name}</h5>
                  <p className="text-sm text-gray-500">{plugin.description}</p>
                </div>
                <Switch checked={plugin.enabled} onCheckedChange={() => handleTogglePlugin(plugin.id)} />
              </div>
            ))}
          </ScrollArea>
        </div>
        <div className="grid gap-4 py-4">
          <Label htmlFor="plugin-url">Add new plugin</Label>
          <Input
            id="plugin-url"
            placeholder="Enter plugin URL"
            value={newPluginUrl}
            onChange={(e) => setNewPluginUrl(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleAddPlugin}>Add Plugin</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
