"use client"

import { useState } from "react"
import { TopNav } from "../../components/top-nav"
import { Sidebar } from "../../components/sidebar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeProvider } from "../../components/theme-provider"
import { CalendarDays, User, Tag, ArrowRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const blogPosts = [
  {
    title: "Getting Started with AI-Powered Development",
    date: "2023-05-15",
    author: "Maria Rodriguez",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    excerpt:
      "Learn how to leverage AI in your development workflow to boost productivity and create more innovative solutions.",
    tags: ["AI", "Development", "Productivity"],
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    title: "10 Must-Have Tools for Modern Developers",
    date: "2023-05-10",
    author: "Alex Chen",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    excerpt:
      "Discover the essential tools that every developer should have in their toolkit to streamline their workflow and improve code quality.",
    tags: ["Tools", "Development", "Productivity"],
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    title: "The Future of Web Development: Trends to Watch",
    date: "2023-05-05",
    author: "Samantha Lee",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    excerpt:
      "Explore the upcoming trends that will shape the future of web development, from new frameworks to innovative design patterns.",
    tags: ["Web Development", "Trends", "Future"],
    image: "/placeholder.svg?height=200&width=400",
  },
]

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPosts = blogPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-foreground mb-8">Blog</h1>
              <div className="mb-8 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search blog posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="space-y-8">
                {filteredPosts.map((post, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="md:flex">
                      <div className="md:w-1/3">
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="md:w-2/3 p-6">
                        <CardHeader className="p-0">
                          <CardTitle className="text-2xl font-bold mb-2">{post.title}</CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center">
                              <CalendarDays className="mr-1 h-4 w-4" />
                              {post.date}
                            </div>
                            <div className="flex items-center">
                              <User className="mr-1 h-4 w-4" />
                              {post.author}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                <Tag className="mr-1 h-3 w-3" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="p-0 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar>
                              <AvatarImage src={post.authorAvatar} />
                              <AvatarFallback>
                                {post.author
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{post.author}</span>
                          </div>
                          <Button variant="ghost">
                            Read More
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
