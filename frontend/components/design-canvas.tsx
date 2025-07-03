"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { useDrop } from "react-dnd"
import { nanoid } from "nanoid"
import { DesignElement } from "./design-element"
import { ElementContextMenu } from "./element-context-menu"

interface CanvasElement {
  id: string
  type: string
  content: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  properties: Record<string, any>
  visible: boolean
  locked: boolean
  children?: CanvasElement[]
}

interface DesignCanvasProps {
  onSelectElement: (element: CanvasElement | null) => void
  viewportSize: string
  addConsoleOutput: (message: string) => void
}

const viewportSizes = {
  mobile: { width: 320, height: 568 },
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1280, height: 800 },
  desktop: { width: 1920, height: 1080 },
}

const GRID_SIZE = 10

export function DesignCanvas({ onSelectElement, viewportSize, addConsoleOutput }: DesignCanvasProps) {
  const [elements, setElements] = useState<CanvasElement[]>([])
  const [scale, setScale] = useState(1)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; element: CanvasElement } | null>(null)

  const snapToGrid = (x: number, y: number) => {
    const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE
    const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE
    return { x: snappedX, y: snappedY }
  }

  const [, drop] = useDrop(() => ({
    accept: "element",
    drop: (item: { type: string }, monitor) => {
      const offset = monitor.getClientOffset()
      const canvasRect = canvasRef.current?.getBoundingClientRect()
      if (offset && canvasRect) {
        const x = (offset.x - canvasRect.left) / scale
        const y = (offset.y - canvasRect.top) / scale
        const snappedPosition = snapToGrid(x, y)
        const newElement: CanvasElement = {
          id: nanoid(),
          type: item.type,
          content: "New Element",
          position: snappedPosition,
          size: getDefaultSize(item.type),
          properties: getDefaultProperties(item.type),
          visible: true,
          locked: false,
        }
        setElements((prev) => [...prev, newElement])
        addConsoleOutput(`Added new ${item.type} element to canvas`)
      }
    },
  }))

  const getDefaultSize = (type: string) => {
    switch (type) {
      case "button":
      case "input":
      case "search":
        return { width: 200, height: 40 }
      case "textarea":
        return { width: 200, height: 100 }
      case "form":
      case "table":
      case "chart":
      case "map":
        return { width: 400, height: 300 }
      case "image":
      case "video":
        return { width: 320, height: 240 }
      case "navbar":
        return { width: 600, height: 60 }
      default:
        return { width: 200, height: 100 }
    }
  }

  const getDefaultProperties = (type: string) => {
    switch (type) {
      case "text":
        return { content: "New Text" }
      case "button":
        return { text: "Button" }
      case "input":
      case "textarea":
        return { placeholder: "Enter text..." }
      case "image":
        return { src: "/placeholder.svg", alt: "Placeholder" }
      case "video":
        return { src: "/placeholder-video.mp4" }
      case "link":
        return { href: "#", text: "Link" }
      case "checkbox":
      case "radio":
      case "toggle":
        return { label: "Option" }
      case "slider":
        return { min: 0, max: 100, value: 50 }
      case "progress":
        return { value: 0 }
      case "tooltip":
        return { content: "Tooltip content" }
      default:
        return {}
    }
  }

  const handleElementMove = useCallback((id: string, newPosition: { x: number; y: number }) => {
    const snappedPosition = snapToGrid(newPosition.x, newPosition.y)
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, position: snappedPosition } : el)))
  }, [])

  const handleElementResize = useCallback((id: string, newSize: { width: number; height: number }) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, size: newSize } : el)))
  }, [])

  const handleElementRightClick = useCallback((event: React.MouseEvent, element: CanvasElement) => {
    event.preventDefault()
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      element,
    })
  }, [])

  const handleUpdateElement = useCallback(
    (updatedElement: CanvasElement) => {
      setElements((prev) => prev.map((el) => (el.id === updatedElement.id ? updatedElement : el)))
      addConsoleOutput(`Updated element: ${updatedElement.content}`)
    },
    [addConsoleOutput],
  )

  return (
    <div className="flex-grow overflow-auto bg-gray-100 relative" ref={drop}>
      <div
        ref={canvasRef}
        className="relative mx-auto my-4 bg-white shadow-md overflow-hidden"
        style={{
          width: viewportSizes[viewportSize].width,
          height: viewportSizes[viewportSize].height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
        onClick={() => onSelectElement(null)}
      >
        {elements.map((element) => (
          <DesignElement
            key={element.id}
            element={element}
            onSelect={() => onSelectElement(element)}
            onMove={handleElementMove}
            onResize={handleElementResize}
            onRightClick={(event) => handleElementRightClick(event, element)}
          />
        ))}
      </div>
      {contextMenu && (
        <ElementContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          element={contextMenu.element}
          onClose={() => setContextMenu(null)}
          onUpdateElement={handleUpdateElement}
        />
      )}
    </div>
  )
}
