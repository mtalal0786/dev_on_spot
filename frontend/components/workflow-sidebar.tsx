"use client"

import type React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import * as Icons from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

type WorkflowSidebarProps = {}

const categories = [
  {
    name: "Triggers",
    items: [
      { type: "webhook", name: "Webhook", icon: "Webhook", description: "Receive webhook events" },
      { type: "schedule", name: "Schedule", icon: "Clock", description: "Time-based trigger" },
      { type: "event", name: "Event", icon: "Zap", description: "Event-based trigger" },
      { type: "ai-trigger", name: "AI Trigger", icon: "Brain", description: "Trigger based on AI predictions" },
      { type: "git-trigger", name: "Git Trigger", icon: "Git", description: "Trigger on git events" },
    ],
  },
  {
    name: "Actions",
    items: [
      { type: "email", name: "Send Email", icon: "Mail", description: "Send an email" },
      { type: "notification", name: "Notification", icon: "Bell", description: "Send notification" },
      { type: "http", name: "HTTP Request", icon: "Globe", description: "Make HTTP request" },
      { type: "database", name: "Database Operation", icon: "Database", description: "Perform database operations" },
      { type: "file", name: "File Operation", icon: "File", description: "Perform file operations" },
    ],
  },
  {
    name: "Logic",
    items: [
      { type: "condition", name: "Condition", icon: "GitBranch", description: "Branch workflow" },
      { type: "loop", name: "Loop", icon: "RepeatIcon", description: "Iterate over items" },
      { type: "switch", name: "Switch", icon: "Split", description: "Multiple branches" },
      { type: "delay", name: "Delay", icon: "Clock", description: "Add a delay in the workflow" },
    ],
  },
  {
    name: "Data",
    items: [
      { type: "transform", name: "Transform", icon: "Replace", description: "Transform data" },
      { type: "filter", name: "Filter", icon: "Filter", description: "Filter data" },
      { type: "merge", name: "Merge", icon: "Git", description: "Merge data" },
      { type: "validate", name: "Validate", icon: "CheckCircle", description: "Validate data" },
    ],
  },
  {
    name: "AI & ML",
    items: [
      { type: "text-generation", name: "Text Generation", icon: "Type", description: "Generate text using AI" },
      {
        type: "image-recognition",
        name: "Image Recognition",
        icon: "Image",
        description: "Recognize objects in images",
      },
      { type: "sentiment-analysis", name: "Sentiment Analysis", icon: "Smile", description: "Analyze text sentiment" },
      { type: "prediction", name: "Prediction", icon: "TrendingUp", description: "Make predictions using ML models" },
      { type: "clustering", name: "Clustering", icon: "Group", description: "Perform data clustering" },
    ],
  },
  {
    name: "Automation",
    items: [
      { type: "task", name: "Automated Task", icon: "Check", description: "Run an automated task" },
      { type: "script", name: "Run Script", icon: "Terminal", description: "Execute a custom script" },
      { type: "integration", name: "Integration", icon: "Link", description: "Integrate with external services" },
      { type: "workflow", name: "Sub-Workflow", icon: "GitBranch", description: "Run a sub-workflow" },
    ],
  },
  {
    name: "Testing",
    items: [
      { type: "unit-test", name: "Unit Test", icon: "Code", description: "Run unit tests" },
      { type: "integration-test", name: "Integration Test", icon: "GitMerge", description: "Run integration tests" },
      { type: "e2e-test", name: "E2E Test", icon: "Monitor", description: "Run end-to-end tests" },
      { type: "load-test", name: "Load Test", icon: "Activity", description: "Run load tests" },
    ],
  },
  {
    name: "CI/CD",
    items: [
      { type: "build", name: "Build", icon: "Package", description: "Build the application" },
      { type: "deploy", name: "Deploy", icon: "Upload", description: "Deploy the application" },
      { type: "rollback", name: "Rollback", icon: "Rewind", description: "Rollback to previous version" },
      { type: "approval", name: "Approval", icon: "UserCheck", description: "Require manual approval" },
    ],
  },
  {
    name: "Repository",
    items: [
      { type: "git-clone", name: "Git Clone", icon: "GitBranch", description: "Clone a git repository" },
      { type: "git-push", name: "Git Push", icon: "Upload", description: "Push changes to git" },
      { type: "git-pull", name: "Git Pull", icon: "Download", description: "Pull changes from git" },
      { type: "create-pr", name: "Create PR", icon: "GitPullRequest", description: "Create a pull request" },
    ],
  },
  {
    name: "Integrations",
    items: [
      { type: "github", name: "GitHub", icon: "Github", description: "Integrate with GitHub" },
      { type: "jira", name: "Jira", icon: "Trello", description: "Integrate with Jira" },
      { type: "slack", name: "Slack", icon: "MessageSquare", description: "Integrate with Slack" },
      { type: "aws", name: "AWS", icon: "Cloud", description: "Integrate with AWS services" },
    ],
  },
]

export function WorkflowSidebar({}: WorkflowSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleDragStart = (event: React.DragEvent, item: any) => {
    event.dataTransfer.setData("application/reactflow", item.type)
    event.dataTransfer.setData("nodeName", item.name)
    event.dataTransfer.setData("nodeIcon", item.icon)
    event.dataTransfer.effectAllowed = "move"
  }

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((category) => category.items.length > 0)

  return (
    <div className="w-64 bg-background flex flex-col border-r">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {filteredCategories.map((category) => (
            <div key={category.name}>
              <h3
                className="text-sm font-medium mb-2 cursor-pointer"
                onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
              >
                {category.name}
              </h3>
              <div className="space-y-2">
                {category.items.map((item) => {
                  const Icon = Icons[item.icon as keyof typeof Icons] || Icons.Box
                  return (
                    <div
                      key={item.name}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      className={cn(
                        "flex items-center space-x-2 p-2 rounded-md hover:bg-secondary cursor-move",
                        "border border-transparent hover:border-border",
                      )}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
