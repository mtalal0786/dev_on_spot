"use client"

import { TopNav } from "@/components/top-nav"
import { Sidebar } from "@/components/sidebar"
import { DesignInterface } from "@/components/design-interface"
import { BackendEditor } from "@/components/backend-editor"
import { Whiteboard } from "@/components/whiteboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DesignPage() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="flex">
        <Sidebar isCollapsed={false} />
        <main className="flex-1">
          <Tabs defaultValue="frontend">
            <TabsList>
              <TabsTrigger value="frontend">Frontend</TabsTrigger>
              <TabsTrigger value="backend">Backend</TabsTrigger>
              <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
            </TabsList>
            <TabsContent value="frontend">
              <DesignInterface
                projectName="Your Project Name"
                projectType="website"
                techStack={["React", "Next.js"]}
                requirements={[
                  { id: "1", description: "User authentication system" },
                  { id: "2", description: "Data storage and retrieval" },
                  { id: "3", description: "User interface design" },
                ]}
              />
            </TabsContent>
            <TabsContent value="backend">
              <BackendEditor />
            </TabsContent>
            <TabsContent value="whiteboard">
              <Whiteboard />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
