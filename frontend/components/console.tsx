"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ConsoleProps {
  output: string[]
}

export function Console({ output }: ConsoleProps) {
  const [input, setInput] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [output])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      // TODO: Process console input
      console.log(`Console input: ${input}`)
      setInput("")
    }
  }

  return (
    <div className="h-64 border-t bg-gray-900 text-white p-2 flex flex-col">
      <ScrollArea className="flex-grow mb-2" ref={scrollAreaRef}>
        {output.map((log, index) => (
          <div key={index} className="mb-1">
            {log}
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter command..."
          className="bg-gray-800 text-white border-gray-700"
        />
        <Button type="submit">Run</Button>
      </form>
    </div>
  )
}
