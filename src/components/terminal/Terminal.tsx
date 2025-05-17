'use client';

import { useEffect, useRef, useState } from 'react';
import { filterTextContent } from '@/utils/codeTemplates';

interface TerminalProps {
  output: string;
  input?: string;
  onInput?: (input: string) => void;
  isRunning: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ 
  output, 
  input = '', 
  onInput, 
  isRunning 
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [lastOutput, setLastOutput] = useState('');
  
  // Handle input submission
  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onInput && inputValue.trim()) {
      onInput(inputValue);
      setInputValue('');
    }
  };

  // Update scroll position when output changes
  useEffect(() => {
    if (output !== lastOutput) {
      setLastOutput(output);
      
      // Scroll to bottom when content changes
      if (terminalRef.current) {
        setTimeout(() => {
          if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
          }
        }, 10);
      }
    }
  }, [output, lastOutput]);

  // Process and format the output for display
  const formatOutput = () => {
    if (isRunning) {
      return <div className="text-yellow-400">Running code...</div>;
    }
    
    if (!output) {
      return <div className="text-gray-400">No output to display</div>;
    }
    
    // Apply the filtering algorithm to clean the output
    const cleanedOutput = filterTextContent(output);
    if (!cleanedOutput) {
      return <div className="text-gray-400">No output to display</div>;
    }
    
    // Split by lines and create elements
    return cleanedOutput.split('\n').map((line, index) => {
      // Check if this line is an error message
      const isError = line.includes('Error:') || line.includes('error:');
      
      return (
        <div 
          key={index} 
          className={`${isError ? 'text-red-500' : 'text-green-100'} font-mono`}
        >
          {line}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-[300px] border border-gray-700 rounded-md overflow-hidden bg-[#1e1e1e]">
      {/* Terminal output */}
      <div 
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto font-mono text-sm text-white"
        style={{ 
          scrollBehavior: 'smooth',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {formatOutput()}
      </div>
      
      {/* Input area - only shown if onInput is provided */}
      {onInput && (
        <form onSubmit={handleInputSubmit} className="flex border-t border-gray-700">
          <span className="p-2 text-green-400 font-mono">{'>'}</span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-transparent text-white p-2 outline-none font-mono"
            placeholder="Type input here and press Enter"
            disabled={isRunning}
          />
        </form>
      )}
    </div>
  );
};

export default Terminal; 