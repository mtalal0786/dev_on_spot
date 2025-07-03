// pages/index.js (or app/page.js for App Router)
"use client"; // Required for Next.js 13+ with React Server Components
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
} from '@codesandbox/sandpack-react';
import { dracula } from '@codesandbox/sandpack-themes'; // A dark theme similar to the screenshots
import {
  CheckCircle,
  Circle,
  FileText,
  Folder,
  Play,
  Download,
  Share2,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Search,
  Zap,
} from 'lucide-react'; // Using lucide-react for icons

// Define the initial files for the Sandpack editor
const initialFiles = {
  '/index.html': `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dev on Spot - Transform Ideas Into Web Apps Instantly</title>
  <meta name="description" content="The most advanced AI-powered development platform. Turn your natural language descriptions into production-ready applications in seconds.">
  <meta property="og:title" content="Dev on Spot - AI-Powered Web Development" />
  <meta property="og:description" content="Transform ideas into web applications instantly with our cutting-edge SaaS platform." />
  <meta property="og:url" content="https://bolt.new/" />
  <meta property="og:image" content="https://bolt.new/og-image.jpg" />
  <link rel="stylesheet" href="./index.css">
</head>
<body>
  <div id="root" class="min-h-screen flex items-center justify-center bg-gray-900 text-white">
    <div class="text-center p-8">
      <h1 class="text-5xl font-bold mb-4">Transform Ideas Into <br><span class="text-purple-400">Web Apps Instantly</span></h1>
      <p class="text-lg mb-8 max-w-2xl mx-auto">The most advanced AI-powered development platform. Turn your natural language descriptions into production-ready applications in seconds.</p>
      <div class="flex justify-center space-x-4">
        <button class="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
          Start Building Now
        </button>
        <button class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
          Watch Demo
        </button>
      </div>
    </div>
  </div>
  <script src="./main.js"></script>
</body>
</html>
  `,
  '/index.css': `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles for the app */
html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-feature-settings: 'cv03', 'cv04', 'cv11';
  font-feature-settings: 'cv03', 'cv04', 'cv11';
  background-color: #0f0f0f; /* Dark background */
  color: #e0e0e0; /* Light text color */
}

/* Sandpack overrides for better integration */
.sp-wrapper {
  border-radius: 0.75rem; /* rounded-xl */
  overflow: hidden;
}

.sp-layout {
  border-radius: 0.75rem;
  overflow: hidden;
}

.sp-editor {
  border-radius: 0.75rem;
}

.sp-preview {
  border-radius: 0.75rem;
}

/* Ensure the Sandpack theme applies correctly */
.sp-root {
  --sp-syntax-string: #a5d6ff; /* Example: Adjust string color in dracula theme */
  --sp-syntax-keyword: #ffcb6b; /* Example: Adjust keyword color */
  --sp-syntax-comment: #6a737d; /* Example: Adjust comment color */
  --sp-colors-surface1: #1a1a1a; /* Background of editor */
  --sp-colors-surface2: #242424; /* Background of file explorer */
  --sp-colors-surface3: #333333; /* Background of tabs/headers */
  --sp-colors-base: #e0e0e0; /* Default text color */
  --sp-colors-accent: #8a2be2; /* Accent color for highlights */
}
  `,
  '/main.js': `
// This is a placeholder for your main JavaScript logic.
// You can add interactive elements here.
console.log("Hello from main.js!");
  `,
  '/App.tsx': `
import React from 'react';

function App() {
  return (
    <div className="text-center p-8 bg-gray-800 text-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4">Welcome to Bolt!</h1>
      <p className="text-md">Your app is running in the Sandpack environment.</p>
    </div>
  );
}

export default App;
  `,
};

