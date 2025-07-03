"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Commit {
  id: string
  message: string
  timestamp: Date
}

export function VersionControl() {
  const [commits, setCommits] = useState<Commit[]>([])
  const [commitMessage, setCommitMessage] = useState("")

  const handleCommit = () => {
    if (commitMessage.trim()) {
      const newCommit: Commit = {
        id: Math.random().toString(36).substr(2, 9),
        message: commitMessage,
        timestamp: new Date(),
      }
      setCommits([newCommit, ...commits])
      setCommitMessage("")
    }
  }

  return (
    <div className="border-l p-4 w-64">
      <h2 className="text-lg font-semibold mb-4">Version Control</h2>
      <div className="mb-4">
        <Input placeholder="Commit message" value={commitMessage} onChange={(e) => setCommitMessage(e.target.value)} />
        <Button onClick={handleCommit} className="mt-2 w-full">
          Commit
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-200px)]">
        {commits.map((commit) => (
          <div key={commit.id} className="mb-2 p-2 border rounded">
            <p className="font-medium">{commit.message}</p>
            <p className="text-sm text-gray-500">{commit.timestamp.toLocaleString()}</p>
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}
