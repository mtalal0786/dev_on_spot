"use client"

import { useEffect, useState } from "react"
import { TopNav } from "../../components/top-nav"
import { Sidebar } from "../../components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeProvider } from "../../components/theme-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Image,
  PenTool,
  Layout,
  Square,
  Video,
  Music,
  Webcam,
  FileText,
  Code,
  Network,
  Database,
  GitGraphIcon as Git,
  CheckSquare,
  Clock,
  FileOutput,
  Edit,
  Trash2,
  Plus,
  LucideIcon
} from "lucide-react"

// Import UI components from shadcn/ui
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

// --- Type Definitions for better TypeScript support ---
interface Tool {
  _id?: string; // Optional because it's not present for new tools
  name: string;
  description: string;
  category: string;
  icon?: LucideIcon; // Added to handle the component mapping
  icon_url?: string;
  api_endpoint?: string;
  status?: string;
}

interface GroupedTool {
  category: string;
  items: Tool[];
}

// Static data as a fallback in case the API fails
const staticTools: GroupedTool[] = [
  {
    category: "Design",
    items: [
      { name: "Image Editor", icon: Image, description: "Edit and manipulate images", category: "Design" },
      { name: "Vector Editor", icon: PenTool, description: "Create and edit vector graphics", category: "Design" },
      { name: "UI Designer", icon: Layout, description: "Design user interfaces", category: "Design" },
      { name: "Icon Creator", icon: Square, description: "Create custom icons", category: "Design" },
    ],
  },
  {
    category: "Video & Audio",
    items: [
      { name: "Video Editor", icon: Video, description: "Edit and compose videos", category: "Video & Audio" },
      { name: "Audio Editor", icon: Music, description: "Edit and mix audio files", category: "Video & Audio" },
      { name: "Screen Recorder", icon: Webcam, description: "Record your screen", category: "Video & Audio" },
      { name: "Subtitle Generator", icon: FileText, description: "Generate and edit subtitles", category: "Video & Audio" },
    ],
  },
  {
    category: "Development",
    items: [
      { name: "Code Editor", icon: Code, description: "Write and edit code", category: "Development" },
      { name: "API Tester", icon: Network, description: "Test API endpoints", category: "Development" },
      { name: "Database Manager", icon: Database, description: "Manage databases", category: "Development" },
      { name: "Git Client", icon: Git, description: "Manage git repositories", category: "Development" },
    ],
  },
  {
    category: "Productivity",
    items: [
      { name: "Note Taking", icon: FileText, description: "Take and organize notes", category: "Productivity" },
      { name: "Task Manager", icon: CheckSquare, description: "Manage tasks and projects", category: "Productivity" },
      { name: "Time Tracker", icon: Clock, description: "Track time and productivity", category: "Productivity" },
      { name: "File Converter", icon: FileOutput, description: "Convert between file formats", category: "Productivity" },
    ],
  },
]

// Mapping of category strings to Lucide-React icons
const iconMap: Record<string, LucideIcon> = {
  'Design': PenTool,
  'Video & Audio': Video,
  'Communication': Webcam,
  'Development': Code,
  'Analytics': Network,
  'Productivity': Clock,
  'Other': Square,
};

