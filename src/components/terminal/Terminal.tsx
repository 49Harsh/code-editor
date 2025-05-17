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
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [waitingForOutput, setWaitingForOutput] = useState(false);
  const [inputSent, setInputSent] = useState(false);
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Initialize socket connection when sessionId changes
  useEffect(() => {
    if (sessionId) {
      console.log('Connecting to Python execution service...');
      setWaitingForOutput(true);
      setLiveOutput('Connecting to execution server...\n');
      
      // Connect to WebSocket server with improved settings
      socketRef.current = io('https://code-editor-jj0k.onrender.com', {
        query: { sessionId },
        transports: ['polling', 'websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 30000, // Increased timeout
        forceNew: true, // Force new connection
      });
      
      // Connection established
      socketRef.current.on('connect', () => {
        console.log('Socket connected');
        setConnectionError(null);
        setLiveOutput(prev => prev + 'Connected to server!\n');
      });
      
      // Connection error
      socketRef.current.on('connect_error', (err) => {
        console.error('Connection error:', err);
        setLiveOutput(prev => prev + `\nConnection error: ${err.message}\nPlease try again.\n`);
        
        if (onSessionEnd) {
          setTimeout(() => onSessionEnd(), 3000);
        }
      });
      
      // Listen for output from Python
      socketRef.current.on('output', (data: string) => {
        console.log('Output received:', data);
        setWaitingForOutput(false);
        setLiveOutput(prev => prev + data);
        setInputSent(false); // Reset input sent flag
        
        // Auto-focus input when Python asks for input
        if (data.includes('input(') || 
            data.includes('?') || 
            data.toLowerCase().includes('enter') || 
            data.toLowerCase().includes('name')) {
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus();
              console.log('Input field focused');
            }
          }, 100);
        }
      });
      
      // Process exit
      socketRef.current.on('exit', (data: { code: number }) => {
        console.log(`Process exited with code ${data.code}`);
        setWaitingForOutput(false);
        if (onSessionEnd) {
          onSessionEnd();
        }
      });
      
      // Set a timeout to detect if execution is taking too long
      const timeoutId = setTimeout(() => {
        if (waitingForOutput && !inputSent) {
          setLiveOutput(prev => prev + '\nNo response from server. Please try again.\n');
          if (onSessionEnd) {
            onSessionEnd();
          }
        }
      }, 20000); // Increased timeout
      
      // Cleanup
      return () => {
        clearTimeout(timeoutId);
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
      // Send input to Python
      if (socketRef.current && socketRef.current.connected && sessionId) {
        setInputSent(true); // Mark that we've sent input
        socketRef.current.emit('input', inputValue);
        
        // Show the input in the terminal
        setLiveOutput(prev => `${prev}\n> ${inputValue}`);
        
        // Save to input history
        setInputHistory(prev => [...prev, inputValue]);
        setHistoryIndex(-1);
        
        // Reset waiting for output
        setWaitingForOutput(true);
        
        // Set a timeout specifically for this input request
        setTimeout(() => {
          if (socketRef.current?.connected && inputSent) {
            // If still waiting after 10 seconds, show message
            setLiveOutput(prev => prev + '\nStill processing your input...\n');
          }
        }, 10000);
      } 
      else if (onInput) {
        onInput(inputValue);
      }
      setInputValue('');
    }
  };

  // Handle keyboard navigation for input history
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < inputHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInputValue(inputHistory[inputHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputValue(inputHistory[inputHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputValue('');
      }
    }
  };

  // Update scroll position when output changes
  useEffect(() => {
    if (output !== lastOutput) {
      setLastOutput(output);
      setLiveOutput(''); // Reset live output when new execution starts
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
    
    if (isRunning && !output) {
      return <div className="text-yellow-400">Running Python code...</div>;
    }
    
    if (!output) {
      return <div className="text-gray-400">No output to display</div>;
    }
    
    // Clean the output
    const cleanedOutput = filterTextContent(output);
    if (!cleanedOutput) {
      return <div className="text-gray-400">No output to display</div>;
    }
    
    // Split by lines and create elements
    return cleanedOutput.split('\n').map((line, index) => {
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

  // Cancel button for when execution takes too long
  const handleCancel = () => {
    setLiveOutput(prev => prev + '\nCanceling execution...\n');
    if (onSessionEnd) {
      onSessionEnd();
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
      
      {/* Cancel button */}
      {waitingForOutput && isRunning && (
        <div className="px-4 py-2 bg-gray-800">
          <button 
            onClick={handleCancel}
            className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
          >
            Cancel
          </button>
          <span className="text-xs text-gray-400 ml-2">
            {inputSent ? "Waiting for Python to process your input..." : "Waiting for response..."}
          </span>
        </div>
      )}
      
      {/* Input area */}
      {(onInput || socketRef.current) && isRunning && (
        <div className={`relative border-t ${focused ? 'border-blue-500' : 'border-gray-700'}`}>
          {focused && <div className="absolute -top-3 left-2 bg-blue-500 text-xs text-white px-2 py-0.5 rounded-full">Type Here</div>}
          <form onSubmit={handleInputSubmit} className="flex">
            <span className="p-2 text-green-400 font-mono">{'>'}</span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="flex-1 bg-transparent text-white p-2 outline-none font-mono"
              placeholder="Enter your input here and press Enter"
              disabled={!isRunning || !socketRef.current?.connected || inputSent}
            />
          </form>
        </div>
      )}
    </div>
  );
};

export default Terminal; 