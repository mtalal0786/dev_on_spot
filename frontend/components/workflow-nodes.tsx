"use client"

import { Handle, Position } from "reactflow"
import { cn } from "@/lib/utils"
import * as Icons from "lucide-react"

const nodeColors = {
  trigger: "border-green-500 bg-green-50 text-green-700",
  action: "border-blue-500 bg-blue-50 text-blue-700",
  condition: "border-yellow-500 bg-yellow-50 text-yellow-700",
  transform: "border-purple-500 bg-purple-50 text-purple-700",
  email: "border-pink-500 bg-pink-50 text-pink-700",
  webhook: "border-indigo-500 bg-indigo-50 text-indigo-700",
  api: "border-cyan-500 bg-cyan-50 text-cyan-700",
  "ai-trigger": "border-red-500 bg-red-50 text-red-700",
  "text-generation": "border-orange-500 bg-orange-50 text-orange-700",
  "image-recognition": "border-teal-500 bg-teal-50 text-teal-700",
  "sentiment-analysis": "border-lime-500 bg-lime-50 text-lime-700",
  prediction: "border-amber-500 bg-amber-50 text-amber-700",
  clustering: "border-emerald-500 bg-emerald-50 text-emerald-700",
  task: "border-sky-500 bg-sky-50 text-sky-700",
  script: "border-rose-500 bg-rose-50 text-rose-700",
  integration: "border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700",
  workflow: "border-violet-500 bg-violet-50 text-violet-700",
  "unit-test": "border-blue-300 bg-blue-50 text-blue-700",
  "integration-test": "border-green-300 bg-green-50 text-green-700",
  "e2e-test": "border-yellow-300 bg-yellow-50 text-yellow-700",
  "load-test": "border-red-300 bg-red-50 text-red-700",
  build: "border-purple-300 bg-purple-50 text-purple-700",
  deploy: "border-indigo-300 bg-indigo-50 text-indigo-700",
  rollback: "border-pink-300 bg-pink-50 text-pink-700",
  approval: "border-teal-300 bg-teal-50 text-teal-700",
  "git-clone": "border-gray-300 bg-gray-50 text-gray-700",
  "git-push": "border-blue-200 bg-blue-50 text-blue-700",
  "git-pull": "border-green-200 bg-green-50 text-green-700",
  "create-pr": "border-purple-200 bg-purple-50 text-purple-700",
  github: "border-gray-400 bg-gray-50 text-gray-700",
  jira: "border-blue-400 bg-blue-50 text-blue-700",
  slack: "border-green-400 bg-green-50 text-green-700",
  aws: "border-yellow-400 bg-yellow-50 text-yellow-700",
}

interface CustomNodeProps {
  data: {
    label: string
    type: keyof typeof nodeColors
    icon: keyof typeof Icons
    description: string
  }
  selected: boolean
}

export function CustomNode({ data, selected }: CustomNodeProps) {
  const Icon = Icons[data.icon as keyof typeof Icons] || Icons.Box

  return (
    <div
      className={cn(
        "px-4 py-2 rounded-lg border-2 shadow-sm min-w-[150px]",
        nodeColors[data.type],
        selected && "ring-2 ring-offset-2 ring-black",
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-green-500" />
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <div className="flex flex-col">
          <p className="font-medium text-sm">{data.label}</p>
          <p className="text-xs opacity-80">{data.description}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-green-500" />
    </div>
  )
}
