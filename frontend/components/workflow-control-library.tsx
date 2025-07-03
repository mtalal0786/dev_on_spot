"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { Node } from "reactflow"

interface WorkflowControlLibraryProps {
  selectedNode: Node | null
}

export function WorkflowControlLibrary({ selectedNode }: WorkflowControlLibraryProps) {
  if (!selectedNode) {
    return (
      <div className="w-64 border-l bg-background p-4">
        <p className="text-sm text-muted-foreground text-center">Select a node to configure its properties</p>
      </div>
    )
  }

  return (
    <div className="w-64 border-l bg-background flex flex-col">
      <Tabs defaultValue="general">
        <div className="border-b p-4">
          <TabsList className="w-full">
            <TabsTrigger value="general" className="flex-1">
              General
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-1">
              Security
            </TabsTrigger>
          </TabsList>
        </div>
        <ScrollArea className="flex-1">
          <TabsContent value="general" className="p-4 space-y-6">
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center space-x-2">
                <Switch id="status" />
                <Label htmlFor="status">Enable</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={selectedNode.data.label} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={selectedNode.data.description} />
            </div>
            <div className="space-y-2">
              <Label>Sequence</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="prefix" className="text-xs">
                    Prefix
                  </Label>
                  <Input id="prefix" placeholder="Enter prefix" />
                </div>
                <div>
                  <Label htmlFor="suffix" className="text-xs">
                    Suffix
                  </Label>
                  <Input id="suffix" placeholder="Enter suffix" />
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="security" className="p-4 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch id="encryption" />
                <Label htmlFor="encryption">Encryption</Label>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch id="sensitive" />
                <Label htmlFor="sensitive">Sensitive / Personal information</Label>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch id="confidential" />
                <Label htmlFor="confidential">Hidden / Confidential</Label>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
