"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Eraser, Square, CircleIcon, Type, Users, Save, Undo, Redo } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

type Tool = "pencil" | "eraser" | "rectangle" | "circle" | "text" | "select"

interface Shape {
  id: string
  type: Tool
  startX: number
  startY: number
  endX: number
  endY: number
  color: string
  text?: string
}

export function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<Tool>("pencil")
  const [color, setColor] = useState("#000000")
  const [shapes, setShapes] = useState<Shape[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentShape, setCurrentShape] = useState<Shape | null>(null)
  const [history, setHistory] = useState<Shape[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [textInput, setTextInput] = useState("")

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight - 100 // Adjust for the toolbar height
    }
  }, [])

  useEffect(() => {
    drawShapes()
  }, [shapes])

  const drawShapes = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    shapes.forEach((shape) => {
      ctx.strokeStyle = shape.color
      ctx.fillStyle = shape.color
      ctx.lineWidth = tool === "eraser" ? 20 : 2

      switch (shape.type) {
        case "pencil":
        case "eraser":
          ctx.beginPath()
          ctx.moveTo(shape.startX, shape.startY)
          ctx.lineTo(shape.endX, shape.endY)
          ctx.stroke()
          break
        case "rectangle":
          ctx.strokeRect(shape.startX, shape.startY, shape.endX - shape.startX, shape.endY - shape.startY)
          break
        case "circle":
          ctx.beginPath()
          const radius = Math.sqrt(Math.pow(shape.endX - shape.startX, 2) + Math.pow(shape.endY - shape.startY, 2))
          ctx.arc(shape.startX, shape.startY, radius, 0, 2 * Math.PI)
          ctx.stroke()
          break
        case "text":
          ctx.font = "16px Arial"
          ctx.fillText(shape.text || "", shape.startX, shape.startY)
          break
      }
    })
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = e.nativeEvent
    setIsDrawing(true)

    const newShape: Shape = {
      id: uuidv4(),
      type: tool,
      startX: offsetX,
      startY: offsetY,
      endX: offsetX,
      endY: offsetY,
      color: color,
    }

    setCurrentShape(newShape)

    if (tool === "text") {
      const text = prompt("Enter text:", textInput)
      if (text) {
        newShape.text = text
        setShapes([...shapes, newShape])
        addToHistory([...shapes, newShape])
      }
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentShape) return

    const { offsetX, offsetY } = e.nativeEvent

    setCurrentShape({
      ...currentShape,
      endX: offsetX,
      endY: offsetY,
    })

    if (tool === "pencil" || tool === "eraser") {
      setShapes([...shapes, { ...currentShape, endX: offsetX, endY: offsetY }])
    }
  }

  const endDrawing = () => {
    if (!isDrawing || !currentShape) return

    setIsDrawing(false)

    if (tool !== "pencil" && tool !== "eraser" && tool !== "text") {
      setShapes([...shapes, currentShape])
      addToHistory([...shapes, currentShape])
    } else if (tool === "pencil" || tool === "eraser") {
      addToHistory(shapes)
    }

    setCurrentShape(null)
  }

  const addToHistory = (newShapes: Shape[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newShapes)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setShapes(history[historyIndex - 1])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setShapes(history[historyIndex + 1])
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex space-x-2">
          <Button variant={tool === "pencil" ? "default" : "outline"} size="sm" onClick={() => setTool("pencil")}>
            <Pencil className="h-4 w-4 mr-2" />
            Pencil
          </Button>
          <Button variant={tool === "eraser" ? "default" : "outline"} size="sm" onClick={() => setTool("eraser")}>
            <Eraser className="h-4 w-4 mr-2" />
            Eraser
          </Button>
          <Button variant={tool === "rectangle" ? "default" : "outline"} size="sm" onClick={() => setTool("rectangle")}>
            <Square className="h-4 w-4 mr-2" />
            Rectangle
          </Button>
          <Button variant={tool === "circle" ? "default" : "outline"} size="sm" onClick={() => setTool("circle")}>
            <CircleIcon className="h-4 w-4 mr-2" />
            Circle
          </Button>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-32"
            />
            <Button variant={tool === "text" ? "default" : "outline"} size="sm" onClick={() => setTool("text")}>
              <Type className="h-4 w-4 mr-2" />
              Text
            </Button>
          </div>
          <Input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-8 p-0 border-none"
          />
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
            <Undo className="h-4 w-4 mr-2" />
            Undo
          </Button>
          <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
            <Redo className="h-4 w-4 mr-2" />
            Redo
          </Button>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>5 collaborators</span>
          </div>
          <Button size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      <div className="flex-grow">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseOut={endDrawing}
          className="w-full h-full"
        />
      </div>
    </div>
  )
}
