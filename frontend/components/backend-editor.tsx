"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  type Connection,
  type Edge,
  type Node,
  useNodesState,
  useEdgesState,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { WorkflowSidebar } from "./workflow-sidebar"
import { WorkflowControlLibrary } from "./workflow-control-library"
import { Settings, Play, Save } from "lucide-react"
import { CustomNode } from "./workflow-nodes"

const nodeTypes = {
  custom: CustomNode,
}

const initialNodes: Node[] = [
  {
    id: "start",
    type: "custom",
    data: {
      label: "API Endpoint",
      type: "api",
      icon: "Globe",
      description: "Entry point for the API",
    },
    position: { x: 250, y: 5 },
  },
]

export function BackendEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: "#22c55e" } }, eds))
    },
    [setEdges],
  )

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData("application/reactflow")
      const name = event.dataTransfer.getData("nodeName")
      const icon = event.dataTransfer.getData("nodeIcon")

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      const position = reactFlowInstance?.project({
        x: event.clientX - (reactFlowBounds?.left ?? 0),
        y: event.clientY - (reactFlowBounds?.top ?? 0),
      })

      if (position && type) {
        const newNode = {
          id: `${type}-${nodes.length + 1}`,
          type: "custom",
          position,
          data: {
            label: name,
            type,
            icon,
            description: `${name} node`,
          },
        }

        setNodes((nds) => nds.concat(newNode))
      }
    },
    [nodes, reactFlowInstance, setNodes],
  )

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <h1 className="text-2xl font-bold">Backend Editor</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Deploy
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <WorkflowSidebar />
        <div className="flex-1 h-full" ref={reactFlowWrapper} onDrop={handleDrop} onDragOver={handleDragOver}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
        <WorkflowControlLibrary selectedNode={selectedNode} />
      </div>
    </div>
  )
}
