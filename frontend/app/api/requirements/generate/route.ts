import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // --- START MODIFICATION ---
    // Get the request body, expecting the new fields
    const { projectName, projectDescription, applications } = await req.json();

    // Check if the required body parameters are present and valid
    if (!projectName || !projectDescription || !applications || !Array.isArray(applications) || applications.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid project details (projectName, projectDescription, applications).' },
        { status: 400 }
      );
    }

    // Forward the request to the backend API, passing the new fields
    const response = await fetch('http://localhost:5000/api/requirements/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Pass the new fields directly to the backend API
      body: JSON.stringify({
        projectName,
        projectDescription,
        applications,
      }),
    });
    // --- END MODIFICATION ---

    // Check if the response from the backend is OK
    if (!response.ok) {
      // Attempt to get a more specific error message from the backend if available
      const errorData = await response.json().catch(() => ({ error: 'Unknown error from backend' }));
      console.error('Backend error:', errorData); // Log backend error for debugging
      return NextResponse.json(
        { error: errorData.error || 'Failed to generate requirements from backend' },
        { status: response.status || 500 } // Use backend's status code if available
      );
    }

    // Get the JSON data from the backend response
    const data = await response.json();

    // Return the generated requirements as a response
    return NextResponse.json({ generatedRequirements: data.generatedRequirements });

  } catch (error) {
    console.error('Error in proxying the request:', error);
    return NextResponse.json({ error: 'Internal server error while processing request' }, { status: 500 });
  }
}