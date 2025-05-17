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
  const [input, setInput] = useState('');
  
  // State for UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [inputVisible, setInputVisible] = useState(false);

  // Update code when language changes
  useEffect(() => {
    setCode(getTemplateForLanguage(language));
  }, [language]);

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    if (code !== getTemplateForLanguage(language)) {
      if (confirm('Changing the language will reset your code. Continue?')) {
        setLanguage(newLanguage);
      }
    } else {
      setLanguage(newLanguage);
    }
  };

  // Handle code execution
  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('');
    
    try {
      const userInput = inputVisible ? input : '';
      const result = await executionService.executeCode(code, language, userInput);
      
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
      }
      
      setOutput(formattedOutput);
    } catch (error) {
      setOutput(`Execution error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Handle theme toggle
  const toggleTheme = () => {
    setTheme(theme === 'vs-dark' ? 'vs-light' : 'vs-dark');
  };

  // Handle terminal input
  const handleTerminalInput = (userInput: string) => {
    setInput(userInput);
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
            CodeLab
          </h1>
          
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-white text-gray-800 rounded-md px-3 py-1 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {availableLanguages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.icon} {lang.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            
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

            <div className="flex justify-between items-center mb-2">
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
              
              <div className="flex items-center">
                <label htmlFor="show-input" className="flex items-center">
                  <input
                    id="show-input"
                    type="checkbox"
                    checked={inputVisible}
                    onChange={() => setInputVisible(!inputVisible)}
                    className="mr-2"
                  />
                  <span className={`${theme === 'vs-dark' ? 'text-white' : 'text-gray-900'}`}>
                    Enable Input
                  </span>
                </label>
              </div>
            </div>

            {/* Input area warning */}
            {!inputVisible && language === 'python' && code.includes('input(') && (
              <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md border border-yellow-300">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium">Warning: Your code uses input() but input is disabled</p>
                    <p className="text-sm mt-1">Please enable the input checkbox above and provide values for each input() call in your code.</p>
                  </div>
                </div>
              </div>
            )}

            {inputVisible && (
              <div className="mb-4">
                <div className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Program Input:
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter input for your program (values that would normally be read by input() or similar functions)"
                  className={`w-full p-3 rounded-md ${
                    theme === 'vs-dark' 
                      ? 'bg-gray-800 text-white border-gray-700' 
                      : 'bg-white text-gray-900 border-gray-300'
                  } border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  rows={3}
                ></textarea>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Input values should be separated by line breaks (Enter) as if you were typing them when prompted.
                  {language === 'python' && (
                    <div className="mt-2 p-2 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded border border-blue-200 dark:border-blue-800">
                      <strong>Python Example:</strong> If your code has two input() calls, enter two values separated by line breaks:
                      <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                        John{'\n'}25
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

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
            CodeLab - An interactive coding playground for young programmers.
          </p>
          <p className="mt-1">
            Built with Next.js and Monaco Editor.
          </p>
        </div>
      </footer>
    </main>
  );
}
