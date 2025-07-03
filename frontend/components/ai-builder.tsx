"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, LineChart, PieChart } from "lucide-react"

interface AIBuilderProps {
  addConsoleOutput: (message: string) => void
}

export function AIBuilder({ addConsoleOutput }: AIBuilderProps) {
  const [dataset, setDataset] = useState("")
  const [algorithm, setAlgorithm] = useState("")
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [testingResults, setTestingResults] = useState("")
  const [selectedVisualization, setSelectedVisualization] = useState("bar")

  const handleDataUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real application, you would process the file here
      setDataset(file.name)
      addConsoleOutput(`Uploaded dataset: ${file.name}`)
    }
  }

  const handleAlgorithmSelect = (value: string) => {
    setAlgorithm(value)
    addConsoleOutput(`Selected algorithm: ${value}`)
  }

  const handleTrain = () => {
    // Simulating training process
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setTrainingProgress(progress)
      addConsoleOutput(`Training progress: ${progress}%`)
      if (progress >= 100) {
        clearInterval(interval)
        addConsoleOutput("Training completed")
      }
    }, 500)
  }

  const handleTest = () => {
    // Simulating testing process
    const results = "Accuracy: 85%, Precision: 0.82, Recall: 0.79"
    setTestingResults(results)
    addConsoleOutput(`Testing results: ${results}`)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Builder</CardTitle>
        <CardDescription>Upload data, train models, and visualize results</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="data">
          <TabsList>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="model">Model</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          <TabsContent value="data">
            <div className="space-y-4">
              <div>
                <Label htmlFor="dataset">Upload Dataset</Label>
                <Input id="dataset" type="file" onChange={handleDataUpload} />
              </div>
              <div>
                <Label htmlFor="data-preview">Data Preview</Label>
                <Textarea
                  id="data-preview"
                  placeholder="Data preview will appear here"
                  value={dataset ? `Uploaded: ${dataset}` : ""}
                  readOnly
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="model">
            <div className="space-y-4">
              <div>
                <Label htmlFor="algorithm">Select Algorithm</Label>
                <Select onValueChange={handleAlgorithmSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear-regression">Linear Regression</SelectItem>
                    <SelectItem value="logistic-regression">Logistic Regression</SelectItem>
                    <SelectItem value="decision-tree">Decision Tree</SelectItem>
                    <SelectItem value="random-forest">Random Forest</SelectItem>
                    <SelectItem value="svm">Support Vector Machine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Training Progress</Label>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${trainingProgress}%` }}></div>
                </div>
              </div>
              <Button onClick={handleTrain}>Train Model</Button>
            </div>
          </TabsContent>
          <TabsContent value="results">
            <div className="space-y-4">
              <div>
                <Label>Testing Results</Label>
                <Textarea value={testingResults} readOnly />
              </div>
              <Button onClick={handleTest}>Run Tests</Button>
              <div>
                <Label>Visualization</Label>
                <div className="flex space-x-2 mt-2">
                  <Button
                    variant={selectedVisualization === "bar" ? "default" : "outline"}
                    onClick={() => setSelectedVisualization("bar")}
                  >
                    <BarChart className="h-4 w-4 mr-2" />
                    Bar Chart
                  </Button>
                  <Button
                    variant={selectedVisualization === "line" ? "default" : "outline"}
                    onClick={() => setSelectedVisualization("line")}
                  >
                    <LineChart className="h-4 w-4 mr-2" />
                    Line Chart
                  </Button>
                  <Button
                    variant={selectedVisualization === "pie" ? "default" : "outline"}
                    onClick={() => setSelectedVisualization("pie")}
                  >
                    <PieChart className="h-4 w-4 mr-2" />
                    Pie Chart
                  </Button>
                </div>
                <div className="mt-4 border rounded p-4 h-64 flex items-center justify-center">
                  {selectedVisualization === "bar" && <BarChart className="h-full w-full" />}
                  {selectedVisualization === "line" && <LineChart className="h-full w-full" />}
                  {selectedVisualization === "pie" && <PieChart className="h-full w-full" />}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
