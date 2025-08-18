"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation"; // Keep useSearchParams if you might use it for other things, but not for initial project data
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/ui/loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import { useRouter } from "next/navigation"; // Import useRouter for potential redirection

// Requirement interface for suggested requirements (not strictly needed for this file, but good for context)
interface Requirement {
  id: string;
  description: string;
}

export default function RequirementsGathering() {
  const router = useRouter(); // Initialize useRouter
  // REMOVE: const searchParams = useSearchParams(); // No longer needed for core project data

  // --- START MODIFICATION ---
  // Initialize state variables for project details
  const [projectName, setProjectName] = useState<string>("");
  const [projectDescription, setProjectDescription] = useState<string>("");
  const [applications, setApplications] = useState<string[]>([]);
  // --- END MODIFICATION ---

  // Set a temporary default user for `createdBy`
  const [createdBy] = useState("defaultUser");
  const [suggestedRequirements, setSuggestedRequirements] = useState<string[]>([]);
  const [editableRequirements, setEditableRequirements] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false); // New state to track if initial data is loaded


  // --- START MODIFICATION ---
  // useEffect to read from sessionStorage when the component mounts
  useEffect(() => {
    if (typeof window !== "undefined" && !initialDataLoaded) { // Only run if on client and data not loaded yet
      const storedDetails = sessionStorage.getItem("newProjectDetails");
      if (storedDetails) {
        try {
          const parsedDetails = JSON.parse(storedDetails);
          setProjectName(parsedDetails.projectName || "");
          setProjectDescription(parsedDetails.projectDescription || "");
          // Ensure applications is always an array, even if null/undefined/empty string from storage
          setApplications(Array.isArray(parsedDetails.applications) ? parsedDetails.applications : []);
          sessionStorage.removeItem("newProjectDetails"); // Clear after reading
          setInitialDataLoaded(true); // Mark data as loaded
        } catch (e) {
          console.error("Failed to parse project details from sessionStorage:", e);
          setError("Failed to load project details. Please start a new project.");
          router.push('/'); // Redirect if data is corrupted
        }
      } else {
        // If no details in sessionStorage, redirect to project creation or show error
        setError("Project details not found. Please start a new project from the dashboard.");
        router.push('/new-project/requirements'); // Redirect to a page where project can be created
      }
    }
  }, [initialDataLoaded, router]); // Dependency on initialDataLoaded and router for correct redirecting
  // --- END MODIFICATION ---


  // Function to generate suggested modules based on the generated content
  const generateSuggestedModules = useCallback(async (generatedRequirements: string) => {
    try {
      const response = await fetch("/api/requirements/suggest-modules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requirements: generatedRequirements }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch suggested modules");
      }

      const data = await response.json();
      const modules = data.suggestedModules || [];

      setSuggestedRequirements(modules);
    } catch (error: any) {
      setError("Failed to fetch suggested modules: " + (error.message || "Unknown error"));
      console.error("Error fetching suggested modules:", error);
    }
  }, []);

  // Function to generate the initial requirements using the first API call
  const generateRequirements = useCallback(async () => {
    // Validation now uses the state variables, which are populated from sessionStorage
    if (!projectName || !projectDescription || applications.length === 0) { // Removed !applications as it's always an array now
      setError("Missing project details (Project Name, Description, or Application Types). Please go back and fill them.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/requirements/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName,
          projectDescription,
          applications, // This is now guaranteed to be an actual array
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate requirements");
      }

      const data = await response.json();
      let processedRequirements = data.generatedRequirements;
      setEditableRequirements(processedRequirements);

      await generateSuggestedModules(processedRequirements);
    } catch (error: any) {
      setError(error.message);
      console.error("Error generating requirements:", error);
    } finally {
      setLoading(false);
    }
  }, [projectName, projectDescription, applications, generateSuggestedModules]);


  // Effect to trigger requirements generation once data is loaded and not already generated
  useEffect(() => {
    // Only call generateRequirements if initial data is loaded, and requirements haven't been generated yet
    if (initialDataLoaded && projectName && projectDescription && applications.length > 0 && !editableRequirements && !loading) {
      generateRequirements();
    }
  }, [initialDataLoaded, projectName, projectDescription, applications, editableRequirements, loading, generateRequirements]);


  const handleModuleClick = useCallback(async (moduleDescription: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/requirements/insert-module", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requirements: editableRequirements,
          moduleName: moduleDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to insert module");
      }

      const data = await response.json();
      setEditableRequirements(data.updatedRequirements);

      setSuggestedRequirements((prev) =>
        prev.filter((item) => item !== moduleDescription)
      );

    } catch (error: any) {
      setError("Failed to insert the module: " + (error.message || "Unknown error"));
      console.error("Error inserting module:", error);
    } finally {
      setLoading(false);
    }
  }, [editableRequirements, suggestedRequirements]); // Dependencies for useCallback


  // Function to save the project and then move to the next page
  const handleSaveAndNext = async () => {
    setIsSaving(true);
    setLoading(true);
    setError(null);

    console.log("Attempting to save project with details:");
    console.log("Project Name:", projectName);
    console.log("Project Description:", projectDescription);
    console.log("Application Types:", applications); // Log to confirm it's an array
    console.log("Created By:", createdBy);
    console.log("Generated Requirements:", editableRequirements);
    console.log("Modules:", suggestedRequirements);

    try {
      if (!projectName || !projectDescription || !editableRequirements || applications.length === 0) {
        throw new Error("Project name, description, application types, or requirements are missing. Cannot save.");
      }

      // Make the API call to save the project
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName,
          projectDescription,
          // --- ADD applicationTypes HERE ---
          applicationTypes: applications, // Now correctly send the array
          // --- END ADDITION ---
          createdBy,
          generatedRequirements: editableRequirements,
          modules: suggestedRequirements,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Project saved successfully:", data);

      const projectId = data.project?._id;
      if (!projectId) {
        throw new Error("Project ID not received after saving. Backend response missing _id.");
      }
      console.log("Extracted Project ID for next step:", projectId);

      window.location.href = `/test-folder?projectId=${projectId}`;

    } catch (error: any) {
      setError(error.message || "Failed to save the project. Please check console for details.");
      console.error("Error during handleSaveAndNext:", error);
    } finally {
      setLoading(false);
      setIsSaving(false);
    }
  };

  if (!initialDataLoaded && !error) {
    // Show a loading indicator or a message while data is being loaded from sessionStorage
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader />
        <p className="ml-4">Loading project details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="flex">
        <Sidebar isCollapsed={false} />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Project Requirements</h1>

          {loading && (
            <div className="absolute inset-0 bg-gray-800 opacity-50 z-10 flex justify-center items-center">
              <Loader />
            </div>
          )}

          {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

          <div className="flex space-x-8">
            <Card className="w-1/3">
              <CardHeader>
                <CardTitle>Suggested Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {suggestedRequirements.length > 0 && !loading ? (
                  <div className="space-y-2">
                    {suggestedRequirements.slice(0, 5)
                      .map((req, index) => (
                        <div
                          key={index}
                          className="p-4 border rounded-md shadow-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                          onClick={async () => {
                            await handleModuleClick(req);
                          }}
                        >
                          <p>{req}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">{loading ? "Generating suggestions..." : "No suggestions available."}</p>
                )}
              </CardContent>
            </Card>

            <Card className="w-2/3">
              <CardHeader>
                <CardTitle>Project Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={editableRequirements}
                  onChange={(e) => setEditableRequirements(e.target.value)}
                  rows={10}
                  placeholder="Generated requirements will appear here..."
                  readOnly={loading}
                  className="min-h-[200px]"
                />
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleSaveAndNext}
              disabled={isSaving || loading || !projectName || !projectDescription || !editableRequirements || applications.length === 0}
              className="px-8 py-2 text-lg"
            >
              {isSaving ? "Saving Project..." : "Next"}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}