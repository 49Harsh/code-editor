'use client';

import React, { useEffect, useRef, useState } from 'react';
import { filterTextContent } from '@/utils/codeTemplates';
import { Socket, io } from 'socket.io-client';

interface TerminalProps {
  output: string;
  onInput?: (input: string) => void;
  isRunning: boolean;
  sessionId?: string;
  onSessionEnd?: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ 
  output, 
  onInput, 
  isRunning,
  sessionId,
  onSessionEnd
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [lastOutput, setLastOutput] = useState('');
  const [liveOutput, setLiveOutput] = useState('');
  const [focused, setFocused] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  
  // Initialize socket connection when sessionId changes
  useEffect(() => {
    if (sessionId) {
      // Connect to WebSocket server
      socketRef.current = io('http://localhost:3001', {
        query: { sessionId }
      });
      
      // Listen for real-time output from the container
      socketRef.current.on('output', (data: string) => {
        setLiveOutput(prev => prev + data);
        
        // Auto-focus input when output suggests input is needed
        if (data.includes('?') || 
            data.toLowerCase().includes('enter') || 
            data.toLowerCase().includes('input') ||
            data.includes('readline.question') ||
            data.includes('What is your name') ||
            data.includes('How old are you')
        ) {
          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
        }
      });
      
      // Listen for process exit
      socketRef.current.on('exit', (data: { code: number }) => {
        console.log(`Process exited with code ${data.code}`);
        if (onSessionEnd) {
          onSessionEnd();
        }
      });
      
      // Clean up socket connection
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [sessionId, onSessionEnd]);
  
  // Handle input submission
  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // If we have a socket connection and it's open, send through socket
      if (socketRef.current && socketRef.current.connected && sessionId) {
        socketRef.current.emit('input', inputValue);
        
        // Show the input in the terminal
        setLiveOutput(prev => `${prev}\n> ${inputValue}`);
      } 
      // Otherwise use the regular input handler
      else if (onInput) {
        onInput(inputValue);
      }
      setInputValue('');
    }
  };

  // Update scroll position when output changes
  useEffect(() => {
    if (output !== lastOutput) {
      setLastOutput(output);
      setLiveOutput(''); // Reset live output when new execution starts
      
      // Scroll to bottom when content changes
      scrollToBottom();
    }
  }, [output, lastOutput]);
  
  // Also scroll when liveOutput updates
  useEffect(() => {
    scrollToBottom();
  }, [liveOutput]);

  const scrollToBottom = () => {
    if (terminalRef.current) {
      setTimeout(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      }, 10);
    }
  };

  // Process and format the output for display
  const formatOutput = () => {
    // If we have live output from a socket connection, show that instead
    if (liveOutput) {
      return liveOutput.split('\n').map((line, index) => {
        // Check if this line is an error message
        const isError = line.includes('Error:') || line.includes('error:');
        const isInput = line.startsWith('> ');
        
        let className = 'text-green-100 font-mono';
        if (isError) className = 'text-red-500 font-mono';
        if (isInput) className = 'text-blue-300 font-mono';
        
        return <div key={index} className={className}>{line}</div>;
      });
    }
    
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

  // Focus input when terminal is clicked
  const handleTerminalClick = () => {
    if (isRunning && (socketRef.current?.connected || sessionId)) {
      inputRef.current?.focus();
    }
  };

  return (
    <div 
      className={`flex flex-col h-[300px] sm:h-[350px] md:h-[400px] border ${
        focused ? 'border-blue-500' : 'border-gray-700'
      } rounded-md overflow-hidden bg-[#1e1e1e] transition-all duration-200`}
      onClick={handleTerminalClick}
    >
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
      
      {/* Input area - shown if onInput is provided or if we have a socket connection */}
      {(onInput || socketRef.current) && isRunning && (
        <div className={`relative border-t ${focused ? 'border-blue-500' : 'border-gray-700'}`}>
          {focused && <div className="absolute -top-3 left-2 bg-blue-500 text-xs text-white px-2 py-0.5 rounded-full">Input Here</div>}
          <form onSubmit={handleInputSubmit} className="flex">
            <span className="p-2 text-green-400 font-mono">{'>'}</span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="flex-1 bg-transparent text-white p-2 outline-none font-mono"
              placeholder="Type input here and press Enter"
              disabled={!isRunning || !(socketRef.current?.connected || sessionId)}
            />
          </form>
        </div>
      )}
    </div>
  );
};

export default Terminal; 