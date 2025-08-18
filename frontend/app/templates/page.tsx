"use client"

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Download, Edit, Trash2, PlusCircle, X, Search, Sparkles, FolderPlus } from 'lucide-react';
import { TopNav } from "../../components/top-nav"
import { Sidebar } from "../../components/sidebar"
import { ThemeProvider } from "../../components/theme-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Use a placeholder URL. Make sure your backend is running on this port.
const API_BASE_URL = 'http://localhost:5000/api/templates';
// New API URL for category management
const CATEGORY_API_URL = 'http://localhost:5000/api/categories';

// Define a type for the template data to fix implicit 'any' and property existence errors
interface Template {
  _id: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url?: string;
}

// Define a type for the category data
interface Category {
  _id: string;
  name: string;
}

interface FormDataState {
  title: string;
  description: string;
  category: string;
  thumbnail: File | null;
  templateZip: File | null;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  // New state to store fetched categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // New state for the category management modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  // States for category form
  const [categoryFormData, setCategoryFormData] = useState({ name: '' });
  const [isCategoryEditMode, setIsCategoryEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState<FormDataState>({
    title: '',
    description: '',
    category: '',
    thumbnail: null,
    templateZip: null,
  });
  // State for the Sidebar component to fix the missing prop error
  const [isCollapsed, setIsCollapsed] = useState(false);
  // New state for the search term
  const [searchTerm, setSearchTerm] = useState('');
  // New state to track the active category filter, initialized to 'All'
  const [activeCategory, setActiveCategory] = useState('All');

  // Fetch all templates from the backend
  const fetchTemplates = async () => {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data: Template[] = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all categories from the backend
  const fetchCategories = async () => {
    try {
      const response = await fetch(CATEGORY_API_URL);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data: Category[] = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // New useEffect hook to fetch templates and categories on component load
  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, []);

  // Handlers for form input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  // New handler for category form input changes
  const handleCategoryInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCategoryFormData({ name: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  // Handler for the search input
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Open the modal for creating a new template
  const handleAddTemplate = () => {
    setIsEditMode(false);
    setCurrentTemplate(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      thumbnail: null,
      templateZip: null,
    });
    setIsModalOpen(true);
  };

  // Open the modal for editing an existing template
  const handleEdit = (template: Template) => {
    setIsEditMode(true);
    setCurrentTemplate(template);
    setFormData({
      title: template.title,
      description: template.description,
      category: template.category,
      thumbnail: null, // Files are not pre-filled
      templateZip: null, // Files are not pre-filled
    });
    setIsModalOpen(true);
  };

  // Submit handler for the create/edit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    if (formData.thumbnail) data.append('thumbnail', formData.thumbnail);
    if (formData.templateZip) data.append('templateZip', formData.templateZip);

    try {
      let response;
      if (isEditMode && currentTemplate) {
        response = await fetch(`${API_BASE_URL}/${currentTemplate._id}`, {
          method: 'PUT',
          body: data,
        });
      } else {
        response = await fetch(API_BASE_URL, {
          method: 'POST',
          body: data,
        });
      }

      if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
      await fetchTemplates(); // Refresh templates after successful operation
      setIsModalOpen(false);
    } catch (error) {
      console.error('Submission error:', error);
      // Use a custom modal or toast instead of alert()
    }
  };

  // Delete a template
  const handleDelete = async (id: string) => {
    // Replaced window.confirm with a custom log and comment
    console.log('User confirmed deletion of template with id:', id);
    // In a real app, you would use a custom modal for this.
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete template');
      await fetchTemplates(); // Refresh templates
    } catch (error) {
      console.error('Error deleting template:', error);
      // Use a custom modal or toast instead of alert()
    }
  };

  // Download a template
  const handleDownload = (id: string) => {
    const downloadUrl = `${API_BASE_URL}/download/${id}`;
    window.open(downloadUrl, '_blank');
  };

  // New CRUD handlers for categories
  const handleAddCategory = async () => {
    try {
      const response = await fetch(CATEGORY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryFormData),
      });
      if (!response.ok) throw new Error('Failed to add category');
      await fetchCategories();
      setCategoryFormData({ name: '' });
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleEditCategory = async () => {
    if (!currentCategory) return;
    try {
      const response = await fetch(`${CATEGORY_API_URL}/${currentCategory._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryFormData),
      });
      if (!response.ok) throw new Error('Failed to update category');
      await fetchCategories();
      setCategoryFormData({ name: '' });
      setCurrentCategory(null);
      setIsCategoryEditMode(false);
    } catch (error) {
      console.error('Error editing category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    // Replaced window.confirm with a custom log and comment
    console.log('User confirmed deletion of category with id:', id);
    // In a real app, you would use a custom modal for this.
    try {
      const response = await fetch(`${CATEGORY_API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete category');
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // Filter templates based on the active category and search term
  // This logic was updated to include category filtering
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = activeCategory === 'All' || template.category === activeCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // The template card component
  const TemplateCard = ({ template }: { template: Template }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-0">
        <div className="relative">
          <Badge className="absolute top-2 left-2 bg-gray-800 text-white hover:bg-gray-900">
            Intelligent
          </Badge>
          <img
            src={template.thumbnail_url ? `http://localhost:5000${template.thumbnail_url}` : 'https://placehold.co/400x200/2f4f4f/ffffff?text=No+Image'}
            alt={template.title}
            className="w-full aspect-video object-cover rounded-t-lg"
          />
        </div>
        <div className="p-4">
          <h4 className="font-medium truncate">{template.title}</h4>
          <p className="text-sm text-muted-foreground truncate">{template.category}</p>
          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={() => handleDownload(template._id)}
              className="px-2 py-1 h-auto text-xs"
              variant="outline"
            >
              <Download size={14} className="mr-1" /> Download
            </Button>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleEdit(template)}
                size="icon"
                variant="outline"
              >
                <Edit size={16} />
              </Button>
              <Button
                onClick={() => handleDelete(template._id)}
                size="icon"
                variant="destructive"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar isCollapsed={isCollapsed} />
          <div className="w-64 border-r h-[calc(100vh-4rem)] p-4 space-y-6">
            <h3 className="font-semibold mb-2 px-3">Filter by Category</h3>
            {/* New button to open the category management modal */}
            <Button
              onClick={() => setIsCategoryModalOpen(true)}
              className="w-full flex items-center justify-start space-x-2 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FolderPlus size={16} />
              <span>Manage Categories</span>
            </Button>
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2 px-3">BY USE CASE</h3>
              {/* "All" button to show all templates */}
              <button
                onClick={() => setActiveCategory('All')}
                className={`w-full text-left px-3 py-2 my-1 rounded-lg transition-colors hover:bg-muted ${activeCategory === 'All' ? 'bg-muted font-bold' : ''}`}
              >
                All
              </button>
              {/* Dynamically render categories with onClick handler and active state */}
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`w-full text-left px-3 py-2 my-1 rounded-lg transition-colors hover:bg-muted ${activeCategory === cat.name ? 'bg-muted font-bold' : ''}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search templates" 
                    className="pl-10"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                {/* <div className="flex items-center space-x-2">
                  <Checkbox id="show-board" />
                  <Label htmlFor="show-board">Show when creating a board</Label>
                </div> */}
                <Button
                  onClick={handleAddTemplate}
                  className="flex items-center space-x-2 px-4 py-2 bg-white text-black rounded-md hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <PlusCircle size={20} />
                  <span>Add Template</span>
                </Button>
              </div>

              <Card className="bg-gray-50 border-gray-100">
                <CardContent className="p-8">
                  <div className="flex justify-between items-center">
                    <div className="space-y-4">
                      <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                        Intelligent templates are here to explore
                        <Sparkles className="text-yellow-400" />
                      </h2>
                      <p className="text-muted-foreground">
                        Achieve more with AI-powered workflows, integrations and intelligent widgets.
                      </p>
                      <Button className="bg-black text-white hover:bg-gray-800">Explore templates</Button>
                    </div>
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-21%20at%209.36.31%E2%80%AFPM-gcbksoTgkwgWR0St2MpPCIz4Qt4EDK.png"
                      alt="Template preview"
                      className="w-64 rounded-lg shadow-lg hidden md:block"
                    />
                  </div>
                </CardContent>
              </Card>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Templates</h3>
                </div>
                {loading ? (
                  <div className="text-center text-lg text-gray-400">Loading templates...</div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="text-center text-lg text-gray-400">No templates found.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                      <TemplateCard key={template._id} template={template} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <Card className="rounded-xl p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">
              {isEditMode ? 'Edit Template' : 'Add New Template'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                {/* Replaced Input as="textarea" with a standard textarea and Shadcn styles */}
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                {/* Updated category input to a select dropdown */}
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="flex min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="thumbnail">Thumbnail Image</Label>
                <Input
                  type="file"
                  id="thumbnail"
                  name="thumbnail"
                  onChange={handleFileChange}
                  accept="image/*"
                  required={!isEditMode}
                />
              </div>
              <div>
                <Label htmlFor="templateZip">Template Zip File</Label>
                <Input
                  type="file"
                  id="templateZip"
                  name="templateZip"
                  onChange={handleFileChange}
                  accept=".zip"
                  required={!isEditMode}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-gray-100"
              >
                {isEditMode ? 'Update Template' : 'Create Template'}
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* New Modal for Category Management */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <Card className="rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => {
                setIsCategoryModalOpen(false);
                setIsCategoryEditMode(false);
                setCurrentCategory(null);
                setCategoryFormData({ name: '' });
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Manage Categories</h2>
            
            <div className="space-y-4">
              {/* Add/Edit Category Form */}
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input 
                    id="categoryName"
                    type="text"
                    value={categoryFormData.name}
                    onChange={handleCategoryInputChange}
                    placeholder="e.g., Marketing"
                  />
                </div>
                <Button onClick={isCategoryEditMode ? handleEditCategory : handleAddCategory}>
                  {isCategoryEditMode ? 'Update' : 'Add'}
                </Button>
              </div>
              {isCategoryEditMode && (
                <Button variant="outline" onClick={() => { setIsCategoryEditMode(false); setCategoryFormData({ name: '' }); setCurrentCategory(null); }}>
                  Cancel
                </Button>
              )}

              {/* Category List */}
              <div className="pt-4 border-t space-y-2">
                <h3 className="font-semibold text-white">Existing Categories</h3>
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-400">No categories found.</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat._id} className="flex justify-between items-center p-2 rounded-md border">
                      <span className="text-sm">{cat.name}</span>
                      <div className="flex space-x-2">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={() => {
                            setCategoryFormData({ name: cat.name });
                            setCurrentCategory(cat);
                            setIsCategoryEditMode(true);
                          }}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="destructive" 
                          onClick={() => handleDeleteCategory(cat._id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </ThemeProvider>
  );
}
