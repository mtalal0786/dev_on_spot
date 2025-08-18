"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PropertiesPanelProps {
  selectedElement: {
    id: string
    type: string
    content: string
    position: { x: number; y: number }
    properties: Record<string, any>
  } | null
}

export function PropertiesPanel({ selectedElement }: PropertiesPanelProps) {
  if (!selectedElement) {
    return (
      <div className="w-64 border-l bg-background p-4">
        <h2 className="text-lg font-semibold mb-4">Properties</h2>
        <p className="text-sm text-muted-foreground">Select an element to edit its properties</p>
      </div>
    )
  }

  const renderProperties = () => {
    switch (selectedElement.type) {
      case "button":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="button-text">Button Text</Label>
              <Input id="button-text" value={selectedElement.properties.text} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="button-onclick">onClick Handler</Label>
              <Textarea id="button-onclick" value={selectedElement.properties.onClick} />
            </div>
          </>
        )
      case "input":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="input-placeholder">Placeholder</Label>
              <Input id="input-placeholder" value={selectedElement.properties.placeholder} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="input-value">Value</Label>
              <Input id="input-value" value={selectedElement.properties.value} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="input-onchange">onChange Handler</Label>
              <Textarea id="input-onchange" value={selectedElement.properties.onChange} />
            </div>
          </>
        )
      case "form":
        return (
          <div className="space-y-2">
            <Label htmlFor="form-onsubmit">onSubmit Handler</Label>
            <Textarea id="form-onsubmit" value={selectedElement.properties.onSubmit} />
          </div>
        )
      case "table":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="table-headers">Headers</Label>
              <Input id="table-headers" value={selectedElement.properties.headers.join(", ")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="table-rows">Rows</Label>
              <Textarea
                id="table-rows"
                value={selectedElement.properties.rows.map((row) => row.join(", ")).join("\n")}
              />
            </div>
          </>
        )
      case "chart":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="chart-type">Chart Type</Label>
              <Select value={selectedElement.properties.type}>
                <SelectTrigger id="chart-type">
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="pie">Pie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chart-data">Chart Data</Label>
              <Textarea id="chart-data" value={JSON.stringify(selectedElement.properties.data, null, 2)} />
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-64 border-l bg-background">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          <h2 className="text-lg font-semibold mb-4">Properties</h2>
          <div className="space-y-2">
            <Label htmlFor="element-type">Type</Label>
            <Input id="element-type" value={selectedElement.type} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="element-content">Content</Label>
            <Input id="element-content" value={selectedElement.content} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="element-x">X Position</Label>
            <Input id="element-x" type="number" value={selectedElement.position.x} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="element-y">Y Position</Label>
            <Input id="element-y" type="number" value={selectedElement.position.y} />
          </div>
          {renderProperties()}
        </div>
      </ScrollArea>
    </div>
  )
}
