"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  type Connection,
  type Edge,
  type Node,
  useNodesState,
  useEdgesState,
  MiniMap,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WorkflowSidebar } from "./workflow-sidebar"
import { WorkflowControlLibrary } from "./workflow-control-library"
import {
  Settings,
  Play,
  Save,
  Star,
  History,
  GitBranch,
  Rocket,
  Link,
  Undo,
  Redo,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CustomNode } from "./workflow-nodes"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RepositoryManager } from "./repository-manager"
import { CICDPipeline } from "./cicd-pipeline"
import { IntegrationManager } from "./integration-manager"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, FileText, HelpCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { BrowseWorkflows } from "./browse-workflows"
import { WorkflowTemplates } from "./workflow-templates"
import { WorkflowHistory } from "./workflow-history"
import { WorkflowTabs } from "./workflow-tabs"

const nodeTypes = {
  custom: CustomNode,
}

const initialNodes: Node[] = [
  {
    id: "start",
    type: "custom",
    data: {
      label: "Start",
      type: "trigger",
      icon: "Play",
      description: "Workflow start point",
    },
    position: { x: 250, y: 5 },
  },
]

interface Workflow {
  id: string
  name: string
  nodes: Node[]
  edges: Edge[]
  history: { nodes: Node[]; edges: Edge[] }[]
  historyIndex: number
}

