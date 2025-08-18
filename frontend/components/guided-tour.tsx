"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const tourSteps = [
  {
    title: "Welcome to AI Software Engineer",
    description: "This tour will guide you through the main features of the interface.",
  },
  {
    title: "Frontend Design",
    description:
      "Drag and drop elements to design your user interface. Use the properties panel to customize elements.",
  },
  {
    title: "Backend Logic",
    description: "Create backend workflows using the visual designer. Connect nodes to define your application logic.",
  },
  {
    title: "Code Editor",
    description: "Write and edit code directly in the browser. Enjoy syntax highlighting and auto-completion.",
  },
  {
    title: "Console",
    description: "View logs, errors, and debug information in real-time as you work on your project.",
  },
]

export function GuidedTour() {
  const [open, setOpen] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setOpen(false)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tourSteps[currentStep].title}</DialogTitle>
          <DialogDescription>{tourSteps[currentStep].description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
            Previous
          </Button>
          <Button onClick={handleNext}>{currentStep === tourSteps.length - 1 ? "Finish" : "Next"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
