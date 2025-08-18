import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Get the request body
    const { requirements } = await req.json();

    // Check if the required body parameter is present
    if (!requirements) {
      return NextResponse.json({ error: 'No requirements provided' }, { status: 400 });
    }

    // Forward the request to the backend API
    const response = await fetch('http://localhost:5000/api/requirements/suggest-modules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requirements }), // Pass the requirements to the backend API
    });

    // Log the response status and body for debugging
    console.log('Backend response status:', response.status);
    
    // Check if the response from the backend is OK
    if (!response.ok) {
      const responseBody = await response.text(); // Get the full response text
      console.error('Backend response body:', responseBody); // Log the body of the response
      return NextResponse.json({ error: 'Failed to fetch suggested modules' }, { status: 500 });
    }

    // Get the JSON data from the backend response
    const data = await response.json();

    // Log the data returned from the backend for debugging
    console.log('Data from backend:', data);

    // Ensure that the 'suggestedModules' field exists in the response data
    if (!data.suggestedModules || !Array.isArray(data.suggestedModules)) {
      console.error('Invalid response from the backend, missing "suggestedModules" field:', data);
      return NextResponse.json({ error: 'Invalid response from the backend' }, { status: 500 });
    }

    // Process the response to clean and filter the modules
    const suggestedModules = data.suggestedModules
      .map((module: string) => module.trim())
      .filter((module: string) => module && module !== '' && !module.includes("json"));

    // Check if the suggestedModules array is empty or not
    if (suggestedModules.length === 0) {
      console.error('No suggested modules found after processing:', data);
      return NextResponse.json({ error: 'No suggested modules found' }, { status: 500 });
    }

    // Return the first 15 suggested modules
    return NextResponse.json({ suggestedModules: suggestedModules.slice(0, 15) });

  } catch (error) {
    console.error('Error in proxying the request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