export function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: "1",
      name: "Untitled Workflow",
      nodes: initialNodes,
      edges: [],
      history: [],
      historyIndex: -1,
    },
  ])
  const [activeWorkflowId, setActiveWorkflowId] = useState("1")

  const activeWorkflow = workflows.find((w) => w.id === activeWorkflowId)!
  const [nodes, setNodes, onNodesChange] = useNodesState(activeWorkflow.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(activeWorkflow.edges)

  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const [showRepositoryManager, setShowRepositoryManager] = useState(false)
  const [showCICDPipeline, setShowCICDPipeline] = useState(false)
  const [showIntegrationManager, setShowIntegrationManager] = useState(false)
  const [showDocumentation, setShowDocumentation] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [showBrowseWorkflows, setShowBrowseWorkflows] = useState(false)
  const [showWorkflowTemplates, setShowWorkflowTemplates] = useState(false)
  const [showWorkflowHistory, setShowWorkflowHistory] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)

  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      const updatedWorkflows = workflows.map((workflow) => {
        if (workflow.id === activeWorkflowId) {
          const newHistory = [...workflow.history.slice(0, workflow.historyIndex + 1), { nodes, edges }]
          return {
            ...workflow,
            nodes,
            edges,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          }
        }
        return workflow
      })
      setWorkflows(updatedWorkflows)
    }
  }, [nodes, edges])

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

  const handleUndo = () => {
    const currentWorkflow = workflows.find((w) => w.id === activeWorkflowId)!
    if (currentWorkflow.historyIndex > 0) {
      const newHistoryIndex = currentWorkflow.historyIndex - 1
      const prevState = currentWorkflow.history[newHistoryIndex]
      setNodes(prevState.nodes)
      setEdges(prevState.edges)
      setWorkflows(
        workflows.map((w) =>
          w.id === activeWorkflowId
            ? { ...w, nodes: prevState.nodes, edges: prevState.edges, historyIndex: newHistoryIndex }
            : w,
        ),
      )
    }
  }

  const handleRedo = () => {
    const currentWorkflow = workflows.find((w) => w.id === activeWorkflowId)!
    if (currentWorkflow.historyIndex < currentWorkflow.history.length - 1) {
      const newHistoryIndex = currentWorkflow.historyIndex + 1
      const nextState = currentWorkflow.history[newHistoryIndex]
      setNodes(nextState.nodes)
      setEdges(nextState.edges)
      setWorkflows(
        workflows.map((w) =>
          w.id === activeWorkflowId
            ? { ...w, nodes: nextState.nodes, edges: nextState.edges, historyIndex: newHistoryIndex }
            : w,
        ),
      )
    }
  }

  const handleNewWorkflow = () => {
    const newWorkflow: Workflow = {
      id: (workflows.length + 1).toString(),
      name: `Untitled Workflow ${workflows.length + 1}`,
      nodes: initialNodes,
      edges: [],
      history: [],
      historyIndex: -1,
    }
    setWorkflows([...workflows, newWorkflow])
    setActiveWorkflowId(newWorkflow.id)
  }

  const handleCloseWorkflow = (id: string) => {
    if (workflows.length > 1) {
      const updatedWorkflows = workflows.filter((w) => w.id !== id)
      setWorkflows(updatedWorkflows)
      if (id === activeWorkflowId) {
        setActiveWorkflowId(updatedWorkflows[updatedWorkflows.length - 1].id)
      }
    }
  }

  const handleSelectWorkflow = (id: string) => {
    setActiveWorkflowId(id)
    const selectedWorkflow = workflows.find((w) => w.id === id)!
    setNodes(selectedWorkflow.nodes)
    setEdges(selectedWorkflow.edges)
  }

  return (
    <div className="flex h-screen overflow-x-hidden">
      <WorkflowSidebar />
      <div className="flex flex-col flex-grow">
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
              {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            <Input
              value={activeWorkflow.name}
              onChange={(e) => {
                const updatedWorkflows = workflows.map((w) =>
                  w.id === activeWorkflowId ? { ...w, name: e.target.value } : w,
                )
                setWorkflows(updatedWorkflows)
              }}
              className="text-lg font-semibold bg-transparent border-0 hover:bg-secondary focus:bg-secondary w-[300px]"
            />
            <Badge variant="outline" className="text-yellow-600 bg-yellow-50">
              Draft
            </Badge>
            <Badge variant="outline" className="text-green-600 bg-green-50">
              Running
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleUndo} disabled={activeWorkflow.historyIndex <= 0}>
              <Undo className="h-4 w-4 mr-2" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={activeWorkflow.historyIndex >= activeWorkflow.history.length - 1}
            >
              <Redo className="h-4 w-4 mr-2" />
              Redo
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Options
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setShowBrowseWorkflows(true)}>
                  <List className="h-4 w-4 mr-2" />
                  Browse Workflows
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowWorkflowTemplates(true)}>
                  <Star className="h-4 w-4 mr-2" />
                  Templates
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowWorkflowHistory(true)}>
                  <History className="h-4 w-4 mr-2" />
                  History
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowRepositoryManager(true)}>
                  <GitBranch className="h-4 w-4 mr-2" />
                  Manage Repository
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowCICDPipeline(true)}>
                  <Rocket className="h-4 w-4 mr-2" />
                  CI/CD Pipeline
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowIntegrationManager(true)}>
                  <Link className="h-4 w-4 mr-2" />
                  Manage Integrations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDocumentation(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Documentation
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowHelp(true)}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowPreferences(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button>
              <Play className="h-4 w-4 mr-2" />
              Deploy
            </Button>
          </div>
        </div>
        <div className="border-b overflow-x-auto">
          <WorkflowTabs
            workflows={workflows}
            activeWorkflowId={activeWorkflowId}
            onSelectWorkflow={handleSelectWorkflow}
            onNewWorkflow={handleNewWorkflow}
            onCloseWorkflow={handleCloseWorkflow}
          />
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div
            className="flex-1 h-full overflow-hidden"
            ref={reactFlowWrapper}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
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
              className="bg-dot-pattern"
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
          <WorkflowControlLibrary selectedNode={selectedNode} />
        </div>
      </div>
      <Dialog open={showRepositoryManager} onOpenChange={setShowRepositoryManager}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Repository Manager</DialogTitle>
          </DialogHeader>
          <RepositoryManager />
        </DialogContent>
      </Dialog>
      <Dialog open={showCICDPipeline} onOpenChange={setShowCICDPipeline}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>CI/CD Pipeline</DialogTitle>
          </DialogHeader>
          <CICDPipeline />
        </DialogContent>
      </Dialog>
      <Dialog open={showIntegrationManager} onOpenChange={setShowIntegrationManager}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Integration Manager</DialogTitle>
          </DialogHeader>
          <IntegrationManager />
        </DialogContent>
      </Dialog>
      <Dialog open={showDocumentation} onOpenChange={setShowDocumentation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Documentation</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm max-w-none">
            <p>Here you can find detailed documentation about using the workflow builder.</p>
            {/* Add more documentation content here */}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Help & Support</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm max-w-none">
            <p>Need help? Here are some resources to get you started:</p>
            <ul>
              <li>FAQ</li>
              <li>Tutorials</li>
              <li>Contact Support</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preferences</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch id="dark-mode" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Notifications</Label>
              <Switch id="notifications" />
            </div>
            {/* Add more preference options here */}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showBrowseWorkflows} onOpenChange={setShowBrowseWorkflows}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Browse Workflows</DialogTitle>
          </DialogHeader>
          <BrowseWorkflows />
        </DialogContent>
      </Dialog>
      <Dialog open={showWorkflowTemplates} onOpenChange={setShowWorkflowTemplates}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Workflow Templates</DialogTitle>
          </DialogHeader>
          <WorkflowTemplates />
        </DialogContent>
      </Dialog>
      <Dialog open={showWorkflowHistory} onOpenChange={setShowWorkflowHistory}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Workflow History</DialogTitle>
          </DialogHeader>
          <WorkflowHistory />
        </DialogContent>
      </Dialog>
    </div>
  )
}
