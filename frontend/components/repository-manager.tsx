"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GitBranch, GitCommit, GitPullRequest } from "lucide-react"

export function RepositoryManager() {
  const [repoUrl, setRepoUrl] = useState("")
  const [branch, setBranch] = useState("")

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="repo-url">Repository URL</Label>
        <Input
          id="repo-url"
          placeholder="https://github.com/username/repo.git"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="branch">Branch</Label>
        <Input id="branch" placeholder="main" value={branch} onChange={(e) => setBranch(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Actions</Label>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <GitBranch className="mr-2 h-4 w-4" />
            Clone
          </Button>
          <Button variant="outline" size="sm">
            <GitCommit className="mr-2 h-4 w-4" />
            Commit
          </Button>
          <Button variant="outline" size="sm">
            <GitPullRequest className="mr-2 h-4 w-4" />
            Create PR
          </Button>
        </div>
      </div>
    </div>
  )
}
