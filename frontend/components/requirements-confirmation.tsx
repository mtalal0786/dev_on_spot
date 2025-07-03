"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Requirement {
  id: string
  description: string
}

interface RequirementsConfirmationProps {
  suggestedRequirements: Requirement[]
  onConfirm: (requirements: Requirement[]) => void
  onCancel: () => void
}

export function RequirementsConfirmation({
  suggestedRequirements,
  onConfirm,
  onCancel,
}: RequirementsConfirmationProps) {
  const [editableRequirements, setEditableRequirements] = useState<Requirement[]>(suggestedRequirements)

  const handleRequirementChange = (id: string, newDescription: string) => {
    setEditableRequirements((prev) =>
      prev.map((req) => (req.id === id ? { ...req, description: newDescription } : req)),
    )
  }

  const handleConfirm = () => {
    onConfirm(editableRequirements)
  }

  return (
    <div className="flex space-x-4">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Suggested Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5">
            {suggestedRequirements.map((req) => (
              <li key={req.id}>{req.description}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Editable Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {editableRequirements.map((req) => (
              <Textarea
                key={req.id}
                value={req.description}
                onChange={(e) => handleRequirementChange(req.id, e.target.value)}
                rows={3}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col justify-end space-y-2">
        <Button onClick={handleConfirm}>Confirm</Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
