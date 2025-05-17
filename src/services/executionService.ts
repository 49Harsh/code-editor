import axios from 'axios';

// Define a simple class for code execution service
class ExecutionService {
  // URL for the code execution API (Docker backend)
  private apiUrl = 'http://localhost:3001/api/execute';

  /**
   * Execute code with optional input
   */
  async executeCode(
    code: string,
    language: string,
    input: string = '',
    interactive: boolean = false
  ): Promise<ExecutionResult> {
    try {
      console.log('Attempting to connect to API at:', this.apiUrl);
      
      const mappedLanguage = this.mapLanguage(language);
      
      // Format input properly (make sure it ends with newline)
      let formattedInput = input;
      if (formattedInput && !formattedInput.endsWith('\n')) {
        formattedInput += '\n';
      }
      
      // Prepare the request payload for Docker backend
      const payload = {
        code: code,
        language: mappedLanguage,
        input: formattedInput,
        interactive: interactive
      };

      console.log('Executing code with payload:', payload);

      // Make the API request to our Docker backend with timeout
      const response = await axios.post(this.apiUrl, payload, {
        timeout: 30000, // 30 second timeout
      });
      const result = response.data;

      console.log('API response:', result);

      // For interactive mode, return the session ID
      if (interactive && result.sessionId) {
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
      console.error('Code execution error:', error);
      
      // Check if Docker is not installed or available
      if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
        return {
          success: false,
          output: '',
          error: 'Cannot connect to the execution server. Please make sure the server is running.',
          exitCode: -1,
        };
      }

      // Timeout error
      if (axios.isAxiosError(error) && error.code === 'ETIMEDOUT') {
        return {
          success: false,
          output: '',
          error: 'Connection to execution server timed out. The server may be overloaded.',
          exitCode: -1,
        };
      }
      
      // Other Axios errors
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          output: '',
          error: `API Error (${error.response.status}): ${JSON.stringify(error.response.data)}`,
          exitCode: -1,
        };
      } else if (axios.isAxiosError(error)) {
        return {
          success: false,
          output: '',
          error: `Network Error: ${error.message}. Make sure the server is running.`,
          exitCode: -1,
        };
      }
      
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown execution error',
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

  /**
   * Map editor language to Docker backend language
   */
  private mapLanguage(editorLanguage: string): string {
    const languageMap: Record<string, string> = {
      javascript: 'javascript',
      typescript: 'javascript', // Use Node.js for TypeScript
      python: 'python',
      java: 'java',
      csharp: 'csharp',
      cpp: 'cpp',
      c: 'c',
    };

    return languageMap[editorLanguage] || editorLanguage;
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