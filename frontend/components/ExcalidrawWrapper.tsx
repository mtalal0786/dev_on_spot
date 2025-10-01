"use client";

import { Excalidraw, convertToExcalidrawElements } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

export default function ExcalidrawWrapper() {
  // Example: Use a utility to convert shapes
  console.log(
    convertToExcalidrawElements([
      {
        type: "rectangle",
        id: "rect-1",
        width: 200,
        height: 150,
        x: 100,
        y: 100,
      },
    ])
  );

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <Excalidraw />
    </div>
  );
}