"use client";

import { useState, useEffect, useCallback } from "react"; // Added useCallback
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/ui/loader"; // Import loader component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Card components
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";

// Requirement interface for suggested requirements (not strictly needed for this file, but good for context)
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

  // Set a temporary default user for `createdBy`
  const [createdBy] = useState("defaultUser"); // Temporary value, to be replaced later
  const [suggestedRequirements, setSuggestedRequirements] = useState<string[]>([]);
  const [editableRequirements, setEditableRequirements] = useState<string>("");
  const [loading, setLoading] = useState(false); // To manage loading state for AI calls
  const [error, setError] = useState<string | null>(null); // To handle errors
  const [isSaving, setIsSaving] = useState(false); // To track if the project is being saved specifically

  // Function to generate suggested modules based on the generated content
  const generateSuggestedModules = useCallback(async (generatedRequirements: string) => { // Wrapped in useCallback
    try {
      const response = await fetch("/api/requirements/suggest-modules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requirements: generatedRequirements }), // Send the generated requirements to the backend
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
  }, []); // No dependencies as it uses arguments
// Function to generate the initial requirements using the first API call
const generateRequirements = useCallback(async () => {
  if (!projectName || !projectDescription || !applications || applications.length === 0) {
    setError("Missing project details (Project Name, Description, or Application Types). Please go back and fill them.");
    setLoading(false); // Ensure loading is false if validation fails
    return;
  }

  setLoading(true);
  setError(null); // Reset any previous error

  // --- START MODIFICATION ---
  // No need to construct promptText here anymore, as the backend will do it.
  // We send the raw data the backend expects.

  try {
    const response = await fetch("/api/requirements/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Send projectName, projectDescription, and applications directly
      body: JSON.stringify({
        projectName,
        projectDescription,
        applications,
      }),
    });
  // --- END MODIFICATION ---

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate requirements"); // Ensure 'error' matches backend's error field
    }

    const data = await response.json();
    let processedRequirements = data.generatedRequirements;

    // --- REMOVED / MODIFIED SECTION ---
    // The previous line was trying to replace parts of the generated text.
    // It's generally better for the backend (Gemini prompt) to format the output
    // correctly from the start, or for the frontend to parse structured output.
    // For now, we'll assign directly. If you still want specific bolding or
    // formatting, consider doing it with a more robust parsing approach (e.g., Markdown renderer)
    // or adjust the backend prompt to include it in its generation.
    // processedRequirements = processedRequirements.replace(
    //   "System Requirements Specification (SRS) for",
    //   `**${projectName}**`
    // );
    // --- END REMOVED / MODIFIED SECTION ---

    setEditableRequirements(processedRequirements); // Populate the textarea

    // Once the first API call is done, call for suggested modules
    await generateSuggestedModules(processedRequirements);

  } catch (error: any) {
    setError(error.message); // Set the error message
    console.error("Error generating requirements:", error);
  } finally {
    setLoading(false); // Stop the loading spinner
  }
}, [projectName, projectDescription, applications, generateSuggestedModules]); // Dependencies for useCallback


  useEffect(() => {
    // Only call generateRequirements if it hasn't been generated yet and all necessary params are present
    if (projectName && projectDescription && applications && !loading && !editableRequirements) {
      generateRequirements();
    }
  }, [projectName, projectDescription, applications, editableRequirements, loading, generateRequirements]); // Added generateRequirements to dependency array

  const handleModuleClick = useCallback(async (moduleDescription: string) => { // Wrapped in useCallback
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to insert module");
      }

      const data = await response.json();
      setEditableRequirements(data.updatedRequirements); // Overwrite with the new, detailed requirements

      // Remove the clicked module from the list
      setSuggestedRequirements((prev) =>
        prev.filter((item) => item !== moduleDescription)
      );

      // Add a new module to the list from the remaining ones (if any)
      // This logic might need refinement based on how you want new suggestions to appear
      // For now, it re-adds the last item if the list isn't empty after filtering.
      if (suggestedRequirements.length > 0 && suggestedRequirements.some(item => item === moduleDescription)) {
        // This condition prevents re-adding if the module was already removed
        // or ensures a fresh suggestion if needed. For now, keeping original logic.
      }


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
    setLoading(true); // Keep general loader active as well
    setError(null); // Clear previous errors

    console.log("Attempting to save project with details:");
    console.log("Project Name:", projectName);
    console.log("Project Description:", projectDescription);
    console.log("Created By:", createdBy);
    console.log("Generated Requirements:", editableRequirements);
    console.log("Modules:", suggestedRequirements);

    try {
      // Validate essential data before sending
      if (!projectName || !projectDescription || !editableRequirements) {
        throw new Error("Project name, description, or requirements are missing. Cannot save.");
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

      // Extract the _id from the saved project data
      const projectId = data.project?._id; // Use optional chaining for safety
      if (!projectId) {
        throw new Error("Project ID not received after saving. Backend response missing _id.");
      }
      console.log("Extracted Project ID for next step:", projectId);

      // Redirect to the code editor page with the projectId
      // Note: Using window.location.href forces a full page reload, which can sometimes
      // be less smooth than Next.js's useRouter.push().
      // However, for entirely different "pages" and to ensure Sandpack re-initializes
      // cleanly, it might be acceptable. If issues, consider useRouter.push().
      window.location.href = `/test-folder?projectId=${projectId}`;

    } catch (error: any) {
      setError(error.message || "Failed to save the project. Please check console for details.");
      console.error("Error during handleSaveAndNext:", error);
      // Optional: alert user directly if needed, but error state will display
    } finally {
      setLoading(false); // Stop general loading
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
                {suggestedRequirements.length > 0 && !loading ? ( // Show only if not loading and suggestions exist
                  <div className="space-y-2">
                    {suggestedRequirements.slice(0, 5) // Show only 5 initially
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

            {/* Editable Requirements Card */}
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
                  readOnly={loading} // Disable textarea while AI is working
                  className="min-h-[200px]" // Ensure sufficient height
                />
              </CardContent>
            </Card>
          </div>

          {error && <div className="text-red-500 mt-4 text-center">{error}</div>}

          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleSaveAndNext}
              disabled={isSaving || loading || !projectName || !projectDescription || !editableRequirements} // Disable button if saving, loading, or essential data is missing
              className="px-8 py-2 text-lg" // Make button larger
            >
              {isSaving ? "Saving Project..." : "Next"}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}