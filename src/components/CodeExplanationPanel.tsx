'use client';

import { useState } from 'react';

interface CodeExplanationPanelProps {
  code: string;
  language: string;
}

const CodeExplanationPanel: React.FC<CodeExplanationPanelProps> = ({ language }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getExplanation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real application, you would call an AI API here
      // For the demo, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a simple explanation based on the language
      const simulatedExplanation = generateSimpleExplanation(language);
      setExplanation(simulatedExplanation);
    } catch (err) {
      setError('Failed to generate explanation. Please try again.');
      console.error('Error generating explanation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSimpleExplanation = (language: string): string => {
    const explanations: Record<string, string> = {
      python: `This Python code demonstrates basic input/output operations and string formatting.
      
The 'input()' function is used to get user input from the keyboard.
The 'print()' function displays text to the console.
String formatting with f-strings (f"...") allows you to embed variables directly in strings.`,

      javascript: `This JavaScript code demonstrates basic console output, variables, and functions.
      
'console.log()' prints messages to the console.
Variables are declared using 'const' (for constants) or 'let' (for variables that can change).
Functions are defined using the 'function' keyword and can accept parameters.
Template literals using backticks allow for embedding variables with \${variable} syntax.`,

      java: `This Java code shows the basic structure of a Java program with a class and methods.
      
Java programs require a class structure, and the 'main' method is the entry point.
'System.out.println()' is used to display text to the console.
Java is statically typed, so variable types (like 'int' and 'String') must be declared.
Methods are defined within classes and can be called from other methods.`,

      cpp: `This C++ code demonstrates basic console I/O, variables, and functions.
      
'#include <iostream>' brings in the standard input/output library.
'using namespace std;' allows us to use standard library functions without the 'std::' prefix.
'cout' and '<<' are used to output text to the console.
Functions need to be declared before they're called, unless you provide a forward declaration.`,

      csharp: `This C# code shows the basic structure of a C# program with a class and methods.
      
C# programs are organized into classes, with the 'Main' method as the entry point.
'Console.WriteLine()' displays text to the console.
C# is statically typed, so variable types (like 'int' and 'string') must be declared.
String interpolation using $ allows for embedding variables with {variable}.`,
    };

    return explanations[language] || 
      'This code demonstrates basic programming concepts. Try running it to see what it does!';
  };

  return (
    <div className="rounded-md bg-white dark:bg-gray-800 p-4 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Code Explanation</h3>
      
      {!explanation && !isLoading && (
        <div className="mt-4">
          <button
            onClick={getExplanation}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Explain This Code'}
          </button>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Click to get an explanation of what this code does and how it works.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="mt-4 flex items-center text-gray-500 dark:text-gray-400">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating explanation...
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-500 dark:text-red-400">
          {error}
          <button
            onClick={getExplanation}
            className="mt-2 text-blue-500 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {explanation && !isLoading && (
        <div className="mt-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md text-sm whitespace-pre-line">
            {explanation}
          </div>
          <button
            onClick={() => setExplanation(null)}
            className="mt-3 text-blue-500 hover:underline text-sm"
          >
            Generate new explanation
          </button>
        </div>
      )}
    </div>
  );
};

export default CodeExplanationPanel; 