export default function ToolsPage() {
  const [tools, setTools] = useState<GroupedTool[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentTool, setCurrentTool] = useState<Tool | null>(null); // Tool being edited
  const [formInput, setFormInput] = useState<Omit<Tool, '_id'>>({
    name: '',
    description: '',
    category: 'Design',
    icon_url: '',
    api_endpoint: '',
    status: 'active'
  });
  const { toast } = useToast();

  // Function to fetch all tools from the backend
  const fetchTools = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/tools`);
      if (!res.ok) {
        throw new Error('Failed to fetch tools');
      }
      const data: Tool[] = await res.json();
      
      // Group tools by category
      const groupedTools = data.reduce<GroupedTool[]>((acc, tool) => {
        const categoryIndex = acc.findIndex(group => group.category === tool.category);
        const iconComponent = iconMap[tool.category] || Square;
        const toolWithIcon: Tool = { ...tool, icon: iconComponent };
        
        if (categoryIndex > -1) {
          acc[categoryIndex].items.push(toolWithIcon);
        } else {
          acc.push({
            category: tool.category,
            items: [toolWithIcon],
          });
        }
        return acc;
      }, []);
      
      setTools(groupedTools);
    } catch (error: unknown) {
      console.error("Error fetching tools:", error);
      // Fallback to static data if API call fails
      setTools(staticTools);
      toast({
        title: "API Error",
        description: `Failed to load tools from the server. Displaying static data as fallback. Error: ${String(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormInput(prev => ({ ...prev, [name]: value }));
  };

  // Handle category select change
  const handleCategoryChange = (value: string) => {
    setFormInput(prev => ({ ...prev, category: value }));
  };

  // Handle status select change
  const handleStatusChange = (value: string) => {
    setFormInput(prev => ({ ...prev, status: value }));
  };

  // Function to create or update a tool
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!currentTool;
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${process.env.NEXT_PUBLIC_BASE_URL}/tools/${currentTool?._id}` : `${process.env.NEXT_PUBLIC_BASE_URL}/tools`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formInput),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      toast({
        title: "Success",
        description: `Tool ${isEditing ? 'updated' : 'created'} successfully!`,
      });
      setIsModalOpen(false);
      fetchTools(); // Refresh the list
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: `Failed to save tool: ${String(error)}`,
        variant: "destructive",
      });
    }
  };

  // Function to handle tool deletion
  const handleDelete = async (id: string) => {
    // Custom confirm dialog since `window.confirm` is not supported in the environment
    if (confirm("Are you sure you want to delete this tool?")) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/tools/${id}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'An error occurred');
        }
        toast({
          title: "Success",
          description: "Tool deleted successfully!",
        });
        fetchTools(); // Refresh the list
      } catch (error: unknown) {
        toast({
          title: "Error",
          description: `Failed to delete tool: ${String(error)}`,
          variant: "destructive",
        });
      }
    }
  };

  // Function to open the modal for creating a new tool
  const openAddModal = () => {
    setCurrentTool(null);
    setFormInput({
      name: '',
      description: '',
      category: 'Design',
      icon_url: '',
      api_endpoint: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  // Function to open the modal for editing a tool
  const openEditModal = (tool: Tool) => {
    setCurrentTool(tool);
    setFormInput({
      name: tool.name,
      description: tool.description,
      category: tool.category,
      icon_url: tool.icon_url || '',
      api_endpoint: tool.api_endpoint || '',
      status: tool.status || 'active'
    });
    setIsModalOpen(true);
  };
  
  // Conditionally render based on loading state
  if (isLoading) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-xl text-foreground">Loading tools...</p>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar isCollapsed={false} />
          <main className="flex-1 p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-foreground">Tools</h1>
              <div className="flex items-center space-x-4">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search tools..." className="pl-8" />
                </div>
                <Button onClick={openAddModal}>
                  <Plus className="h-4 w-4 mr-2" /> Add Tool
                </Button>
              </div>
            </div>

            <div className="space-y-8">
              {tools.length > 0 ? (
                tools.map((category) => (
                  <div key={category.category}>
                    <h2 className="text-xl font-semibold mb-4">{category.category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {category.items.map((tool) => (
                        <Card key={tool.name} className="relative group hover:shadow-lg transition-shadow">
                          {/* Edit and Delete Buttons on Hover */}
                          <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary/70 hover:bg-primary/10 hover:text-primary transition-colors"
                              onClick={() => openEditModal(tool)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                              onClick={() => tool._id && handleDelete(tool._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                {tool.icon && <tool.icon className="h-5 w-5 text-primary" />}
                              </div>
                              <span>{tool.name}</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                            <Button className="w-full">Open Tool</Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p>No tools found. Please add a new tool to get started.</p>
              )}
            </div>
          </main>
        </div>
      </div>
      
      {/* Add/Edit Tool Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentTool ? 'Edit Tool' : 'Add New Tool'}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4 p-1">
              <div>
                <Label htmlFor="name">Tool Name</Label>
                <Input id="name" name="name" value={formInput.name} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formInput.description} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={handleCategoryChange} value={formInput.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(iconMap).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="api_endpoint">API Endpoint</Label>
                <Input id="api_endpoint" name="api_endpoint" value={formInput.api_endpoint} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="icon_url">Icon URL (Optional)</Label>
                <Input id="icon_url" name="icon_url" value={formInput.icon_url} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={handleStatusChange} value={formInput.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {['active', 'maintenance', 'deprecated'].map(stat => (
                      <SelectItem key={stat} value={stat}>{stat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit">{currentTool ? 'Update Tool' : 'Add Tool'}</Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}
