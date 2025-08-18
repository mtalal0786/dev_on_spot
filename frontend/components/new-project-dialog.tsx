"use client";

import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { MultiSelect } from "@/components/ui/multi-select";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "production" | "development" | "archived";
  lastDeployed: string;
  url: string;
  image: string;
  visitors: number;
  spaceUsed: string;
  applications: string[];
}

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreate: (project: Project) => void;
}

export function NewProjectDialog({
  open,
  onOpenChange,
  onProjectCreate,
}: NewProjectDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<"name" | "applications">("name");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [applications, setApplications] = useState<string[]>([]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation before moving to the next step
    if (!projectName.trim() || !projectDescription.trim()) {
      alert("Project name and description cannot be empty.");
      return;
    }
    setStep("applications");
  };

  const handleApplicationsSelect = () => {
    // Basic validation before creating project
    if (applications.length === 0) {
      alert("Please select at least one application type.");
      return;
    }

    const newProject: Project = {
      id: Date.now().toString(),
      name: projectName,
      description: `A project using ${applications.join(", ")}`,
      status: "development",
      lastDeployed: "Not deployed yet",
      url: `https://${projectName.toLowerCase().replace(/\s+/g, "-")}.example.com`,
      image: "/placeholder.svg?height=100&width=100",
      visitors: 0,
      spaceUsed: "0 MB",
      applications: applications,
    };

    onProjectCreate(newProject);
    onOpenChange(false);

    // --- START MODIFICATION ---
    // Store project details in sessionStorage as JSON
    sessionStorage.setItem(
      "newProjectDetails",
      JSON.stringify({
        projectName,
        projectDescription,
        applications, // Store the array directly
      })
    );

    // Navigate to the requirements page without any query params,
    // as data is now in sessionStorage
    router.push(`/new-project/requirements`);
    // --- END MODIFICATION ---
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new project</DialogTitle>
          <DialogDescription>
            {step === "name" && "Enter your project name and description to get started."}
            {step === "applications" && "Select the application types for your project."}
          </DialogDescription>
        </DialogHeader>

        {step === "name" && (
          <form onSubmit={handleNameSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="project-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="project-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="project-description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter project description"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={!projectName.trim() || !projectDescription.trim()}>Continue</Button>
            </div>
          </form>
        )}

        {step === "applications" && (
          <div className="grid gap-4 py-4">
            <Label htmlFor="applications-select">Select Applications</Label>
            <MultiSelect
              id="applications-select"
              options={[
                { value: "frontend", label: "Frontend" },
                { value: "backend", label: "Backend" },
                { value: "mobile", label: "Mobile App" },
                { value: "desktop", label: "Desktop App" },
                { value: "api", label: "API" },
                { value: "database", label: "Database" },
                { value: "ai", label: "AI/ML" },
              ]}
              selected={applications}
              onChange={setApplications}
            />
            <Button
              onClick={handleApplicationsSelect}
              disabled={applications.length === 0} // Disable if no applications selected
            >
              Create Project
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}