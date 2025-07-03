"use client"

import { useDrag } from "react-dnd"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import {
  Type,
  Square,
  FormInput,
  Table,
  BarChart,
  Layout,
  ImageIcon,
  Video,
  Link,
  List,
  CheckSquare,
  Radio,
  ToggleLeft,
  Calendar,
  FileSlidersIcon as Slider,
  Map,
  MessageCircle,
  Share2,
  Search,
  Menu,
  AlertTriangle,
  Loader,
  ArrowUpCircle,
  Brain,
  Database,
  PieChartIcon as ChartPie,
  Gauge,
} from "lucide-react"

const elements = [
  { type: "text", icon: Type, label: "Text" },
  { type: "button", icon: Square, label: "Button" },
  { type: "input", icon: FormInput, label: "Input" },
  { type: "textarea", icon: FormInput, label: "Textarea" },
  { type: "form", icon: Layout, label: "Form" },
  { type: "table", icon: Table, label: "Table" },
  { type: "chart", icon: BarChart, label: "Chart" },
  { type: "image", icon: ImageIcon, label: "Image" },
  { type: "video", icon: Video, label: "Video" },
  { type: "link", icon: Link, label: "Link" },
  { type: "list", icon: List, label: "List" },
  { type: "checkbox", icon: CheckSquare, label: "Checkbox" },
  { type: "radio", icon: Radio, label: "Radio" },
  { type: "toggle", icon: ToggleLeft, label: "Toggle" },
  { type: "datepicker", icon: Calendar, label: "Date Picker" },
  { type: "slider", icon: Slider, label: "Slider" },
  { type: "map", icon: Map, label: "Map" },
  { type: "comment", icon: MessageCircle, label: "Comment" },
  { type: "share", icon: Share2, label: "Share" },
  { type: "search", icon: Search, label: "Search" },
  { type: "navbar", icon: Menu, label: "Navbar" },
  { type: "alert", icon: AlertTriangle, label: "Alert" },
  { type: "progress", icon: Loader, label: "Progress" },
  { type: "tooltip", icon: ArrowUpCircle, label: "Tooltip" },
  { type: "ai-model", icon: Brain, label: "AI Model" },
  { type: "data-source", icon: Database, label: "Data Source" },
  { type: "chart-bar", icon: BarChart, label: "Bar Chart" },
  { type: "chart-line", icon: ChartPie, label: "Line Chart" },
  { type: "chart-pie", icon: ChartPie, label: "Pie Chart" },
  { type: "gauge", icon: Gauge, label: "Gauge" },
]

function DraggableElement({ type, icon: Icon, label }) {
  const [, drag] = useDrag(() => ({
    type: "element",
    item: { type },
  }))

  return (
    <div ref={drag}>
      <Button variant="outline" className="w-full justify-start">
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </div>
  )
}

export function ElementPanel() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredElements = elements.filter((element) => element.label.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="w-64 border-r bg-background">
      <div className="p-4">
        <Input
          type="text"
          placeholder="Search elements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-2">
            {filteredElements.map((element) => (
              <DraggableElement key={element.type} {...element} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
