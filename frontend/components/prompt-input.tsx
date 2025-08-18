"use client"

import { useState } from "react"
import { RequirementsConfirmation } from "./requirements-confirmation"
import { DesignInterface } from "./design-interface"
import { ProjectTypeSelector } from "./project-type-selector"
import { TechStackPopup } from "./tech-stack-popup"

interface PromptInputProps {
  onGenerateStart: () => void
  onGenerateEnd: () => void
}

export function PromptInput({ onGenerateStart, onGenerateEnd }: PromptInputProps) {
  const [step, setStep] = useState<"type" | "tech" | "requirements" | "design">("type")
  const [projectType, setProjectType] = useState<string>("")
  const [projectDescription, setProjectDescription] = useState<string>("")
  const [techStack, setTechStack] = useState<string[]>([])
  const [requirements, setRequirements] = useState<{ id: string; description: string }[]>([])
  const [showTechStackPopup, setShowTechStackPopup] = useState(false)

  const handleProjectTypeSelect = (type: string, description: string) => {
    setProjectType(type)
    setProjectDescription(description)
    setShowTechStackPopup(true)
  }

  const handleTechStackSelect = (technologies: string[]) => {
    setTechStack(technologies)
    onGenerateStart()
    // TODO: Implement API call to generate requirements
    const generatedRequirements = [
      { id: "1", description: "User authentication system" },
      { id: "2", description: "Product listing page" },
      { id: "3", description: "Shopping cart functionality" },
    ]
    setRequirements(generatedRequirements)
    setStep("requirements")
  }

  const handleConfirmRequirements = (confirmedRequirements: string) => {
    // TODO: Implement project generation logic
    console.log("Generating project with confirmed requirements:", confirmedRequirements)
    setRequirements([])
    setStep("design")
  }

  const handleCancelRequirements = () => {
    setRequirements([])
    setStep("type")
    onGenerateEnd()
  }

  if (step === "type") {
    return (
      <>
        <ProjectTypeSelector onSelect={handleProjectTypeSelect} />
        <TechStackPopup
          projectType={projectType}
          isOpen={showTechStackPopup}
          onClose={() => setShowTechStackPopup(false)}
          onSelect={handleTechStackSelect}
        />
      </>
    )
  }

  if (step === "design") {
    return <DesignInterface />
  }

  return (
    <div className="mb-8">
      <RequirementsConfirmation
        requirements={requirements}
        onConfirm={handleConfirmRequirements}
        onCancel={handleCancelRequirements}
      />
    </div>
  )
}
