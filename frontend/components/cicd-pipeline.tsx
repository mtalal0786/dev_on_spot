"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, RotateCcw } from "lucide-react"

export function CICDPipeline() {
  const [pipeline, setPipeline] = useState("default")

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pipeline">Pipeline</Label>
        <Select value={pipeline} onValueChange={setPipeline}>
          <SelectTrigger id="pipeline">
            <SelectValue placeholder="Select pipeline" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="production">Production</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Actions</Label>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Play className="mr-2 h-4 w-4" />
            Run
          </Button>
          <Button variant="outline" size="sm">
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </Button>
          <Button variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Rollback
          </Button>
        </div>
      </div>
    </div>
  )
}
