"use client"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

interface Workflow {
  id: string
  name: string
}

interface WorkflowTabsProps {
  workflows: Workflow[]
  activeWorkflowId: string
  onSelectWorkflow: (id: string) => void
  onNewWorkflow: () => void
  onCloseWorkflow: (id: string) => void
}

export function WorkflowTabs({
  workflows,
  activeWorkflowId,
  onSelectWorkflow,
  onNewWorkflow,
  onCloseWorkflow,
}: WorkflowTabsProps) {
  return (
    <div className="flex items-center border-b overflow-x-auto">
      <Tabs value={activeWorkflowId} onValueChange={onSelectWorkflow} className="flex-grow">
        <div className="flex-grow overflow-x-auto">
          <TabsList className="inline-flex min-w-full">
            {workflows.map((workflow) => (
              <TabsTrigger
                key={workflow.id}
                value={workflow.id}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm"
              >
                <span className="truncate max-w-[100px]">{workflow.name}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    onCloseWorkflow(workflow.id)
                  }}
                  className="cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>
      <Button variant="ghost" size="sm" onClick={onNewWorkflow} className="flex-shrink-0 ml-2">
        <Plus className="h-4 w-4 mr-2" />
        New Workflow
      </Button>
    </div>
  )
}
