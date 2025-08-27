"use client"

import { useState, useEffect, ChangeEvent, FormEvent } from "react"
// Adjusted import paths to be relative to the project root for better compatibility
import { TopNav } from "@/components/top-nav"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeProvider } from "@/components/theme-provider"
import { CalendarDays, User, Tag, ArrowRight, Search, Plus, Edit, ArrowLeft, Trash2, Loader2, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// --- Main Blog Page Component ---

// Use an environment variable for the API base URL for better configuration management
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/blogs"
const BASE_URL = API_BASE_URL.replace('/api/blogs', '');

// Update the interface to match the backend schema
interface BlogPost {
  _id: string
  title: string
  createdAt: string
  author: string
  authorAvatar?: string
  excerpt: string
  content: string
  tags: string[]
  image?: string // The URL of the uploaded image from the backend
  slug: string; // Add slug as per backend schema
  date: string; // Add date as per backend schema
}

export default function BlogPage() {
  // State for search and data fetching
  const [searchTerm, setSearchTerm] = useState("")
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State for modals and forms
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)

  // State for form data (text inputs)
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    tags: "", // Storing as a single comma-separated string for input field
    author: "" // Added new author field
  })
  
  // State for image file handling
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  // State for API errors
  const [apiError, setApiError] = useState<string | null>(null)

  // Effect to handle URL.createObjectURL for image preview and cleanup
  useEffect(() => {
    if (selectedImageFile) {
      const url = URL.createObjectURL(selectedImageFile)
      setImagePreviewUrl(url)
      // Cleanup the URL object when the component unmounts or the file changes
      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setImagePreviewUrl(null)
    }
  }, [selectedImageFile])

  // --- API CALLS ---

  // READ: Fetch all blog posts from the API
  const fetchBlogPosts = async () => {
    setIsLoading(true)
    setApiError(null)
    try {
      const response = await fetch(API_BASE_URL)
      if (!response.ok) {
        throw new Error("Failed to fetch blog posts.")
      }
      const data: BlogPost[] = await response.json()
      setBlogPosts(data)
    } catch (err: any) {
      console.error("Error fetching data:", err)
      setApiError(err.message || "Could not load blog posts.")
    } finally {
      setIsLoading(false)
    }
  }

  // Effect hook to fetch data on component mount
  useEffect(() => {
    fetchBlogPosts()
  }, [])

  // CREATE: Create a new blog post with file upload
  const handleCreateBlog = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setApiError(null)
    
    // Check if an image is selected as it's required by the backend
    if (!selectedImageFile) {
      setApiError("Image file is required.");
      setIsSubmitting(false);
      return;
    }

    // Using FormData to handle both text fields and the image file
    const postData = new FormData()
    postData.append("title", formData.title)
    postData.append("excerpt", formData.excerpt)
    postData.append("content", formData.content)
    // Sending tags as a simple comma-separated string as required by the backend
    postData.append("tags", formData.tags)
    postData.append("author", formData.author)
    
    // Append the image file with the field name 'image' as per multer configuration
    postData.append("image", selectedImageFile)

    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        // Do NOT set Content-Type header; the browser will set it correctly for FormData
        body: postData,
      })

      if (!response.ok) {
        // Parse the error message from the backend
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create blog post.")
      }

      // Re-fetch all posts to update the UI
      fetchBlogPosts()
      // Reset form and close modal
      setFormData({ title: "", excerpt: "", content: "", tags: "", author: "" })
      setSelectedImageFile(null)
      setIsCreateModalOpen(false)
    } catch (err: any) {
      console.error("Error creating blog post:", err)
      setApiError(err.message || "Error creating blog post. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // UPDATE: Edit an existing blog post with optional file upload
  const handleEditBlog = async (e: FormEvent) => {
    e.preventDefault()
    if (!editingPost) return
    setIsSubmitting(true)
    setApiError(null)

    // Using FormData for updates as well
    const postData = new FormData()
    postData.append("title", formData.title)
    postData.append("excerpt", formData.excerpt)
    postData.append("content", formData.content)
    // Sending tags as a simple comma-separated string as required by the backend
    postData.append("tags", formData.tags)
    postData.append("author", formData.author)
    
    // Only append the image if a new one is selected
    if (selectedImageFile) {
      postData.append("image", selectedImageFile)
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${editingPost._id}`, {
        method: "PUT",
        body: postData,
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update blog post.")
      }

      // Re-fetch all posts to update the UI
      fetchBlogPosts()
      // Reset form and close modal
      setFormData({ title: "", excerpt: "", content: "", tags: "", author: "" })
      setSelectedImageFile(null)
      setIsEditModalOpen(false)
      setEditingPost(null)
    } catch (err: any) {
      console.error("Error updating blog post:", err)
      setApiError(err.message || "Error updating blog post. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // DELETE: Delete a blog post
  const handleDeleteBlog = async () => {
    if (!postToDelete) return
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/${postToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete blog post.")
      }

      // Filter the posts array to remove the deleted post
      setBlogPosts(blogPosts.filter((post) => post._id !== postToDelete))
      setIsDeleteModalOpen(false)
      setPostToDelete(null)
    } catch (err: any) {
      console.error("Error deleting blog post:", err)
      setApiError(err.message || "Error deleting blog post. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open modals and set initial state
  const openEditModal = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({ 
      title: post.title, 
      excerpt: post.excerpt, 
      content: post.content, 
      tags: post.tags.join(", "), 
      author: post.author 
    })
    // For edit, we show the existing image preview from the database
    setImagePreviewUrl(`${BASE_URL}${post.image}`)
    setSelectedImageFile(null) // Clear any previously selected file
    setIsEditModalOpen(true)
  }

  const openCreateModal = () => {
    setFormData({ title: "", excerpt: "", content: "", tags: "", author: "" })
    setSelectedImageFile(null)
    setImagePreviewUrl(null);
    setIsCreateModalOpen(true)
  }

  const openDeleteModal = (postId: string) => {
    setPostToDelete(postId);
    setIsDeleteModalOpen(true);
  }
  
  const filteredPosts = blogPosts.filter(
    (post) => post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) || post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Blog Detail View
  if (selectedPost) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen bg-background">
          <TopNav />
          <div className="flex">
            <Sidebar isCollapsed={false} />
            <main className="flex-1 p-6 lg:p-8">
              <div className="max-w-4xl mx-auto">
                <Button onClick={() => setSelectedPost(null)} variant="ghost" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blogs
                </Button>
                <article className="prose dark:prose-invert">
                  <h1 className="text-4xl font-bold tracking-tight lg:text-5xl mb-4">
                    {selectedPost.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-muted-foreground mb-6">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{selectedPost.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CalendarDays className="w-4 h-4" />
                      <span>{new Date(selectedPost.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedPost.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {selectedPost.image && (
                    <img
                      src={`${BASE_URL}${selectedPost.image}`}
                      alt={selectedPost.title}
                      className="w-full rounded-md object-cover aspect-video mb-6"
                    />
                  )}
                  <div className="blog-content" dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
                </article>
              </div>
            </main>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background text-foreground">
        <TopNav />
        <div className="flex">
          <Sidebar isCollapsed={false} />
          <main className="flex-1 p-6 lg:p-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight">Blog Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage all your blog posts here.</p>
              </div>
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search blogs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full"
                  />
                </div>
                <Button onClick={openCreateModal}>
                  <Plus className="mr-2 h-4 w-4" /> Create Blog
                </Button>
              </div>
            </header>

            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            
            {apiError && (
              <div className="flex items-center justify-center p-8">
                <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                <span className="text-red-500">{apiError}</span>
              </div>
            )}

            {!isLoading && !apiError && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <Card key={post._id} className="group overflow-hidden relative">
                      <img
                        src={`${BASE_URL}${post.image}`}
                        alt={post.title}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <CardHeader>
                        <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {post.excerpt}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <User className="w-4 h-4 mr-1" />
                          <span>{post.author}</span>
                          <span className="mx-2">·</span>
                          <CalendarDays className="w-4 h-4 mr-1" />
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(post)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => openDeleteModal(post._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedPost(post)}>
                          Read More <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-1 md:col-span-3 text-center text-muted-foreground p-8">
                    No blog posts found.
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-auto ">
          <DialogHeader>
            <DialogTitle>Create New Blog Post</DialogTitle>
            <DialogDescription>
              Fill out the details to create a new blog post.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateBlog}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter blog title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  name="author"
                  placeholder="Enter author name"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  placeholder="A short summary of the blog post"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Write your blog content here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={10}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  placeholder="e.g., react, javascript, coding"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  onChange={(e) => setSelectedImageFile(e.target.files ? e.target.files[0] : null)}
                  required={!editingPost}
                />
                {imagePreviewUrl && (
                  <div className="mt-2">
                    <img src={imagePreviewUrl} alt="Image Preview" className="w-full h-48 object-cover rounded-md" />
                  </div>
                )}
              </div>
              {apiError && (
                <div className="text-red-500 text-center text-sm p-2 bg-red-100 dark:bg-red-900 rounded-md">
                  <AlertCircle className="inline h-4 w-4 mr-2" />
                  {apiError}
                </div>
              )}
            </div>
            <DialogFooter className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Blog
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[800px]  max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>
              Update the details of this blog post.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditBlog}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter blog title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  name="author"
                  placeholder="Enter author name"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  placeholder="A short summary of the blog post"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Write your blog content here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={10}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  placeholder="e.g., react, javascript, coding"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  onChange={(e) => setSelectedImageFile(e.target.files ? e.target.files[0] : null)}
                />
                {imagePreviewUrl && (
                  <div className="mt-2">
                    <img src={imagePreviewUrl} alt="Image Preview" className="w-full h-48 object-cover rounded-md" />
                  </div>
                )}
              </div>
              {apiError && (
                <div className="text-red-500 text-center text-sm p-2 bg-red-100 dark:bg-red-900 rounded-md">
                  <AlertCircle className="inline h-4 w-4 mr-2" />
                  {apiError}
                </div>
              )}
            </div>
            <DialogFooter className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Blog
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBlog} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  )
}
