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
    setStep("applications");
  };

  const handleApplicationsSelect = () => {
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

    // Pass the project params to the next page via URL query params
    const params = new URLSearchParams({
      projectName,
      projectDescription,
      applications: applications.join(","),
    }).toString();
    router.push(`/new-project/requirements?${params}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new project</DialogTitle>
          <DialogDescription>
            {step === "name" && "Enter your project name to get started."}
            {step === "applications" && "Select the applications for your project."}
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
              <Button type="submit">Continue</Button>
            </div>
          </form>
        )}

        {step === "applications" && (
          <div className="grid gap-4 py-4">
            <Label>Select Applications</Label>
            <MultiSelect
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
            >
              Create Project
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
