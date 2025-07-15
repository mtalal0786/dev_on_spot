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

// Define common binary extensions that Sandpack's CodeEditor shouldn't try to render as text
const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ico', // Images
  // 'svg', // Keep SVG as text if you want to display its content, otherwise add here
  'mp3', 'wav', 'ogg', // Audio
  'mp4', 'avi', 'mov', // Video
  'woff', 'woff2', 'ttf', 'otf', 'eot', // Fonts
  'zip', 'tar', 'gz', 'rar', // Archives
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', // Documents
  'exe', 'dll', 'bin', // Executables/Binaries
  'db', 'sqlite', // Databases
  'env', // Environment files (sensitive)
  // Add more as needed
]);

export default function CodeEditorPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [sandpackFiles, setSandpackFiles] = useState<{ [key: string]: { code: string; hidden?: boolean; readOnly?: boolean } }>(initialLoadingFiles);
  const [checklist, setChecklist] = useState({
    createFiles: false, // Will be true after backend response
    installDependencies: false, // Simulating, will be updated based on backend status
    updateAppTsx: false,
    updateIndexHtml: false, // Note: Next.js generally doesn't use index.html directly
    updateIndexCss: false,
    startApplication: false,
  });

  const [isLoading, setIsLoading] = useState(true); // Set to true initially to show loader on page load
  const [showGenerationModal, setShowGenerationModal] = useState(true); // Show modal immediately
  const [modalMessage, setModalMessage] = useState('Initializing project...');
  const [activeTab, setActiveTab] = useState('code');

  // Helper function to convert the backend's FLAT file list (from DB) to Sandpack's flat structure
  const transformBackendFilesToSandpack = useCallback((backendFilesList: any[]): { [key: string]: { code: string; hidden?: boolean; readOnly?: boolean } } => {
    let files: { [key: string]: { code: string; hidden?: boolean; readOnly?: boolean } } = {};

    backendFilesList.forEach(file => {
      // Sandpack paths always start with a '/' and are absolute.
      // Your backend `filePath` from DB should already be like "src/app/page.tsx"
      const fullPath = file.filePath.startsWith('/') ? file.filePath : `/${file.filePath}`;

      const isBinary = BINARY_EXTENSIONS.has(file.fileExtension.toLowerCase());

      files[fullPath] = {
        code: isBinary ? `// Binary file: ${file.fileName}. Content not displayed in editor.` : (file.fileContent || ''),
        readOnly: isBinary, // Make binary files read-only in the Sandpack editor
        hidden: fullPath.includes('node_modules') || fullPath.includes('.next/') || fullPath.includes('.git/'), // Example of hiding
      };
    });

    // Add essential Next.js boilerplate files that are not part of the Gemini response
    // but are required for a functional Next.js project within Sandpack.
    // Dynamically generated files (from `backendFilesList`) will override boilerplate if they have the same path.
    const boilerplateFiles: { [key: string]: { code: string; hidden?: boolean; readOnly?: boolean } } = {
      // Root-level files
      '/.gitignore': {
        code: `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.
/node_modules
/.pnp
.pnp.js
/coverage
/build
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
              'lucide-react': '^0.407.0',
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
              'typescript-eslint': '^7.1.1',
              'globals': '^15.0.0',
              'eslint-plugin-react': '^7.34.4',
              '@eslint/js': '^9.7.0',
            },
          },
          null,
          2
        ),
      },
      '/package-lock.json': { // Can be a minimal placeholder for Sandpack
        code: `{ "name": "my-nextjs-app", "version": "0.1.0", "lockfileVersion": 3, "requires": true, "packages": {} }`,
        hidden: true,
      },
      '/postcss.config.mjs': {
        code: `export default { plugins: { tailwindcss: {}, autoprefixer: {}, }, };`,
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
        code: `{ "compilerOptions": { "lib": ["dom", "dom.iterable", "esnext"], "allowJs": true, "skipLibCheck": true, "strict": true, "noEmit": true, "esModuleInterop": true, "module": "esnext", "moduleResolution": "bundler", "resolveJsonModule": true, "isolatedModules": true, "jsx": "preserve", "incremental": true, "plugins": [{ "name": "next" }], "paths": { "@/*": ["./src/*"] } }, "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"], "exclude": ["node_modules"] }`,
      },

      // Public directory files (with actual SVG content for better rendering)
      // These will be overridden if backend provides them.
      '/public/file.svg': { code: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L15 2z"/><path d="M14 2v6h6"/></svg>` },
      '/public/globe.svg': { code: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>` },
      '/public/next.svg': { code: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>` },
      '/public/vercel.svg': { code: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle"><path d="M10.29 2.71c.6-.6 1.5-.6 2.1 0l8.5 8.5c.6.6.6 1.5 0 2.1l-8.5 8.5c-.6.6-1.5.6-2.1 0l-8.5-8.5c-.6-.6-.6-1.5 0-2.1z"/></svg>` },
      '/public/window.svg': { code: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-monitor"><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M12 17v4"/><path d="M8 21h8"/></svg>` },

      // Essential src/app files that might not be generated by Gemini but are part of a Next.js app
      // These will be overridden if backend provides them.
      '/src/app/favicon.ico': { code: ``, hidden: true }, // Binary file
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
      // Initial page.tsx - this will often be overwritten by Gemini, but good to have a starting point
      '/src/app/page.tsx': {
        code: `import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">src/app/page.tsx</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className="relative z-[-1] flex place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 lg:before:h-[360px]">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Docs{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Find in-depth information about Next.js features and API.
          </p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Learn{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Learn about Next.js in an interactive course with quizzes!
          </p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Templates{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Explore starter templates for Next.js.
          </p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Deploy{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50 text-balance">
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a>
      </div>
    </main>
  );
}
`,
      },
    };

    // Merge boilerplate files with dynamically generated files.
    // Dynamically generated files (from `backendFilesList`) will override boilerplate if they have the same path.
    return { ...boilerplateFiles, ...files };
  }, []); // Empty dependency array as BINARY_EXTENSIONS is constant

  // useEffect to trigger backend generation and then fetch project files
  useEffect(() => {
    const generateAndFetchProjectFiles = async () => {
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
        // Step 1: Trigger backend file generation/modification via POST request
        console.log("Triggering backend file generation...");
        const generateResponse = await fetch('http://localhost:5000/api/file-gen/generate-app', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ projectId }),
        });

        // --- Defensive check for generateResponse ---
        const generateContentType = generateResponse.headers.get("content-type");
        if (!generateResponse.ok) {
            if (generateContentType && generateContentType.includes("application/json")) {
                const errorData = await generateResponse.json();
                throw new Error(errorData.error || `HTTP error! Status: ${generateResponse.status} during generation.`);
            } else {
                const errorText = await generateResponse.text(); // Read as text if not JSON
                console.error("Non-JSON error response from POST /api/file-gen/generate-app:", errorText);
                throw new Error(`HTTP error! Status: ${generateResponse.status} (Expected JSON, got ${generateContentType || 'unknown type'}). Backend response: ${errorText.substring(0, 500)}...`);
            }
        }

        console.log("Backend generation triggered successfully. Now fetching updated project files...");
        setModalMessage("Backend generation complete. Fetching updated project files from database...");

        // Step 2: Fetch the project's *current* files from the database via GET request
        // This assumes you have a GET endpoint at /api/projects/:projectId that returns the Project object
        const fetchResponse = await fetch(`http://localhost:5000/api/projects/${projectId}`);

        // --- Defensive check for fetchResponse ---
        const fetchContentType = fetchResponse.headers.get("content-type");
        if (!fetchResponse.ok) {
            if (fetchContentType && fetchContentType.includes("application/json")) {
                const errorData = await fetchResponse.json();
                throw new Error(errorData.error || `HTTP error! Status: ${fetchResponse.status} during fetch.`);
            } else {
                const errorText = await fetchResponse.text(); // Read as text if not JSON
                console.error("Non-JSON error response from GET /api/projects/:projectId:", errorText);
                throw new Error(`HTTP error! Status: ${fetchResponse.status} (Expected JSON, got ${fetchContentType || 'unknown type'}). Backend response: ${errorText.substring(0, 500)}...`);
            }
        }

        // If fetchResponse.ok and content-type is JSON, proceed to parse JSON
        const projectData = await fetchResponse.json();
        console.log("Fetched project data from DB:", projectData);

        if (projectData.files && Array.isArray(projectData.files)) {
          const transformedFiles = transformBackendFilesToSandpack(projectData.files);
          console.log("Transformed files for Sandpack:", transformedFiles);
          setSandpackFiles(transformedFiles);
          setModalMessage("Project files generated and loaded successfully!");

          // Update checklist based on successful generation and file presence
          setChecklist(prev => ({
            ...prev,
            createFiles: true,
            installDependencies: true, // Assuming npm install happens backend or is simulated by Sandpack
            startApplication: true, // Assuming app is ready to run in Sandpack
            updateAppTsx: !!transformedFiles['/src/app/page.tsx'],
            updateIndexHtml: !!transformedFiles['/index.html'] || !!transformedFiles['/public/index.html'], // Next.js typically doesn't have an index.html directly
            updateIndexCss: !!transformedFiles['/src/app/globals.css'],
          }));

        } else {
          setModalMessage("Backend returned project data, but no 'files' array found. Please check your database structure or the backend's response.");
          setSandpackFiles({
            '/error.txt': {
              code: 'No file structure received from the backend. Check server logs and database structure.',
              readOnly: true,
            }
          });
        }
      } catch (error: any) {
        setModalMessage(`Error: ${error.message || 'An unknown error occurred.'}`);
        console.error("Error in project generation/fetch process:", error);
        setSandpackFiles({
          '/error.txt': {
            code: `Failed to load project files: ${error.message || 'Check server status.'}`,
            readOnly: true,
          }
        });
      } finally {
        setIsLoading(false);
        // Only close modal automatically on clear success
        if (!modalMessage.includes("Error") && !modalMessage.includes("missing")) {
          setTimeout(() => setShowGenerationModal(false), 3000); // Close after 3 seconds on success
        }
      }
    };

    generateAndFetchProjectFiles();
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
        <aside className="w-1/3 min-w-[300px] max-w-[400px] bg-gray-900 p-6 flex flex-col border-r border-gray-800 overflow-y-auto custom-scrollbar">
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
              <span className={checklist.updateAppTsx ? 'text-gray-400' : 'text-white'}>Update <span className="font-mono">src/app/page.tsx</span></span>
            </div>
            <div className="flex items-center space-x-2">
              {checklist.updateIndexHtml ? <CheckCircle size={20} className="text-green-500" /> : <Circle size={20} className="text-gray-600" />}
              <span className={checklist.updateIndexHtml ? 'text-gray-400' : 'text-white'}>Update <span className="font-mono">index.html</span></span>
            </div>
            <div className="flex items-center space-x-2">
              {checklist.updateIndexCss ? <CheckCircle size={20} className="text-green-500" /> : <Circle size={20} className="text-gray-600" />}
              <span className={checklist.updateIndexCss ? 'text-gray-400' : 'text-white'}>Update <span className="font-mono">src/app/globals.css</span></span>
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
                placeholder="Ask for code, features, or help..."
                className="w-full p-3 pr-12 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading} // Disable input while loading/generating
              />
              <button
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
                  showNavigator: true, // This is related to the explorer visibility
                  showConsole: true,
                  showErrorScreen: true,
                  showLoadingScreen: true,
                  wrapContent: true,
                }}
              >
                <SandpackLayout className="!rounded-xl !border-none">
                  <div className="flex flex-1">
                    {/* File Explorer Panel with Custom Scrollbar */}
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
            {!isLoading && (!modalMessage.includes("Error") && !modalMessage.includes("missing")) && (
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