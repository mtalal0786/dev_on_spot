"use client"

import { TopNav } from "../../components/top-nav"
import { Sidebar } from "../../components/sidebar"
import { ThemeProvider } from "../../components/theme-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Sparkles, MessageSquare, Image, FileCode, Music, Video, Search } from "lucide-react"
import { AIModelCard } from "@/components/ai-model-card"
import { AIPlayground } from "@/components/ai-playground"

const models = {
  text: [
    {
      name: "GPT-4",
      provider: "OpenAI",
      description: "Advanced language model for text generation and analysis",
      type: "text",
      icon: MessageSquare,
      features: ["Chat", "Completion", "Edit", "Analysis"],
      pricing: "Pay per token",
    },
    {
      name: "Claude 2",
      provider: "Anthropic",
      description: "Powerful language model with enhanced reasoning capabilities",
      type: "text",
      icon: Brain,
      features: ["Chat", "Analysis", "Code", "Math"],
      pricing: "Pay per token",
    },
  ],
  image: [
    {
      name: "DALL-E 3",
      provider: "OpenAI",
      description: "Create realistic images and art from text descriptions",
      type: "image",
      icon: Image,
      features: ["Generation", "Edit", "Variation"],
      pricing: "Per image",
    },
    {
      name: "Stable Diffusion XL",
      provider: "Stability AI",
      description: "Open-source image generation with high quality results",
      type: "image",
      icon: Image,
      features: ["Generation", "Inpainting", "Outpainting"],
      pricing: "Self-hosted",
    },
  ],
  code: [
    {
      name: "CodeLlama",
      provider: "Meta",
      description: "Specialized model for code generation and analysis",
      type: "code",
      icon: FileCode,
      features: ["Generation", "Explanation", "Debug"],
      pricing: "Open source",
    },
  ],
  audio: [
    {
      name: "Whisper",
      provider: "OpenAI",
      description: "Speech recognition and translation model",
      type: "audio",
      icon: Music,
      features: ["Transcription", "Translation"],
      pricing: "Pay per minute",
    },
  ],
  video: [
    {
      name: "Stable Video",
      provider: "Stability AI",
      description: "Generate and edit videos using AI",
      type: "video",
      icon: Video,
      features: ["Generation", "Edit"],
      pricing: "Pay per video",
    },
  ],
}

export default function AIModelsPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-foreground">AI Models</h1>
              <div className="flex items-center space-x-4">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search models..." className="pl-8" />
                </div>
                <Button>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Try Playground
                </Button>
              </div>
            </div>

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
                  {models.text.map((model) => (
                    <AIModelCard key={model.name} model={model} />
                  ))}
                </div>
                <AIPlayground type="text" />
              </TabsContent>

              <TabsContent value="image" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {models.image.map((model) => (
                    <AIModelCard key={model.name} model={model} />
                  ))}
                </div>
                <AIPlayground type="image" />
              </TabsContent>

              <TabsContent value="code" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {models.code.map((model) => (
                    <AIModelCard key={model.name} model={model} />
                  ))}
                </div>
                <AIPlayground type="code" />
              </TabsContent>

              <TabsContent value="audio" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {models.audio.map((model) => (
                    <AIModelCard key={model.name} model={model} />
                  ))}
                </div>
                <AIPlayground type="audio" />
              </TabsContent>

              <TabsContent value="video" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {models.video.map((model) => (
                    <AIModelCard key={model.name} model={model} />
                  ))}
                </div>
                <AIPlayground type="video" />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
