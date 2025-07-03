"use client"

import { useState, useCallback, Suspense, lazy } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Play,
  Upload,
  Rocket,
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  MessageSquare,
  Save,
  Puzzle,
  LayoutTemplateIcon as Template,
  FolderTree,
  Navigation,
  MoreHorizontal,
  Layers,
  Brain,
  BarChart3,
  Terminal,
} from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DesignCanvas } from "./design-canvas"
import { BackendDesigner } from "./backend-designer"
import { CodeEditor } from "./code-editor"
import { Console } from "./console"
import { PropertiesPanel } from "./properties-panel"
import { ElementPanel } from "./element-panel"
import { PromptTool } from "./prompt-tool"
import { ImportDialog } from "./import-dialog"
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { GuidedTour } from "./guided-tour"
import { PluginManager } from "./plugin-manager"
import { TemplateManager } from "./template-manager"
import { FolderStructure } from "./folder-structure"
import { NavigationManager } from "./navigation-manager"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LayersPanel } from "./layers-panel"

const LazyAIBuilder = lazy(() => import("./ai-builder").then((module) => ({ default: module.AIBuilder })))
const LazyDashboardBuilder = lazy(() =>
  import("./dashboard-builder").then((module) => ({ default: module.DashboardBuilder })),
)

interface DesignInterfaceProps {
  projectName: string
  projectType: string
  techStack: string[]
  requirements: { id: string; description: string }[]
}

export function DesignInterface({ projectName, projectType, techStack, requirements }: DesignInterfaceProps) {
  const [selectedElement, setSelectedElement] = useState(null)
  const [viewportSize, setViewportSize] = useState("desktop")
  const [showPromptTool, setShowPromptTool] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importType, setImportType] = useState<"figma" | "image" | null>(null)
  const [activeTab, setActiveTab] = useState("frontend")
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [showGuidedTour, setShowGuidedTour] = useState(true)
  const [showPluginManager, setShowPluginManager] = useState(false)
  const [showTemplateManager, setShowTemplateManager] = useState(false)
  const [showFolderStructure, setShowFolderStructure] = useState(false)
  const [showNavigationManager, setShowNavigationManager] = useState(false)
  const [showLayersPanel, setShowLayersPanel] = useState(false)
  const [showAIBuilder, setShowAIBuilder] = useState(false)
  const [showDashboardBuilder, setShowDashboardBuilder] = useState(false)
  const [showVersionControl, setShowVersionControl] = useState(false)
  const [showConsole, setShowConsole] = useState(false)

  const addConsoleOutput = useCallback((message: string) => {
    setConsoleOutput((prev) => [...prev, message])
  }, [])

  const TopToolbar = useCallback(
    () => (
      <div className="border-b p-2 bg-background">
        <div className="flex items-center space-x-2">
          <ToggleGroup type="single" value={viewportSize} onValueChange={(value) => value && setViewportSize(value)}>
            <ToggleGroupItem value="desktop" aria-label="Desktop view">
              <Monitor className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="laptop" aria-label="Laptop view">
              <Laptop className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="tablet" aria-label="Tablet view">
              <Tablet className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="mobile" aria-label="Mobile view">
              <Smartphone className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button
            variant={showLayersPanel ? "default" : "outline"}
            size="icon"
            onClick={() => setShowLayersPanel(!showLayersPanel)}
          >
            <Layers className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setShowVersionControl(!showVersionControl)}>
            <Save className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Play className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => {
                  setImportType("figma")
                  setImportDialogOpen(true)
                }}
              >
                From Figma
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setImportType("image")
                  setImportDialogOpen(true)
                }}
              >
                From Image
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant={showPromptTool ? "default" : "outline"}
            size="icon"
            onClick={() => setShowPromptTool(!showPromptTool)}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            variant={showConsole ? "default" : "outline"}
            size="icon"
            onClick={() => setShowConsole(!showConsole)}
          >
            <Terminal className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setShowPluginManager(true)}>
                <Puzzle className="h-4 w-4 mr-2" />
                Plugins
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowTemplateManager(true)}>
                <Template className="h-4 w-4 mr-2" />
                Templates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowFolderStructure(true)}>
                <FolderTree className="h-4 w-4 mr-2" />
                Folder Structure
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowNavigationManager(true)}>
                <Navigation className="h-4 w-4 mr-2" />
                Navigation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowAIBuilder(true)}>
                <Brain className="h-4 w-4 mr-2" />
                AI Builder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDashboardBuilder(true)}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard Builder
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Rocket className="h-4 w-4 mr-2" />
                Deploy
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    ),
    [viewportSize, showLayersPanel, showPromptTool, showVersionControl, showConsole],
  )

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        <TopToolbar />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-grow">
          <TabsList className="justify-start px-2 border-b">
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
            <TabsTrigger value="backend">Backend</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>
          <div className="flex-grow overflow-hidden">
            <TabsContent value="frontend" className="h-full">
              <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                  <ElementPanel />
                </ResizablePanel>
                <ResizablePanel defaultSize={60}>
                  <DesignCanvas
                    onSelectElement={setSelectedElement}
                    viewportSize={viewportSize}
                    addConsoleOutput={addConsoleOutput}
                  />
                </ResizablePanel>
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                  {showLayersPanel ? (
                    <LayersPanel onSelectElement={setSelectedElement} />
                  ) : selectedElement ? (
                    <PropertiesPanel selectedElement={selectedElement} addConsoleOutput={addConsoleOutput} />
                  ) : null}
                </ResizablePanel>
              </ResizablePanelGroup>
            </TabsContent>
            <TabsContent value="backend" className="h-full">
              <BackendDesigner addConsoleOutput={addConsoleOutput} />
            </TabsContent>
            <TabsContent value="code" className="h-full overflow-hidden">
              <CodeEditor />
            </TabsContent>
            <TabsContent value="ai" className="h-full">
              <Suspense fallback={<div>Loading AI Builder...</div>}>
                <LazyAIBuilder addConsoleOutput={addConsoleOutput} />
              </Suspense>
            </TabsContent>
            <TabsContent value="dashboard" className="h-full">
              <Suspense fallback={<div>Loading Dashboard Builder...</div>}>
                <LazyDashboardBuilder addConsoleOutput={addConsoleOutput} />
              </Suspense>
            </TabsContent>
          </div>
        </Tabs>
        {showConsole && (
          <div className="h-64 border-t">
            <Console output={consoleOutput} />
          </div>
        )}
        {showPromptTool && <PromptTool onGenerate={addConsoleOutput} />}
        <ImportDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          importType={importType}
          onImport={(data) => {
            console.log("Importing:", data)
            setImportDialogOpen(false)
          }}
        />
        {showGuidedTour && <GuidedTour />}
        <PluginManager
          open={showPluginManager}
          onOpenChange={setShowPluginManager}
          addConsoleOutput={addConsoleOutput}
        />
        <TemplateManager
          open={showTemplateManager}
          onOpenChange={setShowTemplateManager}
          addConsoleOutput={addConsoleOutput}
        />
        <FolderStructure
          open={showFolderStructure}
          onOpenChange={setShowFolderStructure}
          addConsoleOutput={addConsoleOutput}
        />
        <NavigationManager
          open={showNavigationManager}
          onOpenChange={setShowNavigationManager}
          addConsoleOutput={addConsoleOutput}
        />
        {showAIBuilder && <LazyAIBuilder addConsoleOutput={addConsoleOutput} />}
        {showDashboardBuilder && <LazyDashboardBuilder addConsoleOutput={addConsoleOutput} />}
      </div>
    </DndProvider>
  )
}
