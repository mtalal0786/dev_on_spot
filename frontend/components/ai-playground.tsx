"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Upload, Download, Settings } from "lucide-react"

interface AIPlaygroundProps {
  type: "text" | "image" | "code" | "audio" | "video"
}

export function AIPlayground({ type }: AIPlaygroundProps) {
  const [input, setInput] = useState("")
  const [temperature, setTemperature] = useState([0.7])

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Playground</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Model</Label>
              <Select defaultValue="gpt4">
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt4">GPT-4</SelectItem>
                  <SelectItem value="gpt35">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude">Claude 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === "text" && (
              <>
                <div className="space-y-2">
                  <Label>Temperature</Label>
                  <Slider
                    value={temperature}
                    onValueChange={setTemperature}
                    max={1}
                    step={0.1}
                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Precise</span>
                    <span>Balanced</span>
                    <span>Creative</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Input</Label>
                  <Textarea
                    placeholder="Enter your prompt..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="h-[200px]"
                  />
                </div>
              </>
            )}

            {(type === "image" || type === "video") && (
              <div className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label>Prompt</Label>
                  <Input type="text" placeholder="Describe what you want to create..." />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label>Upload Reference</Label>
                  <Input type="file" />
                </div>
              </div>
            )}

            {type === "audio" && (
              <div className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label>Audio File</Label>
                  <Input type="file" accept="audio/*" />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label>Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button className="flex-1">
                <Play className="mr-2 h-4 w-4" />
                Run
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Tabs defaultValue="output">
              <TabsList>
                <TabsTrigger value="output">Output</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="output">
                <Card>
                  <CardContent className="p-4 min-h-[300px] bg-muted/50">
                    <p className="text-sm text-muted-foreground">Output will appear here...</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="history">
                <Card>
                  <CardContent className="p-4 min-h-[300px]">
                    <p className="text-sm text-muted-foreground">No history yet</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
