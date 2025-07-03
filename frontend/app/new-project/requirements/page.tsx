"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/ui/loader"; // Import loader component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Card components
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";

// Requirement interface for suggested requirements
interface Requirement {
  id: string;
  description: string;
}

export default function RequirementsGathering() {
  const searchParams = useSearchParams();

  // Retrieve parameters from the URL
  const projectName = searchParams.get("projectName");
  const projectDescription = searchParams.get("projectDescription");
  const applications = searchParams.get("applications")?.split(",");

  // Set a temporary default user for `createdBy` (this will be replaced later with actual user data after login/signup integration)
  const [createdBy] = useState("defaultUser"); // Temporary value, to be replaced later
  const [suggestedRequirements, setSuggestedRequirements] = useState<string[]>([]); // For suggested requirements (now it's a simple array of strings)
  const [editableRequirements, setEditableRequirements] = useState<string>(""); // To store the editable requirements
  const [loading, setLoading] = useState(false); // To manage loading state
  const [error, setError] = useState<string | null>(null); // To handle errors
  const [isSaving, setIsSaving] = useState(false); // To track if the project is being saved

  // Function to generate the initial requirements using the first API call
  const generateRequirements = async () => {
    if (!projectName || !projectDescription || !applications) return;

    setLoading(true);
    setError(null); // Reset any previous error

    const promptText = `${projectName}\n\n${projectDescription}\n\nApplications: ${applications.join(", ")}`;

    try {
      const response = await fetch("/api/requirements/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requirements: promptText }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate requirements");
      }

      const data = await response.json();
      let processedRequirements = data.generatedRequirements;

      // Add project name in bold
      processedRequirements = processedRequirements.replace(
        "System Requirements Specification (SRS) for",
        `**${projectName}**`
      );

      setEditableRequirements(processedRequirements); // Populate the textarea

      // Once the first API call is done, call for suggested modules
      await generateSuggestedModules(processedRequirements);

    } catch (error: any) {
      setError(error.message); // Set the error message
      console.error("Error generating requirements:", error);
    } finally {
      setLoading(false); // Stop the loading spinner
    }
  };

  // Function to generate suggested modules based on the generated content
  const generateSuggestedModules = async (generatedRequirements: string) => {
    try {
      const response = await fetch("/api/requirements/suggest-modules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requirements: generatedRequirements }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch suggested modules");
      }

      const data = await response.json();
      const modules = data.suggestedModules || [];

      // Update the suggested modules list
      setSuggestedRequirements(modules);

    } catch (error: any) {
      setError("Failed to fetch suggested modules");
      console.error("Error fetching suggested modules:", error);
    }
  };

  useEffect(() => {
    if (projectName && projectDescription && applications && !loading && !editableRequirements) {
      generateRequirements(); // Trigger the requirement generation only once
    }
  }, [projectName, projectDescription, applications, editableRequirements, loading]);

  const handleModuleClick = async (moduleDescription: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/requirements/insert-module", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requirements: editableRequirements, // Current requirements content
          moduleName: moduleDescription, // The selected module to add
          detailLevel: "super-detailed", // Instruct API to rewrite in super super detail
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to insert module");
      }

      const data = await response.json();
      setEditableRequirements(data.updatedRequirements); // Overwrite with the new, detailed requirements

      // Remove the clicked module from the list
      setSuggestedRequirements((prev) =>
        prev.filter((item) => item !== moduleDescription)
      );

      // Add a new module to the list from the remaining ones
      if (suggestedRequirements.length > 0) {
        setSuggestedRequirements((prev) => [
          ...prev,
          suggestedRequirements[suggestedRequirements.length - 1],
        ]);
      }

    } catch (error: any) {
      setError("Failed to insert the module");
      console.error("Error inserting module:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to save the project and then move to the next page
  const handleSaveAndNext = async () => {
    setIsSaving(true);
    setLoading(true);
    console.log(projectName, projectDescription, createdBy, editableRequirements, suggestedRequirements);

    try {
      // Save the project first
      console.log("Saving project with the following details:");
      console.log("Project Name:", projectName);
      console.log("Project Description:", projectDescription);
      console.log("Created By:", createdBy);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName,              // Project name
          projectDescription,       // Project description
          createdBy,                // Default user for now (to be replaced later)
          generatedRequirements: editableRequirements, // Final updated requirements
          modules: suggestedRequirements, // List of modules
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save project");
      }

      const data = await response.json();
      console.log("Project saved:", data);

      // Optional: Redirect or notify the user that the project was saved successfully
      alert("Project saved successfully!");

      // Now, navigate to the next page
      window.location.href = "/test-folder"; // You can change this to your next page URL

    } catch (error) {
      setError("Failed to save the project");
      console.error("Error saving project:", error);
    } finally {
      setLoading(false);
      setIsSaving(false); // Reset saving state
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="flex">
        <Sidebar isCollapsed={false} />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Project Requirements</h1>

          {/* Start of the page loader and visual dimming */}
          {loading && (
            <div className="absolute inset-0 bg-gray-800 opacity-50 z-10 flex justify-center items-center">
              <Loader />
            </div>
          )}

          <div className="flex space-x-8">
            {/* Suggested Requirements Card */}
            <Card className="w-1/3">
              <CardHeader>
                <CardTitle>Suggested Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {suggestedRequirements.length > 0 ? (
                  <div className="space-y-2">
                    {suggestedRequirements.slice(0, 5) // Show only 5 initially
                      .map((req, index) => (
                        <div
                          key={index}
                          className="p-4 border rounded-md shadow-sm cursor-pointer"
                          onClick={async () => {
                            await handleModuleClick(req);
                          }}
                        >
                          <p>{req}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p>Generating ...</p>
                )}
              </CardContent>
            </Card>

            {/* Editable Requirements Card */}
            <Card className="w-2/3">
              <CardHeader>
                <CardTitle>Project Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={editableRequirements}
                  onChange={(e) => setEditableRequirements(e.target.value)} // User can edit if needed
                  rows={10}
                  placeholder="Generated requirements will appear here..."
                  readOnly={loading} // Disable textarea while loading
                />
              </CardContent>
            </Card>
          </div>

          {error && <div className="text-red-500 mt-4">{error}</div>}

          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleSaveAndNext}
              disabled={isSaving} // Disable button while saving
            >
              {isSaving ? "Saving..." : "Next"}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
