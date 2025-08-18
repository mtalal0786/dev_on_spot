"use client"

import { useEffect, useState } from "react"
import { TopNav } from "../../components/top-nav"
import { Sidebar } from "../../components/sidebar"
import { ThemeProvider } from "../../components/theme-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Sparkles, MessageSquare, Image, FileCode, Music, Video, Search, Plus, Trash2, Pencil, LucideIcon } from "lucide-react"
import { AIModelCard } from "@/components/ai-model-card"
import { AIPlayground } from "@/components/ai-playground"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Define the type for the AI model data
interface AIModel {
  _id: string; // _id is always present for models from the database
  name: string;
  provider: string;
  description: string;
  type: "text" | "image" | "code" | "audio" | "video";
  features: string[];
  pricing: string;
  icon: keyof typeof iconMap;
}

// A new type for the form data, which doesn't have an _id or has features as a string
interface FormData {
    _id?: string;
    name: string;
    provider: string;
    description: string;
    type: "text" | "image" | "code" | "audio" | "video";
    features: string; // features is a single string in the form
    pricing: string;
    icon: keyof typeof iconMap | string;
}

// Define the types for the categorized models
interface CategorizedModels {
  text: AIModel[];
  image: AIModel[];
  code: AIModel[];
  audio: AIModel[];
  video: AIModel[];
}

const iconMap: { [key: string]: LucideIcon } = {
  MessageSquare: MessageSquare,
  Brain: Brain,
  Image: Image,
  FileCode: FileCode,
  Music: Music,
  Video: Video,
  Sparkles: Sparkles,
};

// Dummy data with explicit types to match the interfaces
const dummyModels: CategorizedModels = {
  text: [
    { _id: "dummy1", name: "GPT-4", provider: "OpenAI", description: "Advanced language model for text generation and analysis", type: "text", icon: "MessageSquare", features: ["Chat", "Completion", "Edit", "Analysis"], pricing: "Pay per token" },
    { _id: "dummy2", name: "Claude 2", provider: "Anthropic", description: "Powerful language model with enhanced reasoning capabilities", type: "text", icon: "Brain", features: ["Chat", "Analysis", "Code", "Math"], pricing: "Pay per token" },
  ],
  image: [
    { _id: "dummy3", name: "DALL-E 3", provider: "OpenAI", description: "Create realistic images and art from text descriptions", type: "image", icon: "Image", features: ["Generation", "Edit", "Variation"], pricing: "Per image" },
    { _id: "dummy4", name: "Stable Diffusion XL", provider: "Stability AI", description: "Open-source image generation with high quality results", type: "image", icon: "Image", features: ["Generation", "Inpainting", "Outpainting"], pricing: "Self-hosted" },
  ],
  code: [
    { _id: "dummy5", name: "CodeLlama", provider: "Meta", description: "Specialized model for code generation and analysis", type: "code", icon: "FileCode", features: ["Generation", "Explanation", "Debug"], pricing: "Open source" },
  ],
  audio: [
    { _id: "dummy6", name: "Whisper", provider: "OpenAI", description: "Speech recognition and translation model", type: "audio", icon: "Music", features: ["Transcription", "Translation"], pricing: "Pay per minute" },
  ],
  video: [
    { _id: "dummy7", name: "Stable Video", provider: "Stability AI", description: "Generate and edit videos using AI", type: "video", icon: "Video", features: ["Generation", "Edit"], pricing: "Pay per video" },
  ],
};

const defaultNewModel: FormData = {
  name: '',
  provider: '',
  description: '',
  type: 'text',
  features: '',
  pricing: '',
  icon: '',
};

