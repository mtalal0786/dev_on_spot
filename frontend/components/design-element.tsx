"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useDrag } from "react-dnd"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DesignElementProps {
  element: {
    id: string
    type: string
    content: string
    position: { x: number; y: number }
    size: { width: number; height: number }
    properties: Record<string, any>
    visible: boolean
    locked: boolean
  }
  onSelect: () => void
  onMove: (id: string, newPosition: { x: number; y: number }) => void
  onResize: (id: string, newSize: { width: number; height: number }) => void
  onRightClick: (event: React.MouseEvent) => void
}

export function DesignElement({ element, onSelect, onMove, onResize, onRightClick }: DesignElementProps) {
  const [, drag] = useDrag(() => ({
    type: "canvas-element",
    item: element,
  }))

  const [isResizing, setIsResizing] = useState(false)
  const resizeStartPos = useRef({ x: 0, y: 0 })
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (elementRef.current === document.activeElement) {
        const newPosition = { ...element.position }
        const newSize = { ...element.size }

        switch (e.key) {
          case "ArrowLeft":
            newPosition.x -= e.shiftKey ? 10 : 1
            break
          case "ArrowRight":
            newPosition.x += e.shiftKey ? 10 : 1
            break
          case "ArrowUp":
            newPosition.y -= e.shiftKey ? 10 : 1
            break
          case "ArrowDown":
            newPosition.y += e.shiftKey ? 10 : 1
            break
        }

        if (e.altKey) {
          switch (e.key) {
            case "ArrowLeft":
              newSize.width -= e.shiftKey ? 10 : 1
              break
            case "ArrowRight":
              newSize.width += e.shiftKey ? 10 : 1
              break
            case "ArrowUp":
              newSize.height -= e.shiftKey ? 10 : 1
              break
            case "ArrowDown":
              newSize.height += e.shiftKey ? 10 : 1
              break
          }
          onResize(element.id, newSize)
        } else {
          onMove(element.id, newPosition)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [element, onMove, onResize])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsResizing(true)
      resizeStartPos.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isResizing) {
      const dx = e.clientX - resizeStartPos.current.x
      const dy = e.clientY - resizeStartPos.current.y
      onResize(element.id, {
        width: element.size.width + dx,
        height: element.size.height + dy,
      })
      resizeStartPos.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handleMouseUp = () => {
    setIsResizing(false)
  }

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove as any)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove as any)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing])

  const renderElement = () => {
    switch (element.type) {
      case "text":
        return <p>{element.properties.content}</p>
      case "button":
        return <Button>{element.properties.text}</Button>
      case "input":
        return <Input placeholder={element.properties.placeholder} />
      case "textarea":
        return <Textarea placeholder={element.properties.placeholder} />
      case "form":
        return (
          <form className="space-y-4">
            <Input placeholder="Name" />
            <Input placeholder="Email" type="email" />
            <Button type="submit">Submit</Button>
          </form>
        )
      case "table":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>John Doe</TableCell>
                <TableCell>john@example.com</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Jane Smith</TableCell>
                <TableCell>jane@example.com</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )
      case "chart":
        return <div className="w-full h-full bg-gray-200 flex items-center justify-center">Chart Placeholder</div>
      case "image":
        return <img src="/placeholder.svg" alt="Placeholder" className="w-full h-full object-cover" />
      case "video":
        return (
          <video controls className="w-full h-full">
            <source src="/placeholder-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )
      case "link":
        return (
          <a href="#" className="text-blue-500 hover:underline">
            Example Link
          </a>
        )
      case "list":
        return (
          <ul className="list-disc list-inside">
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        )
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <label htmlFor="terms">Accept terms and conditions</label>
          </div>
        )
      case "radio":
        return (
          <RadioGroup defaultValue="option-one">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-one" id="option-one" />
              <label htmlFor="option-one">Option One</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-two" id="option-two" />
              <label htmlFor="option-two">Option Two</label>
            </div>
          </RadioGroup>
        )
      case "toggle":
        return (
          <div className="flex items-center space-x-2">
            <Switch id="airplane-mode" />
            <label htmlFor="airplane-mode">Airplane Mode</label>
          </div>
        )
      case "datepicker":
        return <Calendar />
      case "slider":
        return <Slider defaultValue={[50]} max={100} step={1} />
      case "map":
        return <div className="w-full h-full bg-gray-200 flex items-center justify-center">Map Placeholder</div>
      case "comment":
        return (
          <div className="bg-gray-100 p-4 rounded">
            <p className="font-bold">User</p>
            <p>This is a comment.</p>
          </div>
        )
      case "share":
        return <Button>Share</Button>
      case "search":
        return (
          <div className="relative">
            <Input placeholder="Search..." />
            <Button className="absolute right-0 top-0">Search</Button>
          </div>
        )
      case "navbar":
        return (
          <nav className="bg-gray-800 text-white p-4">
            <ul className="flex space-x-4">
              <li>
                <a href="#" className="hover:underline">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        )
      case "alert":
        return (
          <AlertDialog>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Alert Title</AlertDialogTitle>
                <AlertDialogDescription>This is an example alert message.</AlertDialogDescription>
              </AlertDialogHeader>
            </AlertDialogContent>
          </AlertDialog>
        )
      case "progress":
        return <Progress value={33} />
      case "tooltip":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>Hover me</TooltipTrigger>
              <TooltipContent>
                <p>This is a tooltip</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      default:
        return null
    }
  }

  if (!element.visible) {
    return null
  }

  return (
    <div
      ref={(node) => {
        drag(node)
        elementRef.current = node
      }}
      className="absolute bg-white border rounded shadow-sm p-2 cursor-move"
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        pointerEvents: element.locked ? "none" : "auto",
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onMouseDown={handleMouseDown}
      onContextMenu={onRightClick}
      tabIndex={0}
    >
      {renderElement()}
      <div className="absolute bottom-0 right-0 w-4 h-4 bg-gray-400 cursor-se-resize" onMouseDown={handleMouseDown} />
    </div>
  )
}
