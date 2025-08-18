"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"

interface ExportCodeDialogProps {
  projectId: string
}

export function ExportCodeDialog({ projectId }: ExportCodeDialogProps) {
  const [selectedApps, setSelectedApps] = useState<string[]>([])

  const handleExport = () => {
    // Implement the export logic here
    console.log("Exporting code for apps:", selectedApps)
    // You would typically call an API to generate and download the code
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Code
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Code</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Select applications to export:</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="frontend"
                  checked={selectedApps.includes("frontend")}
                  onCheckedChange={(checked) =>
                    setSelectedApps(
                      checked ? [...selectedApps, "frontend"] : selectedApps.filter((app) => app !== "frontend"),
                    )
                  }
                />
                <Label htmlFor="frontend">Frontend</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="backend"
                  checked={selectedApps.includes("backend")}
                  onCheckedChange={(checked) =>
                    setSelectedApps(
                      checked ? [...selectedApps, "backend"] : selectedApps.filter((app) => app !== "backend"),
                    )
                  }
                />
                <Label htmlFor="backend">Backend API</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="admin"
                  checked={selectedApps.includes("admin")}
                  onCheckedChange={(checked) =>
                    setSelectedApps(
                      checked ? [...selectedApps, "admin"] : selectedApps.filter((app) => app !== "admin"),
                    )
                  }
                />
                <Label htmlFor="admin">Admin Dashboard</Label>
              </div>
            </div>
          </div>
          <Button onClick={handleExport} disabled={selectedApps.length === 0}>
            Export Selected
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
