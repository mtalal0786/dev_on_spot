"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useDrag } from "react-dnd"

import {
  CircleIcon as Loop,
  GitBranch,
  Type,
  List,
  Variable,
  Database,
  ActivityIcon as Function,
  ArrowRight,
  Server,
  Globe,
  Clock,
  Zap,
  MessageSquare,
  FileJson,
  Lock,
  Cpu,
} from "lucide-react"

const backendElements = [
  { type: "loop", icon: Loop, label: "Loop" },
  { type: "condition", icon: GitBranch, label: "Condition" },
  { type: "variable", icon: Variable, label: "Variable" },
  { type: "array", icon: List, label: "Array" },
  { type: "list", icon: List, label: "List" },
  { type: "vector", icon: ArrowRight, label: "Vector" },
  { type: "function", icon: Function, label: "Function" },
  { type: "database", icon: Database, label: "Database" },
  { type: "statement", icon: Type, label: "Statement" },
  { type: "server", icon: Server, label: "Server" },
  { type: "api", icon: Globe, label: "Third-party API" },
  { type: "cronjob", icon: Clock, label: "Cron Job" },
  { type: "trigger", icon: Zap, label: "Trigger" },
  { type: "queue", icon: MessageSquare, label: "Message Queue" },
  { type: "cache", icon: FileJson, label: "Cache" },
  { type: "authentication", icon: Lock, label: "Authentication" },
  { type: "microservice", icon: Cpu, label: "Microservice" },
]

function DraggableElement({ type, icon: Icon, label }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "backend-element",
    item: { type, label },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1, cursor: "move" }}>
      <Button variant="outline" className="w-full justify-start">
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </div>
  )
}

export function BackendElementPanel() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredElements = backendElements.filter((element) =>
    element.label.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
