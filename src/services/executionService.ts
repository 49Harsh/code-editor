import axios from 'axios';

// Define a simple class for code execution service
class ExecutionService {
  // for local 
  // private apiUrl = 'http://localhost:3001/api/execute';
  // Update URL for the code execution API to point to Render
  private apiUrl = 'https://code-editor-jj0k.onrender.com/api/execute';
  
  // for local
  // private fallbackApiUrl = 'http://localhost:3001/api/execute';
  private fallbackApiUrl = 'https://code-editor-jj0k.onrender.com/api/execute'; // Same for now, can be changed if needed

  /**
   * Execute Python code with optional input
   */
  async executeCode(
    code: string,
    language: string,
    input: string = '',
    interactive: boolean = false
  ): Promise<ExecutionResult> {
    try {
      console.log('Connecting to execution service...');
      
      // Format input properly (make sure it ends with newline)
      let formattedInput = input;
      if (formattedInput && !formattedInput.endsWith('\n')) {
        formattedInput += '\n';
      }
      
      // Prepare the request payload
      const payload = {
        code: code,
        language: 'python', // Always use Python
        input: formattedInput,
        interactive: interactive
      };

      console.log(`Executing Python code in ${interactive ? 'interactive' : 'regular'} mode`);

      // Make the API request
      const response = await axios.post(this.apiUrl, payload, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = response.data;

      // For interactive mode, return the session ID
      if (interactive && result.sessionId) {
        console.log('Interactive session started with ID:', result.sessionId);
        return {
          success: true,
          output: '',
          error: '',
          exitCode: 0,
          sessionId: result.sessionId
        };
      }

      // For regular mode, extract and clean the output
      const cleanOutput = this.cleanOutputText(result.output || '');
      const cleanError = this.cleanOutputText(result.error || '');

      return {
        success: result.success,
        output: cleanOutput,
        error: cleanError,
        exitCode: result.exitCode || 0,
      };
    } catch (error) {
      // Handle errors
      console.error('Python execution error:', error);
      
      // For timeout errors
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        return {
          success: false,
          output: '',
          error: 'Execution timed out. Your code might be taking too long to run.',
          exitCode: -1,
        };
      }
      
      // Connection errors
      return {
        success: false,
        output: '',
        error: 'Connection to execution server failed. Please try again later.',
        exitCode: -1,
      };
    }
  }

  /**
   * Clean output text by removing extra spaces and newlines
   */
  private cleanOutputText(text: string): string {
    if (!text) return '';
    
    // Split by newlines and process each line
    const lines = text.split('\n');
    const cleanedLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const trimmedLine = lines[i].trim();
      // Only include non-empty lines
      if (trimmedLine.length > 0) {
        cleanedLines.push(trimmedLine);
      }
    }
    
    // Join the cleaned lines with single newlines
    return cleanedLines.join('\n');
  }
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error: string;
  exitCode: number;
  sessionId?: string;
}

// Singleton instance
const executionService = new ExecutionService();
export default executionService; 