"use client"

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Download, Edit, Trash2, PlusCircle, X, Search, Sparkles, FolderPlus, ArrowLeft, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { TopNav } from "../../components/top-nav"
import { Sidebar } from "../../components/sidebar"
import { ThemeProvider } from "../../components/theme-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from '@/components/ui/textarea';
import Link from "next/link"

// Placeholder API URLs
const API_BASE_URL = 'http://localhost:5000/api/templates';
const CATEGORY_API_URL = 'http://localhost:5000/api/categories';

// Define types for data structures
interface Template {
    _id: string;
    title: string;
    description: string;
    category: string;
    // New property matching the backend schema
    image_urls?: string[];
    file_url?: string;
    complexity?: string;
    customFields?: number; // Not from backend, but kept for UI
    creator?: string;
    verified?: boolean; // Not from backend, but kept for UI
    createdAt?: string;
    usedCount?: number;
}

interface Category {
    _id: string;
    name: string;
}

interface FormDataState {
    title: string;
    description: string;
    category: string;
    creator: string;
    complexity: string;
    // New field for multiple image files
    thumbnails: File[] | null;
    templateZip: File | null;
}

// The main component
export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
    const [categoryFormData, setCategoryFormData] = useState({ name: '' });
    const [isCategoryEditMode, setIsCategoryEditMode] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    const [formData, setFormData] = useState<FormDataState>({
        title: '',
        description: '',
        category: '',
        creator: '',
        complexity: 'easy',
        thumbnails: null,
        templateZip: null,
    });

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
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

    // Fetch templates and categories on component load
    useEffect(() => {
        fetchTemplates();
        fetchCategories();
    }, []);

    // Handlers for form input changes
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCategoryInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCategoryFormData({ name: e.target.value });
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files) {
            if (name === 'thumbnails') {
                // Handle multiple files for thumbnails
                const fileList = Array.from(files);
                setFormData((prev) => ({ ...prev, [name]: fileList }));
            } else {
                // Handle single file for zip
                setFormData((prev) => ({ ...prev, [name]: files[0] }));
            }
        }
    };

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
            creator: '',
            complexity: 'easy',
            thumbnails: null,
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
            creator: template.creator || '',
            complexity: template.complexity || 'easy',
            thumbnails: null, // Reset thumbnails on edit
            templateZip: null,
        });
        setIsModalOpen(true);
    };

    // Open the details modal and fetch data
    const handleOpenDetails = async (template: Template) => {
        setIsDetailsModalOpen(true);
        setSelectedTemplate(null); // Clear previous data and show loading state
        
        try {
            const response = await fetch(`${API_BASE_URL}/${template._id}`);
            if (!response.ok) throw new Error('Failed to fetch template details');
            const detailedTemplate = await response.json();
            setSelectedTemplate(detailedTemplate);
        } catch (error) {
            console.error('Error fetching template details:', error);
            // You could set an error state here
        }
    };

    // Submit handler for the create/edit form
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('category', formData.category);
        data.append('creator', formData.creator);
        data.append('complexity', formData.complexity);
        
        // Append all thumbnail files
        if (formData.thumbnails) {
            formData.thumbnails.forEach((file) => {
                data.append('thumbnails', file);
            });
        }
        
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
            await fetchTemplates();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Submission error:', error);
        }
    };

    // Delete a template
    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        console.log('User confirmed deletion of template with id:', id);
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete template');
            await fetchTemplates();
        } catch (error) {
            console.error('Error deleting template:', error);
        }
    };

    // Download a template
    const handleDownload = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const downloadUrl = `${API_BASE_URL}/download/${id}`;
        window.open(downloadUrl, '_blank');
    };

    // CRUD handlers for categories
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
        console.log('User confirmed deletion of category with id:', id);
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
    const filteredTemplates = templates.filter(template => {
        const matchesCategory = activeCategory === 'All' || template.category === activeCategory;
        const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.category.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Helper function for complexity badge color
    const getComplexityColor = (complexity: string | undefined) => {
        if (!complexity) return 'bg-gray-500';
        switch (complexity.toLowerCase()) {
            case 'easy':
                return 'bg-green-500 hover:bg-green-400';
            case 'medium':
                return 'bg-yellow-500 hover:bg-yellow-400';
            case 'hard':
                return 'bg-red-500 hover:bg-red-400';
            default:
                return 'bg-gray-500 hover:bg-gray-400';
        }
    };

    // The template card component
    const TemplateCard = ({ template }: { template: Template }) => (
        <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-background"
            onClick={() => handleOpenDetails(template)}
        >
            <CardContent className="p-0">
                <div className="relative">
                    <Badge className="absolute top-2 left-2 bg-gray-800 text-white hover:bg-gray-900">
                        Intelligent
                    </Badge>
                    <img
                        // Use the first image from the new image_urls array
                        src={template.image_urls && template.image_urls.length > 0 ? `http://localhost:5000${template.image_urls[0]}` : 'https://placehold.co/400x200/2f4f4f/ffffff?text=No+Image'}
                        alt={template.title}
                        className="w-full aspect-video object-cover rounded-t-lg"
                    />
                </div>
                <div className="p-4">
                    <h4 className="font-medium truncate">{template.title}</h4>
                    <p className="text-sm text-gray-400 truncate">{template.category}</p>
                    <div className="flex justify-between items-center mt-4">
                        <Button
                            onClick={(e) => handleDownload(template._id, e)}
                            className="px-2 py-1 h-auto text-xs dark:bg-background dark:text-white"
                            variant="outline"
                        >
                            <Download size={14} className="mr-1" /> Download
                        </Button>
                        <div className="flex space-x-2">
                            <Button
                                onClick={(e) => { e.stopPropagation(); handleEdit(template); }}
                                size="icon"
                                variant="outline"
                                className="dark:bg-background dark:text-white"
                            >
                                <Edit size={16} />
                            </Button>
                            <Button
                                onClick={(e) => handleDelete(template._id, e)}
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
    
    // Simple image slider component
    const ImageSlider = ({ images }: { images: string[] }) => {
        const [currentImageIndex, setCurrentImageIndex] = useState(0);

        const nextImage = () => {
            setCurrentImageIndex((prevIndex) => 
                (prevIndex + 1) % images.length
            );
        };

        const prevImage = () => {
            setCurrentImageIndex((prevIndex) => 
                (prevIndex - 1 + images.length) % images.length
            );
        };
        
        return (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <img
                    src={`http://localhost:5000${images[currentImageIndex]}`}
                    alt={`Template image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                    <>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={prevImage} 
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-900/50 hover:bg-gray-800/75 text-white"
                        >
                            <ChevronLeft size={24} />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={nextImage} 
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900/50 hover:bg-gray-800/75 text-white"
                        >
                            <ChevronRight size={24} />
                        </Button>
                    </>
                )}
            </div>
        );
    };


    const TemplateDetailsModal = ({ template, onClose }: { template: Template | null, onClose: () => void }) => {
        if (!template) {
            return (
                <div className="fixed inset-0 z-50 bg-background bg-opacity-90 flex items-center justify-center">
                    <div className="text-white text-lg flex flex-col items-center">
                        <svg className="animate-spin h-8 w-8 text-white mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading template details...
                    </div>
                </div>
            );
        }
        
        return ( 
            <div className="fixed inset-0 z-50 bg-background bg-opacity-90 flex items-center justify-center"> 
                <div className="bg-background text-white w-full h-full p-0 flex flex-col"> 
                    {/* Header */} 
                    <div className="flex items-center justify-between p-6 border-b border-gray-800"> 
                        <div className="flex items-center gap-4"> 
                            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-gray-800"> 
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back 
                            </Button> 
                            <h1 className="text-xl font-semibold">Template Center</h1> 
                        </div> 
                        <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-gray-800"> 
                            <X className="w-5 h-5" /> 
                        </Button> 
                    </div> 
                    {/* Content */} 
                    <div className="flex-1 p-6 overflow-y-auto"> 
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"> 
                            {/* Left Column - Template Preview */} 
                            <div className="lg:col-span-1"> 
                                {template.image_urls && template.image_urls.length > 0 ? (
                                    <ImageSlider images={template.image_urls} />
                                ) : (
                                    <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                                        No images available
                                    </div>
                                )}
                            </div> 
                            {/* Middle Column - Template Details */} 
                            <div className="lg:col-span-1 space-y-6"> 
                                <div> 
                                    <div className="flex items-start gap-3 mb-4"> 
                                        <div className="w-12 h-12 bg-white text-black rounded-lg flex items-center justify-center"> 
                                            <CheckCircle className="w-6 h-6 text-black" /> 
                                        </div> 
                                        <div className="flex-1"> 
                                            <h2 className="text-2xl font-bold mb-2">{template.title}</h2> 
                                            {template.complexity && <Badge className={getComplexityColor(template.complexity)}>Complexity: {template.complexity}</Badge>} 
                                        </div> 
                                        <Button className="bg-white hover:bg-gray-100 text-black">Use Template</Button> 
                                    </div> 
                                </div> 
                                <div> 
                                    <h3 className="text-lg font-semibold mb-3">Template Description</h3> 
                                    <p className="text-gray-300 min-h-20 min-w-20 le55llading-relaxed">{template.description}</p> 
                                </div> 
                                <div className="border-t border-gray-800 pt-6"> 
                                    <h3 className="text-lg font-semibold mb-4">Template includes</h3> 
                                    <div className="space-y-3"> 
                                        <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg"> 
                                            <div className="flex items-center gap-3"> 
                                                <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center"> 
                                                    <CheckCircle className="w-4 h-4 text-white" /> 
                                                </div> 
                                                <div> 
                                                    <p className="font-medium">Custom Fields</p> 
                                                    <p className="text-sm text-gray-400">{template.customFields} Custom Fields included</p> 
                                                </div> 
                                            </div> 
                                            <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" /> 
                                        </div> 
                                    </div> 
                                </div> 
                            </div> 
                            {/* Right Column - Template Info */} 
                            <div className="lg:col-span-1 space-y-6"> 
                                <div className="bg-gray-900 rounded-lg p-4"> 
                                    <div className="flex items-center gap-3 mb-4"> 
                                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center"> 
                                            <CheckCircle className="w-4 h-4 text-black" /> 
                                        </div> 
                                        <div> 
                                            <p className="font-semibold">By {template.creator}</p> 
                                            {template.verified && ( 
                                                <div className="flex items-center gap-1 text-sm text-blue-400"> 
                                                    <CheckCircle className="w-3 h-3" /> Verified 
                                                </div> 
                                            )} 
                                        </div> 
                                    </div> 
                                    <p className="text-sm text-gray-400">This template was built by the {template.creator} Crew!</p> 
                                </div> 
                                <div className="space-y-4"> 
                                    <div> 
                                        <p className="text-sm font-medium text-gray-400 mb-1">CREATED DATE</p> 
                                        <p className="text-white">{template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'N/A'}</p> 
                                    </div> 
                                    <div> 
                                        <p className="text-sm font-medium text-gray-400 mb-1">TEMPLATE USED</p> 
                                        <p className="text-white">{template.usedCount} times</p> 
                                    </div> 
                                    <div> 
                                        <p className="text-sm font-medium text-gray-400 mb-1">CATEGORY</p> 
                                        <p className="text-white">{template.category}</p> 
                                    </div> 
                                </div> 
                            </div> 
                        </div> 
                    </div> 
                </div> 
            </div> 
        )
    };

    return (
        <ThemeProvider>
            <div className="min-h-screen">
                <TopNav />
                <div className="flex">
                    <Sidebar isCollapsed={isCollapsed} />
                    <div className="w-64 border-r h-[calc(100vh-4rem)] p-4 space-y-6 dark:bg-background">
                        <h3 className="font-semibold mb-2 px-3">Filter by Category</h3>
                        <Button
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="w-full flex items-center justify-start space-x-2 px-3 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <FolderPlus size={16} />
                            <span>Manage Categories</span>
                        </Button>
                        <div className="pt-4 border-t ">
                            <h3 className="font-semibold mb-2 px-3">BY USE CASE</h3>
                            <button
                                onClick={() => setActiveCategory('All')}
                                className={`w-full text-left px-3 py-2 my-1 rounded-lg transition-colors hover:bg-gray-800 ${activeCategory === 'All' ? 'bg-gray-800 font-bold' : ''}`}
                            >
                                All
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat._id}
                                    onClick={() => setActiveCategory(cat.name)}
                                    className={`w-full text-left px-3 py-2 my-1 rounded-lg transition-colors hover:bg-gray-800 ${activeCategory === cat.name ? 'bg-gray-800 font-bold' : ''}`}
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
                                        className="pl-10 dark:bg-background "
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                                <Button
                                    onClick={handleAddTemplate}
                                    className="flex items-center space-x-2 px-4 py-2 bg-white text-black rounded-md hover:bg-gray-100 transition-colors shadow-lg"
                                >
                                    <PlusCircle size={20} />
                                    <span>Add Template</span>
                                </Button>
                            </div>

                            <Card className="bg-gray-50 border dark:bg-background ">
                                <CardContent className="p-8">
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-4">
                                            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                                                Intelligent templates are here to explore
                                                <Sparkles className="text-white" />
                                            </h2>
                                            <p className="text-gray-400">
                                                Achieve more with AI-powered workflows, integrations and intelligent widgets.
                                            </p>
                                            <Button className="bg-white text-black hover:bg-gray-100">Explore templates</Button>
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
                <div className="fixed inset-0 bg-background bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <Card className="rounded-xl p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative dark:bg-background dark:border-gray-800">
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
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-background dark:text-white"
                                />
                            </div>
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleSelectChange}
                                    className="flex min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-background dark:text-white"
                                    required
                                >
                                    <option value="" disabled>Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat.name}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="creator">Creator</Label>
                                <Input
                                    type="text"
                                    id="creator"
                                    name="creator"
                                    value={formData.creator}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Team A"
                                />
                            </div>
                            <div>
                                <Label htmlFor="complexity">Complexity</Label>
                                <select
                                    id="complexity"
                                    name="complexity"
                                    value={formData.complexity}
                                    onChange={handleSelectChange}
                                    className="flex min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-background dark:text-white"
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="thumbnails">Thumbnail Image(s)</Label>
                                <Input
                                    type="file"
                                    id="thumbnails"
                                    name="thumbnails"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    multiple // Allow multiple file selection
                                    required={!isEditMode || !currentTemplate?.image_urls}
                                />
                            </div>
                            {/* The "Additional Preview Images" field is now removed */}
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

            {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-background bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <Card className="rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative dark:bg-background ">
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
                            <div className="flex items-end space-x-2">
                                <div className="flex-1">
                                    <Label htmlFor="categoryName">Category Name</Label>
                                    <Input 
                                        id="categoryName"
                                        type="text"
                                        value={categoryFormData.name}
                                        onChange={handleCategoryInputChange}
                                        placeholder="e.g., Marketing"
                                        className="dark:bg-background dark:border-gray-700 dark:text-white"
                                    />
                                </div>
                                <Button onClick={isCategoryEditMode ? handleEditCategory : handleAddCategory} className="bg-white text-black">
                                    {isCategoryEditMode ? 'Update' : 'Add'}
                                </Button>
                            </div>
                            {isCategoryEditMode && (
                                <Button variant="outline" onClick={() => { setIsCategoryEditMode(false); setCategoryFormData({ name: '' }); }} className="w-full text-black">
                                    Cancel Edit
                                </Button>
                            )}
                            
                            <ul className="space-y-2 mt-4">
                                {categories.map((cat) => (
                                    <li key={cat._id} className="flex justify-between items-center bg-gray-900 rounded-lg p-3 text-white">
                                        <span>{cat.name}</span>
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
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Card>
                </div>
            )}
            
            {isDetailsModalOpen && <TemplateDetailsModal template={selectedTemplate} onClose={() => setIsDetailsModalOpen(false)} />}
        </ThemeProvider>
    );
}