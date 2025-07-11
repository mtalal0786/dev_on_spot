"use client"; // This directive is crucial for Next.js App Router components that use client-side features like useState, useEffect, useRouter.

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useSearchParams } from 'next/navigation'; // For App Router: get query params

import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
} from '@codesandbox/sandpack-react';
import { dracula } from '@codesandbox/sandpack-themes';
import {
  CheckCircle,
  Circle,
  Play,
  Download,
  Share2,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Search,
  Zap,
} from 'lucide-react';

// Define a minimal initial state for Sandpack files to prevent errors while loading
const initialLoadingFiles = {
  '/loading.txt': {
    code: 'Loading project files from the server...\n\nPlease wait while AI generates your application structure.',
    readOnly: true,
  },
};

export default function CodeEditorPage() { // Renamed from Home to be more descriptive
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [sandpackFiles, setSandpackFiles] = useState<{ [key: string]: { code: string; hidden?: boolean; readOnly?: boolean } }>(initialLoadingFiles);
  const [checklist, setChecklist] = useState({
    createFiles: false, // Will be true after backend response
    installDependencies: false, // Simulating, will be updated based on backend status
    updateAppTsx: false,
    updateIndexHtml: false,
    updateIndexCss: false,
    startApplication: false,
  });

  const [isLoading, setIsLoading] = useState(true); // Set to true initially to show loader on page load
  const [showGenerationModal, setShowGenerationModal] = useState(true); // Show modal immediately
  const [modalMessage, setModalMessage] = useState('Initializing project...');
  const [activeTab, setActiveTab] = useState('code');

  // Helper function to convert the backend's nested file structure to Sandpack's flat structure
  const transformBackendFilesToSandpack = useCallback((backendStructure: any[]): { [key: string]: { code: string; hidden?: boolean; readOnly?: boolean } } => {
    let files: { [key: string]: { code: string; hidden?: boolean; readOnly?: boolean } } = {};

    const processItem = (item: any) => {
      // The backend response already provides absolute paths like "/src/components/File.tsx"
      const fullPath = item.path;

      if (item.type === 'file') {
        files[fullPath] = {
          code: item.content || '', // Ensure content is a string, even if empty
          // You can add 'hidden: true' or 'readOnly: true' based on your logic if needed
        };
      } else if (item.type === 'folder' && item.children) {
        // For folders, recursively process their children.
        // Sandpack's FileExplorer infers folders from file paths,
        // so we don't explicitly add folder entries to `files`.
        item.children.forEach((child: any) => processItem(child));
      }
    };

    // Process all items from the backend structure
    backendStructure.forEach(item => processItem(item));

    // Add essential Next.js boilerplate files that are not part of the geminiResponse
    // but are required for a functional Next.js project and for Sandpack to display a complete tree.
    const boilerplateFiles: { [key: string]: { code: string; hidden?: boolean; readOnly?: boolean } } = {
      // Root-level files
      '/.gitignore': {
        code: `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local
.next
/out
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.idea
.vscode
*.iml
*.log
*.sqlite3
*.csv
*.xlsx
*.doc
*.docx
*.pdf
*.zip
*.tar.gz
*.rar
*.7z
*.bak
*.tmp
*.sublime-project
*.sublime-workspace`,
      },
      '/eslint.config.mjs': {
        code: `import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";

export default [
  {files: ["**/*.{js,mjs,cjs,ts,tsx}"], languageOptions: {globals: globals.browser}},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReactConfig,
];`,
      },
      '/next-env.d.ts': {
        code: `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.`,
      },
      '/next.config.ts': {
        code: `/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;`,
      },
      '/package.json': {
        code: JSON.stringify(
          {
            name: 'my-nextjs-app',
            version: '0.1.0',
            private: true,
            scripts: {
              dev: 'next dev',
              build: 'next build',
              start: 'next start',
              lint: 'next lint',
            },
            dependencies: {
              'react': '^18',
              'react-dom': '^18',
              'next': 'latest',
              'lucide-react': '^0.407.0', // Ensure lucide-react is included
            },
            devDependencies: {
              '@types/node': '^20',
              '@types/react': '^18',
              '@types/react-dom': '^18',
              'postcss': '^8',
              'tailwindcss': '^3.4.1',
              'typescript': '^5',
              'eslint': '^8',
              'eslint-config-next': 'latest',
              'typescript-eslint': '^7.1.1', // Ensure this is also present if used in eslint.config.mjs
              'globals': '^15.0.0', // For eslint.config.mjs
              'eslint-plugin-react': '^7.34.4', // For eslint.config.mjs
              '@eslint/js': '^9.7.0', // For eslint.config.mjs
            },
          },
          null,
          2
        ),
      },
      '/package-lock.json': {
        // Ideally, this should be generated by npm or provided by backend
        // For Sandpack, a minimal placeholder is often sufficient, or you can omit if not critical
        code: `{
          "name": "my-nextjs-app",
          "version": "0.1.0",
          "lockfileVersion": 3,
          "requires": true,
          "packages": {}
        }`,
        hidden: true, // Often hidden in explorers unless specifically needed
      },
      '/postcss.config.mjs': {
        code: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`,
      },
      '/README.md': {
        code: `# My Next.js Application

This project was generated by Bolt Code Editor.

## Getting Started

First, run the development server:

\`\`\`bash
npm run dev
# or yarn dev
# or pnpm dev
# or bun dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying \`app/page.tsx\`. The page auto-updates as you edit the file.

This project uses \`next/font\` to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-button) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
`,
      },
      '/tsconfig.json': {
        code: `{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`,
      },
      // Public directory files (with actual SVG content for better rendering)
      '/public/file.svg': { code: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L15 2z"/><path d="M14 2v6h6"/></svg>` },
      '/public/globe.svg': { code: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>` },
      '/public/next.svg': { code: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>` }, // A generic arrow for 'next'
      '/public/vercel.svg': { code: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle"><path d="M10.29 2.71c.6-.6 1.5-.6 2.1 0l8.5 8.5c.6.6.6 1.5 0 2.1l-8.5 8.5c-.6.6-1.5.6-2.1 0l-8.5-8.5c-.6-.6-.6-1.5 0-2.1z"/></svg>` }, // A generic triangle for 'vercel'
      '/public/window.svg': { code: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-monitor"><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M12 17v4"/><path d="M8 21h8"/></svg>` },

      // Essential src/app files that might not be generated by Gemini but are part of a Next.js app
      '/src/app/favicon.ico': {
        code: ``, // Binary file, keep empty or base64 encode if needed for preview
        hidden: true, // Often hidden in explorer
      },
      '/src/app/globals.css': {
        code: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}`,
      },
      '/src/app/layout.tsx': {
        code: `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}`,
      },
      // Ensure 'src/app' and 'src/components' are implicitly handled by their child files.
      // We don't need explicit folder entries in Sandpack's 'files' prop.
    };

    // Merge boilerplate files with dynamically generated files.
    // Dynamically generated files (from `geminiResponse`) will override boilerplate if they have the same path.
    return { ...boilerplateFiles, ...files };
  }, []);

  // useEffect to fetch data from your backend
  useEffect(() => {
    const fetchProjectFiles = async () => {
      if (!projectId) {
        setModalMessage("Error: Project ID not found in URL. Please navigate from the project creation page.");
        setIsLoading(false);
        setShowGenerationModal(true); // Ensure modal stays open for error
        return;
      }

      setModalMessage(`Generating project files for Project ID: ${projectId}. This may take a few minutes...`);
      setIsLoading(true);
      setShowGenerationModal(true);

      try {
        const response = await fetch('http://localhost:5000/api/file-gen/generate-app', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ projectId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Backend response for file generation:", data);

        if (data.geminiResponse && Array.isArray(data.geminiResponse)) {
          const transformedFiles = transformBackendFilesToSandpack(data.geminiResponse);
          console.log("Transformed files for Sandpack:", transformedFiles); // Inspect this!
          setSandpackFiles(transformedFiles);
          setModalMessage("Project files generated and loaded successfully!");

          // Update checklist based on successful generation
          setChecklist(prev => ({
            ...prev,
            createFiles: true,
            installDependencies: true, // Assuming npm install happens backend
            startApplication: true, // Assuming app is ready to run
            // Check for specific file existence to update checklist
            updateAppTsx: !!transformedFiles['/src/app/page.tsx'],
            updateIndexHtml: !!transformedFiles['/index.html'], // Next.js typically doesn't have an index.html directly
            updateIndexCss: !!transformedFiles['/src/app/globals.css'],
          }));

        } else {
          setModalMessage("Backend response was successful, but no file structure was returned.");
          setSandpackFiles({
            '/error.txt': {
              code: 'No file structure received from the backend. Please check server logs.',
              readOnly: true,
            }
          });
        }
      } catch (error: any) {
        setModalMessage(`Error generating project: ${error.message || 'An unknown error occurred.'}`);
        console.error("Error fetching project files:", error);
        setSandpackFiles({
          '/error.txt': {
            code: `Failed to load project files: ${error.message || 'Check server status.'}`,
            readOnly: true,
          }
        });
      } finally {
        setIsLoading(false);
        // Keep the modal open for a few seconds if there's a success message,
        // or indefinitely if it's an error requiring user attention.
        if (modalMessage.includes("Error") || modalMessage.includes("missing")) {
          // Keep open
        } else {
          setTimeout(() => setShowGenerationModal(false), 3000); // Close after 3 seconds on success
        }
      }
    };

    fetchProjectFiles();
  }, [projectId, transformBackendFilesToSandpack]); // Depend on projectId and the memoized function

  const handleCheckboxChange = (item: string) => {
    setChecklist((prev) => ({
      ...prev,
      [item]: !prev[item as keyof typeof prev], // Type assertion for safety
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
          <span className="text-lg font-medium">Dev on Spot - Modern SaaS Landing Page</span> {/* This should also be dynamic */}
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
          <h2 className="text-xl font-semibold mb-6 text-white">Dev on Spot - Modern SaaS Landing Page</h2> {/* This should also be dynamic */}

          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-2">
              {checklist.createFiles ? <CheckCircle size={20} className="text-green-500" /> : <Circle size={20} className="text-gray-600" />}
              <span className={checklist.createFiles ? 'text-gray-400' : 'text-white'}>Create initial files</span>
            </div>
            <div className="flex items-center space-x-2">
              {checklist.installDependencies ? <CheckCircle size={20} className="text-green-500" /> : <Circle size={20} className="text-gray-600" />}
              <span className={checklist.installDependencies ? 'text-gray-400' : 'text-white'}>Install dependencies</span>
            </div>
            {/* Play button for npm install - this would likely be handled by your backend or the Sandpack environment */}
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
            {/* Play button for npm run dev - this would likely be handled by your backend or the Sandpack environment */}
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
                // value={prompt} // Remove this line if 'prompt' state is no longer used for direct Gemini calls
                // onChange={(e) => setSearchTerm(e.target.value)} // You might want to re-enable a search term for a user query
                placeholder="Ask for code, features, or help..."
                className="w-full p-3 pr-12 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading} // Disable input while loading/generating
              />
              <button
                // onClick={generateCode} // Remove this, or update to call a new "refine code" function
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
            {/* Render SandpackProvider only when files are loaded or it's initializing */}
            {sandpackFiles && Object.keys(sandpackFiles).length > 0 ? (
              <SandpackProvider
                template="react" // Assuming your Next.js app is fundamentally React
                files={sandpackFiles} // Use the dynamically loaded files
                theme={dracula}
                options={{
                  editorHeight: '100%',
                  editorWidth: '100%',
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
                  <div className="flex flex-1">
                    <div className="w-1/4 min-w-[200px] max-w-[300px] bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto custom-scrollbar">
                      <h3 className="text-xs uppercase text-gray-400 mb-2">Project Files</h3>
                      <SandpackFileExplorer />
                    </div>

                    <div className="flex-1 flex flex-col">
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
                              showOpenInCodeSandbox={false}
                              showRefreshButton={true}
                              showSandpackErrorOverlay={true}
                            />
                            {/* Overlay for "Your preview will appear here" if no actual preview content yet */}
                            {isLoading && ( // Show this overlay while initial files are loading
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 text-gray-500 text-xl font-semibold">
                                    {modalMessage}
                                </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </SandpackLayout>
              </SandpackProvider>
            ) : (
                // Fallback for when SandpackProvider is not ready (e.g., initial load)
                <div className="flex items-center justify-center h-full text-gray-500 text-xl">
                    <svg className="animate-spin h-8 w-8 text-purple-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {modalMessage}
                </div>
            )}
          </div>
        </section>
      </main>

      {/* Code Generation Modal (Controlled by isLoading and showGenerationModal) */}
      {showGenerationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Project Generation Status</h3>
            <p className="text-gray-300 mb-4">{modalMessage}</p>
            {isLoading && (
              <svg className="animate-spin h-8 w-8 text-purple-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {/* Add a close button if the modal is not loading and not indicating a permanent error */}
            {!isLoading && (!modalMessage.includes("Error") || !modalMessage.includes("missing")) && (
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