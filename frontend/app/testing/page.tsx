"use client"

import { useState } from "react"
import { TopNav } from "../../components/top-nav"
import { Sidebar } from "../../components/sidebar"
import { ThemeProvider } from "../../components/theme-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Play, CheckCircle, XCircle } from "lucide-react"
import { RealDeviceSelector } from "../../components/real-device-selector"

interface Device {
  name: string
  os: string
  version: string
}

export default function TestingPage() {
  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<{ type: string; message: string }[]>([])
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>("local")
  const [selectedRealDevice, setSelectedRealDevice] = useState<Device | null>(null)

  const runTest = (testType: string) => {
    setTimeout(() => {
      const result = Math.random() > 0.5 ? "pass" : "fail"
      const environmentInfo =
        selectedEnvironment === "real" && selectedRealDevice
          ? `${selectedRealDevice.name} (${selectedRealDevice.os} ${selectedRealDevice.version})`
          : selectedEnvironment
      setTestResults((prev) => [
        ...prev,
        {
          type: result,
          message: `${testType} test on ${environmentInfo} ${result === "pass" ? "passed" : "failed"}.`,
        },
      ])
    }, 1000)
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <h1 className="text-3xl font-bold text-foreground mb-8">Testing Dashboard</h1>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Test Environment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="test-environment">Select Test Environment</Label>
                    <Select onValueChange={setSelectedEnvironment} defaultValue="local">
                      <SelectTrigger id="test-environment">
                        <SelectValue placeholder="Choose a test environment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local Machine</SelectItem>
                        <SelectItem value="vm">Virtual Machine (RDP)</SelectItem>
                        <SelectItem value="container">Container</SelectItem>
                        <SelectItem value="real">Real Devices</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedEnvironment === "vm" && (
                    <div>
                      <Label htmlFor="rdp-address">RDP Address</Label>
                      <Input id="rdp-address" placeholder="e.g., 192.168.1.100:3389" />
                    </div>
                  )}
                  {selectedEnvironment === "container" && (
                    <div>
                      <Label htmlFor="container-image">Container Image</Label>
                      <Input id="container-image" placeholder="e.g., ubuntu:latest" />
                    </div>
                  )}
                  {selectedEnvironment === "real" && <RealDeviceSelector onDeviceSelect={setSelectedRealDevice} />}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="unit">
              <TabsList className="mb-4">
                <TabsTrigger value="unit">Unit Tests</TabsTrigger>
                <TabsTrigger value="integration">Integration Tests</TabsTrigger>
                <TabsTrigger value="e2e">E2E Tests</TabsTrigger>
                <TabsTrigger value="performance">Performance Tests</TabsTrigger>
              </TabsList>

              <TabsContent value="unit">
                <Card>
                  <CardHeader>
                    <CardTitle>Unit Tests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="unit-test-file">Select Test File</Label>
                        <Select onValueChange={setSelectedTest}>
                          <SelectTrigger id="unit-test-file">
                            <SelectValue placeholder="Choose a test file" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auth">Authentication Tests</SelectItem>
                            <SelectItem value="utils">Utility Function Tests</SelectItem>
                            <SelectItem value="components">Component Tests</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={() => runTest("Unit")} disabled={!selectedTest}>
                        <Play className="mr-2 h-4 w-4" />
                        Run Unit Tests
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="integration">
                <Card>
                  <CardHeader>
                    <CardTitle>Integration Tests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="integration-test-suite">Select Test Suite</Label>
                        <Select onValueChange={setSelectedTest}>
                          <SelectTrigger id="integration-test-suite">
                            <SelectValue placeholder="Choose a test suite" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="api">API Integration Tests</SelectItem>
                            <SelectItem value="database">Database Integration Tests</SelectItem>
                            <SelectItem value="services">Service Integration Tests</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={() => runTest("Integration")} disabled={!selectedTest}>
                        <Play className="mr-2 h-4 w-4" />
                        Run Integration Tests
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="e2e">
                <Card>
                  <CardHeader>
                    <CardTitle>End-to-End Tests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="e2e-scenario">Select E2E Scenario</Label>
                        <Select onValueChange={setSelectedTest}>
                          <SelectTrigger id="e2e-scenario">
                            <SelectValue placeholder="Choose an E2E scenario" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user-registration">User Registration Flow</SelectItem>
                            <SelectItem value="checkout">Checkout Process</SelectItem>
                            <SelectItem value="content-creation">Content Creation and Publishing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="headless-mode" />
                        <Label htmlFor="headless-mode">Run in Headless Mode</Label>
                      </div>
                      <Button onClick={() => runTest("E2E")} disabled={!selectedTest}>
                        <Play className="mr-2 h-4 w-4" />
                        Run E2E Tests
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Tests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="performance-test-type">Select Performance Test Type</Label>
                        <Select onValueChange={setSelectedTest}>
                          <SelectTrigger id="performance-test-type">
                            <SelectValue placeholder="Choose a performance test type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="load">Load Testing</SelectItem>
                            <SelectItem value="stress">Stress Testing</SelectItem>
                            <SelectItem value="endurance">Endurance Testing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="concurrent-users">Concurrent Users</Label>
                        <Input type="number" id="concurrent-users" placeholder="e.g., 1000" />
                      </div>
                      <div>
                        <Label htmlFor="test-duration">Test Duration (minutes)</Label>
                        <Input type="number" id="test-duration" placeholder="e.g., 30" />
                      </div>
                      <Button onClick={() => runTest("Performance")} disabled={!selectedTest}>
                        <Play className="mr-2 h-4 w-4" />
                        Run Performance Tests
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <p className="text-muted-foreground">No tests have been run yet.</p>
                ) : (
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {result.type === "pass" ? (
                          <CheckCircle className="text-green-500 h-5 w-5" />
                        ) : (
                          <XCircle className="text-red-500 h-5 w-5" />
                        )}
                        <span>{result.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
