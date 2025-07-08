import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Get the request body
    const { requirements, moduleName } = await req.json();

    // Check if the required body parameters are present
    if (!requirements || !moduleName) {
      return NextResponse.json({ error: 'No requirements or module name provided' }, { status: 400 });
    }

    // Forward the request to the backend API
    const response = await fetch('http://localhost:5000/api/requirements/insert-module', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requirements, moduleName }), // Pass the requirements and module name to the backend API
    });

    // Check if the response from the backend is OK
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to insert module into requirements' }, { status: 500 });
    }

    // Get the JSON data from the backend response
    const data = await response.json();

    // Return the updated requirements as a response
    return NextResponse.json({ updatedRequirements: data.updatedRequirements });

  } catch (error) {
    console.error('Error in proxying the request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
