'use client';

import { useState, useEffect } from 'react';
import CodeEditor from '@/components/editor/CodeEditor';
import Terminal from '@/components/terminal/Terminal';
import LearningResourcesPanel from '@/components/LearningResourcesPanel';
import CodeExplanationPanel from '@/components/CodeExplanationPanel';
import executionService from '@/services/executionService';
import {
  availableLanguages,
  defaultLanguage,
  getTemplateForLanguage,
} from '@/utils/codeTemplates';

export default function Home() {
  // State for code editor
  const [language, setLanguage] = useState(defaultLanguage);
  const [code, setCode] = useState(getTemplateForLanguage(defaultLanguage));
  const [theme, setTheme] = useState('vs-dark');
  
  // State for terminal
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  
  // State for UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [useInteractive, setUseInteractive] = useState(false);

  // Helper function to check if code requires input
  const codeRequiresInput = (code: string): boolean => {
    // Check for Python input function
    return code.includes('input(');
  };

  // Update code when language changes
  useEffect(() => {
    setCode(getTemplateForLanguage(language));
  }, [language]);

  // Handle code execution
  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('');
    setSessionId(undefined);
    
    try {
      // Use interactive mode if enabled
      if (useInteractive) {
        setOutput('Connecting to execution server...');
        
        const result = await executionService.executeCode(code, language, '', true);
        
        if (result.success && result.sessionId) {
          setSessionId(result.sessionId);
          // Output will be handled by the Terminal component via WebSocket
        } else {
          setOutput(`Error starting interactive session: ${result.error || 'Unknown error'}`);
          // End running state if we couldn't get a session
          setTimeout(() => {
            setIsRunning(false);
          }, 5000);
        }
      } 
      // Use regular mode
      else {
        setOutput('Running code, please wait...');
        const result = await executionService.executeCode(code, language, '', false);
        
        let formattedOutput = '';
        
        if (result.success) {
          if (result.output) {
            formattedOutput += result.output.trim();
          }
          
          if (result.error) {
            formattedOutput += formattedOutput ? '\n\n' : '';
            formattedOutput += `Error:\n${result.error.trim()}`;
          }
          
          if (!formattedOutput) {
            formattedOutput = '(No output)';
          }
        } else {
          formattedOutput = `Error: ${(result.error || 'Unknown error occurred').trim()}`;
          console.error('Execution failed:', result);
        }
        
        setOutput(formattedOutput);
      }
    } catch (error) {
      console.error('Execution error:', error);
      setOutput(`Execution error: ${error instanceof Error ? error.message : String(error)}`);
      // Always end running state on error
      setIsRunning(false);
    } finally {
      // Only set isRunning to false for non-interactive mode
      // For interactive mode, it stays running until the session ends
      if (!useInteractive) {
        setIsRunning(false);
      }
    }
  };

  // Handle terminal input
  const handleTerminalInput = (userInput: string) => {
    // This is now handled directly by the terminal component
  };

  // Handle theme toggle
  const toggleTheme = () => {
    setTheme(theme === 'vs-dark' ? 'vs-light' : 'vs-dark');
  };
  
  // Handle WebSocket session end
  const handleSessionEnd = () => {
    setIsRunning(false);
    setSessionId(undefined);
  };

  return (
    <main className={`min-h-screen ${theme === 'vs-dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className="bg-blue-600 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Python CodeLab
          </h1>
          
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="bg-white text-gray-800 rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label="Toggle theme"
            >
              {theme === 'vs-dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            
            {/* Sidebar Toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="bg-white text-gray-800 rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Code Editor and Terminal */}
          <div className="flex-1">
            <div className="mb-4">
              <CodeEditor
                code={code}
                language={language}
                onChange={setCode}
                theme={theme}
              />
            </div>

            {/* Interactive Mode Hint (Always visible) */}
            <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-md border border-blue-300">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium">Interactive Mode Tip:</p>
                  <p className="text-sm">If your code uses the input() function, remember to enable Interactive Mode before running your code.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
              
              <div className="flex items-center space-x-4">
                <label htmlFor="use-interactive" className="flex items-center">
                  <input
                    id="use-interactive"
                    type="checkbox"
                    checked={useInteractive}
                    onChange={() => setUseInteractive(!useInteractive)}
                    className="mr-2"
                  />
                  <span className={`${theme === 'vs-dark' ? 'text-white' : 'text-gray-900'}`}>
                    Interactive Mode
                  </span>
                </label>
              </div>
            </div>

            {/* Input guidance for interactive mode */}
            {useInteractive && codeRequiresInput(code) && (
              <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-md border border-blue-300">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">Your code asks for user input. Enter values in the terminal when prompted.</p>
                    <p className="text-sm mt-1">After running your code, click in the terminal window and type your input when you see the prompt.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Warning for non-interactive mode */}
            {/* {!useInteractive && codeRequiresInput(code) && (
              <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md border border-yellow-300">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium">Warning: Your code needs input but interactive mode is off</p>
                    <p className="text-sm mt-1">Please enable interactive mode to allow input in your code.</p>
                  </div>
                </div>
              </div>
            )} */}

            <div className="mt-4 terminal-wrapper">
              <div className="flex justify-between items-center mb-2">
                <h3 className={`text-sm font-medium ${theme === 'vs-dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Output Terminal
                </h3>
                {isRunning && (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xs text-yellow-500">Running...</span>
                  </div>
                )}
              </div>
              <Terminal 
                output={output} 
                isRunning={isRunning}
                onInput={handleTerminalInput}
                sessionId={sessionId}
                onSessionEnd={handleSessionEnd}
              />
            </div>
          </div>

          {/* Sidebar */}
          {isSidebarOpen && (
            <div className="w-full md:w-80 space-y-4">
              <LearningResourcesPanel language={language} />
              <CodeExplanationPanel code={code} language={language} />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className={`p-4 ${theme === 'vs-dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'} mt-8`}>
        <div className="container mx-auto text-center text-sm">
          <p>
            Python CodeLab - An interactive coding playground for beginners.
          </p>
          <p className="mt-1">
            Built with Next.js and Monaco Editor.
          </p>
        </div>
      </footer>
    </main>
  );
}
