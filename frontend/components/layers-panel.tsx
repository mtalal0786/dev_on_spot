"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Eye, EyeOff, Lock, Unlock, ChevronRight, ChevronDown } from "lucide-react"

interface Layer {
  id: string
  name: string
  type: string
  visible: boolean
  locked: boolean
  children?: Layer[]
}

interface LayersPanelProps {
  onSelectElement: (element: any) => void
}

export function LayersPanel({ onSelectElement }: LayersPanelProps) {
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: "1",
      name: "Page 1",
      type: "page",
      visible: true,
      locked: false,
      children: [
        {
          id: "2",
          name: "Header",
          type: "group",
          visible: true,
          locked: false,
          children: [
            { id: "3", name: "Logo", type: "image", visible: true, locked: false },
            { id: "4", name: "Navigation", type: "group", visible: true, locked: false },
          ],
        },
        {
          id: "5",
          name: "Main Content",
          type: "group",
          visible: true,
          locked: false,
          children: [
            { id: "6", name: "Hero Section", type: "group", visible: true, locked: false },
            { id: "7", name: "Features", type: "group", visible: true, locked: false },
          ],
        },
        { id: "8", name: "Footer", type: "group", visible: true, locked: false },
      ],
    },
  ])

  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set(["1"]))

  const toggleLayerVisibility = (id: string) => {
    setLayers((prevLayers) => updateLayer(prevLayers, id, (layer) => ({ ...layer, visible: !layer.visible })))
  }

  const toggleLayerLock = (id: string) => {
    setLayers((prevLayers) => updateLayer(prevLayers, id, (layer) => ({ ...layer, locked: !layer.locked })))
  }

  const toggleLayerExpand = (id: string) => {
    setExpandedLayers((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const updateLayer = (layers: Layer[], id: string, updateFn: (layer: Layer) => Layer): Layer[] => {
    return layers.map((layer) => {
      if (layer.id === id) {
        return updateFn(layer)
      }
      if (layer.children) {
        return { ...layer, children: updateLayer(layer.children, id, updateFn) }
      }
      return layer
    })
  }

  const renderLayer = (layer: Layer, depth = 0) => {
    const isExpanded = expandedLayers.has(layer.id)
    const hasChildren = layer.children && layer.children.length > 0

    return (
      <div key={layer.id}>
        <div
          className="flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer"
          style={{ paddingLeft: `${depth * 20}px` }}
          onClick={() => onSelectElement(layer)}
        >
          {hasChildren && (
            <Button variant="ghost" size="sm" className="p-0 h-6 w-6" onClick={() => toggleLayerExpand(layer.id)}>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          )}
          <span className="flex-grow">{layer.name}</span>
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              toggleLayerVisibility(layer.id)
            }}
          >
            {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              toggleLayerLock(layer.id)
            }}
          >
            {layer.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          </Button>
        </div>
        {hasChildren && isExpanded && (
          <div>{layer.children!.map((childLayer) => renderLayer(childLayer, depth + 1))}</div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-2">Layers</h2>
        <Input placeholder="Search layers..." />
      </div>
      <ScrollArea className="flex-grow">
        <div className="p-4">{layers.map((layer) => renderLayer(layer))}</div>
      </ScrollArea>
    </div>
  )
}