export default function AIModelsPage() {
  const [aiModels, setAiModels] = useState<CategorizedModels>(dummyModels);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentModel, setCurrentModel] = useState<FormData>(defaultNewModel);

  const fetchModels = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/api/models");
      if (!response.ok) {
        throw new Error("Failed to fetch AI models, using dummy data.");
      }
      const data: AIModel[] = await response.json();
      
      const categorizedModels = data.reduce((acc, model) => {
        if (!acc[model.type]) {
          acc[model.type] = [];
        }
        acc[model.type].push(model);
        return acc;
      }, {
        text: [],
        image: [],
        code: [],
        audio: [],
        video: [],
      } as CategorizedModels);
      
      setAiModels(categorizedModels);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred, using dummy data.");
      }
      setAiModels(dummyModels);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentModel({ ...currentModel, [name]: value });
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setCurrentModel({ ...currentModel, [name]: value }); 
  };
  
  const openAddModal = () => {
    setIsEditing(false);
    setCurrentModel(defaultNewModel);
    setIsModalOpen(true);
  };
  
  const openEditModal = (model: AIModel) => {
    setIsEditing(true);
    setCurrentModel({ ...model, features: model.features.join(', ') });
    setIsModalOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this model?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/models/delete/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete AI model.");
        }
        await fetchModels();
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while deleting the model.");
        }
      }
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/models/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentModel,
          features: currentModel.features.split(',').map(f => f.trim()),
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add new AI model.");
      }
      await fetchModels();
      setIsModalOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while adding the model.");
      }
    }
  };
  
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentModel._id) {
        setError("Error: Model ID is missing for editing.");
        return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/models/update/${currentModel._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentModel,
          features: currentModel.features.split(',').map(f => f.trim()),
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update AI model.");
      }
      await fetchModels();
      setIsModalOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while updating the model.");
      }
    }
  };

  const renderModelCards = (modelsArray: AIModel[]) => (
    modelsArray.map((model) => (
        <div key={model._id} className="relative group p-4 border rounded-lg shadow-sm bg-card text-card-foreground">
            <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                    {model.icon && iconMap[model.icon] ? (
                        <model.icon className="h-5 w-5" />
                    ) : (
                        <Sparkles className="h-5 w-5" /> // Fallback icon
                    )}
                </div>
                <div className="flex-grow">
                    <h3 className="text-xl font-semibold">{model.name}</h3>
                    <div className="flex items-baseline space-x-4">
                        <p className="text-sm text-muted-foreground">{model.provider}</p>
                        <span className="text-xs font-medium text-muted-foreground bg-secondary/50 rounded-full px-2 py-0.5">
                            {model.type}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="icon" onClick={() => openEditModal(model)}>
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(model._id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
            
            <p className="text-muted-foreground text-sm mb-4">{model.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
                {model.features.map(feature => (
                    <span key={feature} className="bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded-full">
                        {feature}
                    </span>
                ))}
            </div>
            
            <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-foreground">
                    <span className="text-gray-400">$</span>{model.pricing}
                </p>
                <Button variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Try Now
                </Button>
            </div>
        </div>
    ))
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar isCollapsed={isSidebarCollapsed} />
          <main className="flex-1 p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-foreground">AI Models</h1>
              <div className="flex items-center space-x-4">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search models..." className="pl-8" />
                </div>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openAddModal}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Model
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{isEditing ? "Edit AI Model" : "Add New AI Model"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={isEditing ? handleEditSubmit : handleAddSubmit} className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" name="name" value={currentModel.name} onChange={handleInputChange} className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="provider" className="text-right">Provider</Label>
                        <Input id="provider" name="provider" value={currentModel.provider} onChange={handleInputChange} className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Textarea id="description" name="description" value={currentModel.description} onChange={handleInputChange} className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Type</Label>
                        <Select onValueChange={(value) => handleSelectChange('type', value)} value={currentModel.type}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(aiModels).map(type => (
                              <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="features" className="text-right">Features (comma-separated)</Label>
                        <Input id="features" name="features" value={currentModel.features} onChange={handleInputChange} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="pricing" className="text-right">Pricing</Label>
                        <Input id="pricing" name="pricing" value={currentModel.pricing} onChange={handleInputChange} className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="icon" className="text-right">Icon</Label>
                        <Select onValueChange={(value) => handleSelectChange('icon', value)} value={currentModel.icon}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select icon" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(iconMap).map(iconName => (
                              <SelectItem key={iconName} value={iconName}>{iconName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full mt-4">{isEditing ? "Save Changes" : "Add Model"}</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {isLoading ? (
                <div className="text-center text-lg">Loading models...</div>
            ) : error ? (
                <div className="text-center text-lg text-red-500">Error: {error}</div>
            ) : null}

            <Tabs defaultValue="text" className="space-y-4">
              <TabsList>
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="image">Image</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="audio">Audio</TabsTrigger>
                <TabsTrigger value="video">Video</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderModelCards(aiModels.text)}
                </div>
                <AIPlayground type="text" />
              </TabsContent>

              <TabsContent value="image" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderModelCards(aiModels.image)}
                </div>
                <AIPlayground type="image" />
              </TabsContent>

              <TabsContent value="code" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderModelCards(aiModels.code)}
                </div>
                <AIPlayground type="code" />
              </TabsContent>

              <TabsContent value="audio" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderModelCards(aiModels.audio)}
                </div>
                <AIPlayground type="audio" />
              </TabsContent>

              <TabsContent value="video" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderModelCards(aiModels.video)}
                </div>
                <AIPlayground type="video" />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}