"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PromptTool() {
  const [frontendPrompt, setFrontendPrompt] = useState("")
  const [backendPrompt, setBackendPrompt] = useState("")
  const [conversation, setConversation] = useState<
    { role: "user" | "ai"; content: string; type: "frontend" | "backend" }[]
  >([])

  const handleSubmit = (type: "frontend" | "backend") => {
    const prompt = type === "frontend" ? frontendPrompt : backendPrompt
    if (prompt.trim()) {
      setConversation([...conversation, { role: "user", content: prompt, type }])
      // Here you would typically send the prompt to your AI service and get a response
      // For this example, we'll just echo the prompt
      setTimeout(() => {
        setConversation((prev) => [...prev, { role: "ai", content: `Received ${type} prompt: ${prompt}`, type }])
      }, 500)
      if (type === "frontend") {
        setFrontendPrompt("")
      } else {
        setBackendPrompt("")
      }
    }
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-white border rounded-lg shadow-lg flex flex-col">
      <div className="p-4 border-b font-semibold">AI Designer Prompt</div>
      <Tabs defaultValue="frontend" className="flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="frontend">Frontend</TabsTrigger>
          <TabsTrigger value="backend">Backend</TabsTrigger>
        </TabsList>
        <TabsContent value="frontend" className="flex-grow flex flex-col">
          <ScrollArea className="flex-grow p-4">
            {conversation
              .filter((message) => message.type === "frontend")
              .map((message, index) => (
                <div key={index} className={`mb-4 ${message.role === "ai" ? "text-blue-600" : "text-gray-800"}`}>
                  <strong>{message.role === "ai" ? "AI: " : "You: "}</strong>
                  {message.content}
                </div>
              ))}
          </ScrollArea>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit("frontend")
            }}
            className="p-4 border-t"
          >
            <div className="flex space-x-2">
              <Textarea
                value={frontendPrompt}
                onChange={(e) => setFrontendPrompt(e.target.value)}
                placeholder="Enter your frontend design prompt..."
                className="flex-grow"
              />
              <Button type="submit" size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </TabsContent>
        <TabsContent value="backend" className="flex-grow flex flex-col">
          <ScrollArea className="flex-grow p-4">
            {conversation
              .filter((message) => message.type === "backend")
              .map((message, index) => (
                <div key={index} className={`mb-4 ${message.role === "ai" ? "text-blue-600" : "text-gray-800"}`}>
                  <strong>{message.role === "ai" ? "AI: " : "You: "}</strong>
                  {message.content}
                </div>
              ))}
          </ScrollArea>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit("backend")
            }}
            className="p-4 border-t"
          >
            <div className="flex space-x-2">
              <Textarea
                value={backendPrompt}
                onChange={(e) => setBackendPrompt(e.target.value)}
                placeholder="Enter your backend design prompt..."
                className="flex-grow"
              />
              <Button type="submit" size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
