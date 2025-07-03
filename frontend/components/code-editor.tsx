"use client"

import "./code-editor.css"
import { useState, useCallback, useMemo, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MonacoEditor from "@monaco-editor/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export function CodeEditor() {
  const [code, setCode] = useState(`import React from 'react';

function App() {
  return (
    <div>
      <h1>Hello, World!</h1>
    </div>
  );
}

export default App;`)
  const [language, setLanguage] = useState("javascript")
  const [theme, setTheme] = useState("vs-dark")
  const [activeTab, setActiveTab] = useState("editor")
  const [editorDimensions, setEditorDimensions] = useState({ width: "100%", height: "100%" })

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setCode(value)
    }
  }, [])

  const handleLanguageChange = useCallback((value: string) => {
    setLanguage(value)
  }, [])

  const handleThemeChange = useCallback((value: string) => {
    setTheme(value)
  }, [])

  const handleSave = useCallback(() => {
    // TODO: Implement save functionality
    console.log("Code saved")
  }, [])

  const editorOptions = useMemo(
    () => ({
      minimap: { enabled: true },
      fontSize: 14,
      wordWrap: "on",
      automaticLayout: true,
      suggestOnTriggerCharacters: true,
      snippetSuggestions: "on",
      formatOnPaste: true,
      formatOnType: true,
    }),
    [],
  )

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    const resizeHandler = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setEditorDimensions({ width: "100%", height: "100%" })
      }, 100)
    }
    window.addEventListener("resize", resizeHandler)
    return () => {
      window.removeEventListener("resize", resizeHandler)
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-2 border-b">
        <div className="flex space-x-2">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="css">CSS</SelectItem>
            </SelectContent>
          </Select>
          <Select value={theme} onValueChange={handleThemeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vs-dark">Dark</SelectItem>
              <SelectItem value="vs-light">Light</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-grow">
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="editor" className="flex-grow overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={75}>
              <div className="monaco-editor-container">
                <MonacoEditor
                  height={editorDimensions.height}
                  width={editorDimensions.width}
                  language={language}
                  theme={theme}
                  value={code}
                  onChange={handleEditorChange}
                  options={editorOptions}
                />
              </div>
            </ResizablePanel>
            <ResizablePanel defaultSize={25}>
              <ScrollArea className="h-full p-4">
                <h3 className="text-lg font-semibold mb-2">File Explorer</h3>
                {/* Add file explorer component here */}
              </ScrollArea>
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabsContent>
        <TabsContent value="preview" className="flex-grow">
          <ScrollArea className="h-full">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">Preview</h3>
              {/* Add preview component here */}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
