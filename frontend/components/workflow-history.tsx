"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RotateCcw, Eye } from "lucide-react"

interface HistoryEntry {
  id: string
  timestamp: string
  action: string
  user: string
}

const mockHistory: HistoryEntry[] = [
  {
    id: "1",
    timestamp: "2023-05-15 14:30",
    action: "Added new node",
    user: "John Doe",
  },
  {
    id: "2",
    timestamp: "2023-05-15 14:25",
    action: "Modified connection",
    user: "Jane Smith",
  },
  {
    id: "3",
    timestamp: "2023-05-15 14:20",
    action: "Deleted node",
    user: "John Doe",
  },
]

export function WorkflowHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(mockHistory)

  const handleRevert = (id: string) => {
    // In a real application, you would implement the revert logic here
    console.log(`Reverting change with id: ${id}`)
  }

  const handleViewDetails = (id: string) => {
    // In a real application, you would show detailed view of the change
    console.log(`Viewing details for change with id: ${id}`)
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{entry.timestamp}</TableCell>
              <TableCell>{entry.action}</TableCell>
              <TableCell>{entry.user}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleRevert(entry.id)}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Revert
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(entry.id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
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
