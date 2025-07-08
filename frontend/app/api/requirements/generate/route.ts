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
    const response = await fetch('http://localhost:5000/api/requirements/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requirements }), // Pass the requirements to the backend API
    });

    // Check if the response from the backend is OK
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to generate requirements' }, { status: 500 });
    }

    // Get the JSON data from the backend response
    const data = await response.json();

    // Return the generated requirements as a response
    return NextResponse.json({ generatedRequirements: data.generatedRequirements });

  } catch (error) {
    console.error('Error in proxying the request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
