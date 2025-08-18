"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Edit, Trash2, Copy } from "lucide-react"

interface Workflow {
  id: string
  name: string
  description: string
  lastModified: string
  status: "active" | "draft" | "archived"
}

const mockWorkflows: Workflow[] = [
  {
    id: "1",
    name: "Customer Onboarding",
    description: "Automate the customer onboarding process",
    lastModified: "2023-05-15",
    status: "active",
  },
  {
    id: "2",
    name: "Invoice Processing",
    description: "Streamline invoice processing and approval",
    lastModified: "2023-05-14",
    status: "draft",
  },
  {
    id: "3",
    name: "Employee Offboarding",
    description: "Manage employee offboarding tasks",
    lastModified: "2023-05-13",
    status: "archived",
  },
]

export function BrowseWorkflows() {
  const [searchTerm, setSearchTerm] = useState("")
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows)

  const filteredWorkflows = workflows.filter(
    (workflow) =>
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = (id: string) => {
    setWorkflows(workflows.filter((workflow) => workflow.id !== id))
  }

  const handleDuplicate = (workflow: Workflow) => {
    const newWorkflow = { ...workflow, id: Date.now().toString(), name: `${workflow.name} (Copy)` }
    setWorkflows([...workflows, newWorkflow])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="w-5 h-5 text-gray-500" />
        <Input
          type="text"
          placeholder="Search workflows..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Last Modified</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredWorkflows.map((workflow) => (
            <TableRow key={workflow.id}>
              <TableCell>{workflow.name}</TableCell>
              <TableCell>{workflow.description}</TableCell>
              <TableCell>{workflow.lastModified}</TableCell>
              <TableCell>{workflow.status}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDuplicate(workflow)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(workflow.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
