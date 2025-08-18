"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"

interface AIModelProps {
  model: {
    name: string
    provider: string
    description: string
    type: string
    icon: LucideIcon
    features: string[]
    pricing: string
  }
}

export function AIModelCard({ model }: AIModelProps) {
  const Icon = model.icon

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{model.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{model.provider}</p>
            </div>
          </div>
          <Badge variant="outline">{model.type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{model.description}</p>
        <div className="flex flex-wrap gap-2">
          {model.features.map((feature) => (
            <Badge key={feature} variant="secondary">
              {feature}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">{model.pricing}</p>
        <Button variant="outline">Try Now</Button>
      </CardFooter>
    </Card>
  )
}
