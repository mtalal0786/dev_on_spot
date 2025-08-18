"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Rocket, Clock, CheckCircle, XCircle } from "lucide-react"

interface Deployment {
  id: string
  version: string
  environment: string
  status: "success" | "failed" | "in-progress"
  timestamp: string
}

export function DeploymentManager() {
  const [deployments, setDeployments] = useState<Deployment[]>([
    { id: "1", version: "v1.0.0", environment: "production", status: "success", timestamp: "2023-05-20 14:30" },
    { id: "2", version: "v0.9.5", environment: "staging", status: "in-progress", timestamp: "2023-05-20 13:45" },
    { id: "3", version: "v0.9.0", environment: "production", status: "failed", timestamp: "2023-05-19 10:15" },
  ])

  const [newVersion, setNewVersion] = useState("")
  const [selectedEnvironment, setSelectedEnvironment] = useState("")

  const handleDeploy = () => {
    if (newVersion && selectedEnvironment) {
      const newDeployment: Deployment = {
        id: (deployments.length + 1).toString(),
        version: newVersion,
        environment: selectedEnvironment,
        status: "in-progress",
        timestamp: new Date().toLocaleString(),
      }
      setDeployments([newDeployment, ...deployments])
      setNewVersion("")
      setSelectedEnvironment("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Deployment Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              placeholder="e.g., v1.0.1"
              value={newVersion}
              onChange={(e) => setNewVersion(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="environment">Environment</Label>
            <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
              <SelectTrigger id="environment">
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="development">Development</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleDeploy} disabled={!newVersion || !selectedEnvironment}>
              <Rocket className="mr-2 h-4 w-4" />
              Deploy
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Environment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deployments.map((deployment) => (
              <TableRow key={deployment.id}>
                <TableCell>{deployment.version}</TableCell>
                <TableCell>{deployment.environment}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      deployment.status === "success"
                        ? "success"
                        : deployment.status === "failed"
                          ? "destructive"
                          : "default"
                    }
                  >
                    {deployment.status === "success" && <CheckCircle className="mr-1 h-3 w-3" />}
                    {deployment.status === "failed" && <XCircle className="mr-1 h-3 w-3" />}
                    {deployment.status === "in-progress" && <Clock className="mr-1 h-3 w-3" />}
                    {deployment.status}
                  </Badge>
                </TableCell>
                <TableCell>{deployment.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
