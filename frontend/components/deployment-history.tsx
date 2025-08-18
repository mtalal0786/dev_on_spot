import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Deployment {
  id: string
  version: string
  date: string
  status: "success" | "failed"
}

interface DeploymentHistoryProps {
  deployments: Deployment[]
}

export function DeploymentHistory({ deployments }: DeploymentHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deployment History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deployments.map((deployment) => (
              <TableRow key={deployment.id}>
                <TableCell>{deployment.version}</TableCell>
                <TableCell>{deployment.date}</TableCell>
                <TableCell>{deployment.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