export default function Home() {
  const [checklist, setChecklist] = useState({
    createFiles: true,
    installDependencies: true,
    updateAppTsx: false,
    updateIndexHtml: true,
    updateIndexCss: true,
    startApplication: false,
  });

  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [activeTab, setActiveTab] = useState('code'); // New state for active tab: 'code' or 'preview'

  // Function to simulate LLM API call
  const generateCode = async () => {
    if (!prompt.trim()) {
      setModalMessage("Please enter a prompt to generate code.");
      setShowGenerationModal(true);
      return;
    }

    setIsLoading(true);
    setGeneratedCode(''); // Clear previous generation
    setModalMessage("Generating code...");
    setShowGenerationModal(true);

    try {
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: `Generate a simple HTML structure for: ${prompt}` }] });

      const payload = { contents: chatHistory };
      const apiKey = ""; // Canvas will provide this at runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setGeneratedCode(text);
        setModalMessage("Code generated successfully!");
      } else {
        setModalMessage("Failed to generate code. Please try again.");
        console.error("Unexpected API response structure:", result);
      }
    } catch (error) {
      setModalMessage("An error occurred during code generation.");
      console.error("Error generating code:", error);
    } finally {
      setIsLoading(false);
      // Keep modal open briefly to show success/failure, then close
      setTimeout(() => setShowGenerationModal(false), 3000);
    }
  };

  const handleCheckboxChange = (item) => {
    setChecklist((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col font-inter">
      <Head>
        <title>Bolt Code Editor</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      {/* Top Header Bar */}
      <header className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800 shadow-md">
        <div className="flex items-center space-x-4">
          <div className="text-purple-500 font-bold text-xl">bolt</div>
          <span className="text-gray-400">|</span>
          <span className="text-lg font-medium">Dev on Spot - Modern SaaS Landing Page</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
            <span>Integrations</span>
            <ChevronDown size={16} />
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
            <span>Export</span>
            <Download size={16} />
          </button>
          <button className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition-colors">
            Deploy
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-1/3 min-w-[300px] max-w-[400px] bg-gray-900 p-6 flex flex-col border-r border-gray-800 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-6 text-white">Dev on Spot - Modern SaaS Landing Page</h2>

          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-2">
              {checklist.createFiles ? <CheckCircle size={20} className="text-green-500" /> : <Circle size={20} className="text-gray-600" />}
              <span className={checklist.createFiles ? 'text-gray-400' : 'text-white'}>Create initial files</span>
            </div>
            <div className="flex items-center space-x-2">
              {checklist.installDependencies ? <CheckCircle size={20} className="text-green-500" /> : <Circle size={20} className="text-gray-600" />}
              <span className={checklist.installDependencies ? 'text-gray-400' : 'text-white'}>Install dependencies</span>
            </div>
            <div className="bg-gray-800 rounded-md p-3 text-sm text-gray-300 font-mono flex items-center justify-between">
              <span>npm install</span>
              <button className="text-gray-400 hover:text-white" onClick={() => handleCheckboxChange('installDependencies')}>
                <Play size={16} />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {checklist.updateAppTsx ? <CheckCircle size={20} className="text-green-500" /> : <Circle size={20} className="text-gray-600" />}
              <span className={checklist.updateAppTsx ? 'text-gray-400' : 'text-white'}>Update <span className="font-mono">src/App.tsx</span></span>
            </div>
            <div className="flex items-center space-x-2">
              {checklist.updateIndexHtml ? <CheckCircle size={20} className="text-green-500" /> : <Circle size={20} className="text-gray-600" />}
              <span className={checklist.updateIndexHtml ? 'text-gray-400' : 'text-white'}>Update <span className="font-mono">index.html</span></span>
            </div>
            <div className="flex items-center space-x-2">
              {checklist.updateIndexCss ? <CheckCircle size={20} className="text-green-500" /> : <Circle size={20} className="text-gray-600" />}
              <span className={checklist.updateIndexCss ? 'text-gray-400' : 'text-white'}>Update <span className="font-mono">src/index.css</span></span>
            </div>

            <div className="flex items-center space-x-2">
              {checklist.startApplication ? <CheckCircle size={20} className="text-green-500" /> : <Circle size={20} className="text-gray-600" />}
              <span className={checklist.startApplication ? 'text-gray-400' : 'text-white'}>Start application</span>
            </div>
            <div className="bg-gray-800 rounded-md p-3 text-sm text-gray-300 font-mono flex items-center justify-between">
              <span>npm run dev</span>
              <button className="text-gray-400 hover:text-white" onClick={() => handleCheckboxChange('startApplication')}>
                <Play size={16} />
              </button>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-gray-800">
            <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-400 mb-2">How can Bolt help you today?</label>
            <div className="relative">
              <input
                id="prompt-input"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask for code, features, or help..."
                className="w-full p-3 pr-12 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={generateCode}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 p-2 rounded-full text-white transition-colors"
                title="Generate Code"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Zap size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Bottom Icons */}
          <div className="flex justify-around items-center mt-6 text-gray-500">
            <button className="hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800" title="Help Center">
              <HelpCircle size={20} />
            </button>
            <button className="hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800" title="Community">
              <MessageCircle size={20} />
            </button>
            <button className="hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800" title="Search">
              <Search size={20} />
            </button>
          </div>
        </aside>

        {/* Right Content Area (Sandpack Editor and Preview) */}
        <section className="flex-1 p-6 bg-gray-950 flex flex-col">
          <div className="flex-1 rounded-xl overflow-hidden shadow-xl">
            <SandpackProvider
              template="react"
              files={initialFiles}
              theme={dracula} // Using dracula theme for dark mode
              options={{
                editorHeight: '100%',
                editorWidth: '100%', // Make editor full width when only code is shown
                showLineNumbers: true,
                showTabs: true,
                showNavigator: true,
                showConsole: true,
                showErrorScreen: true,
                showLoadingScreen: true,
                wrapContent: true,
              }}
            >
              <SandpackLayout className="!rounded-xl !border-none">
                {/* Combined File Explorer, Editor, and Preview */}
                <div className="flex flex-1"> {/* This div now holds file explorer and editor/preview side-by-side */}
                  {/* File Explorer */}
                  <div className="w-1/4 min-w-[200px] max-w-[300px] bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto custom-scrollbar">
                    <h3 className="text-xs uppercase text-gray-400 mb-2">Project Files</h3>
                    <SandpackFileExplorer />
                  </div>

                  {/* Editor and Preview Container */}
                  <div className="flex-1 flex flex-col">
                    {/* Tabs for Code/Preview */}
                    <div className="flex border-b border-gray-700 bg-gray-800">
                      <button
                        className={`px-6 py-3 font-medium transition-colors ${
                          activeTab === 'code'
                            ? 'text-white border-b-2 border-purple-500'
                            : 'text-gray-400 hover:text-white'
                        }`}
                        onClick={() => setActiveTab('code')}
                      >
                        Code
                      </button>
                      <button
                        className={`px-6 py-3 font-medium transition-colors ${
                          activeTab === 'preview'
                            ? 'text-white border-b-2 border-purple-500'
                            : 'text-gray-400 hover:text-white'
                        }`}
                        onClick={() => setActiveTab('preview')}
                      >
                        Preview
                      </button>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      {/* Conditionally render Code Editor or Preview */}
                      {activeTab === 'code' && (
                        <SandpackCodeEditor
                          className="!h-full !w-full"
                          showLineNumbers
                          showTabs
                          showReadOnly={false}
                          wrapContent
                        />
                      )}
                      {activeTab === 'preview' && (
                        <div className="flex-1 overflow-hidden relative">
                          <SandpackPreview
                            className="!h-full !w-full"
                            showOpenInCodeSandbox={false} // Hide "Open in CodeSandbox" button
                            showRefreshButton={true}
                            showSandpackErrorOverlay={true}
                          />
                          {/* Overlay for "Your preview will appear here" if needed */}
                          {!initialFiles['/index.html'] && ( // Simple check if there's no initial content
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 text-gray-500 text-xl font-semibold">
                              Your preview will appear here
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SandpackLayout>
            </SandpackProvider>
          </div>
        </section>
      </main>

      {/* Code Generation Modal */}
      {showGenerationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Code Generation Status</h3>
            <p className="text-gray-300 mb-4">{modalMessage}</p>
            {isLoading && (
              <svg className="animate-spin h-8 w-8 text-purple-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {generatedCode && (
              <div className="mt-4 bg-gray-900 p-4 rounded-md text-left overflow-auto max-h-60">
                <pre className="whitespace-pre-wrap text-sm text-green-300">{generatedCode}</pre>
              </div>
            )}
            {!isLoading && (
              <button
                onClick={() => setShowGenerationModal(false)}
                className="mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
