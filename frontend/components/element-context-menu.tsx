"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ElementContextMenuProps {
  x: number
  y: number
  element: any
  onClose: () => void
  onUpdateElement: (updatedElement: any) => void
}

export function ElementContextMenu({ x, y, element, onClose, onUpdateElement }: ElementContextMenuProps) {
  const [name, setName] = useState(element.content)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const handleSave = () => {
    onUpdateElement({ ...element, content: name })
    onClose()
  }

  return (
    <div ref={menuRef} className="absolute bg-white border rounded shadow-lg p-4 z-50" style={{ left: x, top: y }}>
      <h3 className="text-lg font-semibold mb-2">Element Options</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="element-name">Name</Label>
          <Input id="element-name" value={name} onChange={handleNameChange} className="mt-1" />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  )
}
