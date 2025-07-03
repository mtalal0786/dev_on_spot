"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  type Connection,
  type Edge,
} from "reactflow"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import "reactflow/dist/style.css"
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { BackendElementPanel } from "./backend-element-panel"
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

const nodeTypes = {
  loop: ({ data }) => (
    <div className="bg-white border-2 border-blue-500 rounded p-2">
      <Loop className="inline-block mr-2" />
      {data.label}
    </div>
  ),
  condition: ({ data }) => (
    <div className="bg-white border-2 border-green-500 rounded p-2">
      <GitBranch className="inline-block mr-2" />
      {data.label}
    </div>
  ),
  variable: ({ data }) => (
    <div className="bg-white border-2 border-purple-500 rounded p-2">
      <Variable className="inline-block mr-2" />
      {data.label}
    </div>
  ),
  array: ({ data }) => (
    <div className="bg-white border-2 border-yellow-500 rounded p-2">
      <List className="inline-block mr-2" />
      {data.label}
    </div>
  ),
  list: ({ data }) => (
    <div className="bg-white border-2 border-orange-500 rounded p-2">
      <List className="inline-block mr-2" />
      {data.label}
    </div>
  ),
  vector: ({ data }) => (
    <div className="bg-white border-2 border-pink-500 rounded p-2">
      <ArrowRight className="inline-block mr-2" />
      {data.label}
    </div>
  ),
  function: ({ data }) => (
    <div className="bg-white border-2 border-red-500 rounded p-2">
      <Function className="inline-block mr-2" />
      {data.label}
    </div>
  ),
  database: ({ data }) => (
    <div className="bg-white border-2 border-indigo-500 rounded p-2">
      <Database className="inline-block mr-2" />
      {data.label}
    </div>
  ),
  statement: ({ data }) => (
    <div className="bg-white border-2 border-gray-500 rounded p-2">
      <Type className="inline-block mr-2" />
      {data.label}
    </div>
  ),
  server: ({ data }) => (
    <div className="bg-white border-2 border-blue-300 rounded p-2">
      <Server className="inline-block mr-2" />
      {data.label}
    </div>
  ),
  api: ({ data }) => (
    <div className="bg-white border-2 border-green-300 rounded p-2">
      <Globe className="inline-block mr-2" />
      {data.label}
    </div>
  ),
  cronjob: ({ data }) => (
    <div className="bg-white border-2 border-yellow-300 rounded p-2">
      <Clock className="inline-block mr-2" />
      {data.label}
    </div>
  ),
  trigger: ({ data }) => (
    <div className="bg-white border-2 border-red-300 rounded p-2">
      <Zap className="inline-block mr-2" />
      {data.label}
    </div>
  ),
  queue: ({ data }) => (
    <div className="bg-white border-2 border-purple-300 rounded p-2">
      <MessageSquare className="inline-block mr-2" />
      {data.label}
    </div>
  ),
  cache: ({ data }) => (
    <div className="bg-white border-2 border-blue-200 rounded p-2">
      <FileJson className="inline-block mr-2" />
      {data.label}
    </div>
  ),
  authentication: ({ data }) => (
    <div className="bg-white border-2 border-green-200 rounded p-2">
      <Lock className="inline-block mr-2" />
      {data.label}
    </div>
  ),
  microservice: ({ data }) => (
    <div className="bg-white border-2 border-pink-200 rounded p-2">
      <Cpu className="inline-block mr-2" />
      {data.label}
    </div>
  ),
}

interface BackendDesignerProps {
  addConsoleOutput: (message: string) => void
}

let id = 0
const getId = () => `node_${id++}`

export function BackendDesigner({ addConsoleOutput }: BackendDesignerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => addEdge(params, eds))
      addConsoleOutput(`Connected nodes: ${params.source} -> ${params.target}`)
    },
    [setEdges, addConsoleOutput],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      if (!reactFlowWrapper.current || !reactFlowInstance) return

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const type = event.dataTransfer.getData("application/reactflow")

      // Check if the dropped element is our custom type
      if (type && type !== "undefined") {
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        })
        const newNode = {
          id: getId(),
          type,
          position,
          data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)}` },
        }

        setNodes((nds) => nds.concat(newNode))
        addConsoleOutput(`Added new ${type} node to workflow`)
      }
    },
    [reactFlowInstance, setNodes, addConsoleOutput],
  )

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={20} minSize={15}>
        <BackendElementPanel />
      </ResizablePanel>
      <ResizablePanel defaultSize={80}>
        <ReactFlowProvider>
          <DndProvider backend={HTML5Backend}>
            <div className="h-full" ref={reactFlowWrapper}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                fitView
              >
                <Controls />
                <Background color="#aaa" gap={16} />
              </ReactFlow>
            </div>
          </DndProvider>
        </ReactFlowProvider>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
