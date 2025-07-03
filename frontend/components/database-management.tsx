"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function DatabaseManagement({ projectId }: { projectId: string }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])

  const handleExecuteQuery = () => {
    // In a real application, you would send the query to your backend
    // and update the results based on the response
    console.log("Executing query:", query)
    setResults([
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Smith", email: "jane@example.com" },
    ])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter SQL query"
              className="flex-grow"
            />
            <Button onClick={handleExecuteQuery}>Execute</Button>
          </div>
          {results.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(results[0]).map((key) => (
                    <TableHead key={key}>{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((row, index) => (
                  <TableRow key={index}>
                    {Object.values(row).map((value: any, cellIndex) => (
                      <TableCell key={cellIndex}>{value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
