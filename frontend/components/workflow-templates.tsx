"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus } from "lucide-react"

interface Template {
  id: string
  name: string
  description: string
  category: string
  image: string
}

const mockTemplates: Template[] = [
  {
    id: "1",
    name: "Customer Onboarding",
    description: "Streamline your customer onboarding process",
    category: "Sales",
    image: "/placeholder.svg",
  },
  {
    id: "2",
    name: "Employee Onboarding",
    description: "Automate your employee onboarding workflow",
    category: "HR",
    image: "/placeholder.svg",
  },
  {
    id: "3",
    name: "Invoice Approval",
    description: "Simplify your invoice approval process",
    category: "Finance",
    image: "/placeholder.svg",
  },
]

export function WorkflowTemplates() {
  const [searchTerm, setSearchTerm] = useState("")
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="w-5 h-5 text-gray-500" />
        <Input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <img
                src={template.image || "/placeholder.svg"}
                alt={template.name}
                className="w-full h-40 object-cover rounded-t-lg"
              />
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge>{template.category}</Badge>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Use Template
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
