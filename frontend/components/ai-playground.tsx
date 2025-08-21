"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Upload, Download, Settings, Loader2 } from "lucide-react"

// Define the AIModel interface here to be used in this component
interface AIModel {
    _id: string;
    name: string;
    provider: string;
    description: string;
    type: "text" | "image" | "code" | "audio" | "video";
    features: string[];
    pricing: string;
    icon: string;
}

interface AIPlaygroundProps {
    type: "text" | "image" | "code" | "audio" | "video";
    selectedModels: AIModel[];
}

export function AIPlayground({ type, selectedModels }: AIPlaygroundProps) {
    const [input, setInput] = useState("")
    const [temperature, setTemperature] = useState([0.7])
    const [selectedModel, setSelectedModel] = useState<string>("")
    const [output, setOutput] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    // New state to store the history of generations
    const [history, setHistory] = useState<any[]>([]);

    // Use useEffect to set the default model whenever selectedModels changes
    useEffect(() => {
        if (selectedModels.length > 0) {
            setSelectedModel(selectedModels[4].name);
        } else {
            setSelectedModel(""); // Clear selection if no models are available
        }
    }, [selectedModels]);

    // Function to handle the API call to the backend
    const handleRun = async () => {
        if (!selectedModel || !input) {
            setError("Please select a model and enter a prompt.");
            return;
        }

        setLoading(true);
        setError(null);
        setOutput("");

        console.log({
            modelName: selectedModel,
            prompt: input,
            temperature: temperature[0],
        });

        try {
            const response = await fetch("http://localhost:5000/api/playground", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    modelName: selectedModel,
                    prompt: input,
                    temperature: temperature[0],
                    max_tokens: 1024,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch response from API.");
            }

            const data = await response.json();
            const newOutput = data.output;
            setOutput(newOutput);
            
            // Add the new generation to the history, keeping only the last 10
            setHistory(prevHistory => {
                const newHistoryEntry = { input, output: newOutput };
                return [newHistoryEntry, ...prevHistory].slice(0, 10);
            });
        } catch (err: any) {
            setError(err.message);
            setOutput("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>AI Playground</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Model</Label>
                            <Select onValueChange={setSelectedModel} value={selectedModel}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Select model" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedModels.map((model) => (
                                        <SelectItem key={model._id} value={model.name}>
                                            {model.name}
                                        </SelectItem>
                                    ))}
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

                        {type === "code" && (
                            <div className="space-y-2">
                                <Label>Input</Label>
                                <Textarea
                                    placeholder="Enter your code prompt..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="h-[200px] font-mono"
                                />
                            </div>
                        )}

                        <div className="flex space-x-2">
                            <Button className="flex-1" onClick={handleRun} disabled={loading}>
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Play className="mr-2 h-4 w-4" />
                                )}
                                {loading ? "Running..." : "Run"}
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
                                    <CardContent className="p-4 h-[400px] bg-muted/50 overflow-y-auto">
                                        {loading && (
                                            <div className="flex items-center justify-center h-full">
                                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                            </div>
                                        )}
                                        {error && (
                                            <p className="text-sm text-destructive">{error}</p>
                                        )}
                                        {!loading && !error && output === "" && (
                                            <p className="text-sm text-muted-foreground">Output will appear here...</p>
                                        )}
                                        {!loading && !error && output !== "" && (
                                            <pre className="text-sm whitespace-pre-wrap">{output}</pre>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="history">
                                <Card>
                                    <CardContent className="p-4 h-[400px] bg-muted/50 overflow-y-auto">
                                        {history.length > 0 ? (
                                            <div className="space-y-4">
                                                {history.map((entry, index) => (
                                                    <div key={index} className="border-b pb-2 last:border-b-0">
                                                        <p className="text-sm font-semibold text-foreground">Prompt:</p>
                                                        <p className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">{entry.input}</p>
                                                        <p className="text-sm font-semibold text-foreground">Response:</p>
                                                        <pre className="text-sm whitespace-pre-wrap">{entry.output}</pre>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No history yet</p>
                                        )}
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
