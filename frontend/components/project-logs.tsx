"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ProjectLogsProps {
  projectId: string
}

export function ProjectLogs({ projectId }: ProjectLogsProps) {
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    // Simulating real-time log updates
    const interval = setInterval(() => {
      setLogs((prevLogs) => [...prevLogs, `[${new Date().toISOString()}] Log entry ${prevLogs.length + 1}`])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {logs.map((log, index) => (
            <div key={index} className="mb-2">
              {log}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
