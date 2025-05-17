import axios from 'axios';

// Define a simple class for code execution service
class ExecutionService {
  // URL for the code execution API
  private apiUrl = 'https://emkc.org/api/v2/piston/execute';

  /**
   * Execute code with optional input
   */
  async executeCode(
    code: string,
    language: string,
    input: string = ''
  ): Promise<ExecutionResult> {
    try {
      const mappedLanguage = this.mapLanguage(language);
      
      // Format input properly (make sure it ends with newline)
      let formattedInput = input;
      if (formattedInput && !formattedInput.endsWith('\n')) {
        formattedInput += '\n';
      }
      
      // Prepare the request payload
      const payload = {
        language: mappedLanguage,
        version: this.getLanguageVersion(mappedLanguage),
        files: [
          {
            name: this.getFileName(mappedLanguage),
            content: code,
          },
        ],
        stdin: formattedInput,
        args: [],
        compile_timeout: 10000,
        run_timeout: 5000,
      };

      console.log('Executing code with payload:', payload);

      // Make the API request
      const response = await axios.post(this.apiUrl, payload);
      const result = response.data;

      // Check if it's an input-related error for Python
      if (mappedLanguage === 'python3' && result.run.stderr && 
          (result.run.stderr.includes('EOFError') || 
           result.run.stderr.includes('EOF when reading a line'))) {
        return {
          success: false,
          output: result.run.stdout || '',
          error: 'Input Error: The program expected more input than provided. Make sure to provide values for all input() calls.',
          exitCode: result.run.code,
        };
      }

      // Extract and clean the output
      const cleanOutput = this.cleanOutputText(result.run.stdout || '');
      const cleanError = this.cleanOutputText(result.run.stderr || '');

      return {
        success: true,
        output: cleanOutput,
        error: cleanError,
        exitCode: result.run.code,
      };
    } catch (error) {
      // Handle errors
      console.error('Code execution error:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          output: '',
          error: `API Error (${error.response.status}): ${JSON.stringify(error.response.data)}`,
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
   * Map editor language to API language
   */
  private mapLanguage(editorLanguage: string): string {
    const languageMap: Record<string, string> = {
      javascript: 'javascript',
      typescript: 'typescript',
      python: 'python3',
      java: 'java',
      csharp: 'csharp',
      cpp: 'cpp',
      c: 'c',
      ruby: 'ruby',
      go: 'go',
      rust: 'rust',
      php: 'php',
    };

    return languageMap[editorLanguage] || editorLanguage;
  }
  
  /**
   * Get appropriate file name for language
   */
  private getFileName(language: string): string {
    const fileNameMap: Record<string, string> = {
      nodejs: 'index.js',
      javascript: 'script.js',
      typescript: 'index.ts',
      python3: 'main.py',
      java: 'Main.java',
      csharp: 'Program.cs',
      cpp: 'main.cpp',
      c: 'main.c',
      ruby: 'main.rb',
      go: 'main.go',
      rust: 'main.rs',
      php: 'index.php',
    };
    
    return fileNameMap[language] || 'main';
  }
  
  /**
   * Get appropriate version for language
   */
  private getLanguageVersion(language: string): string {
    const versionMap: Record<string, string> = {
      nodejs: '18.15.0',
      javascript: '18.15.0',
      typescript: '5.0.3',
      python3: '3.10.0',
      java: '15.0.2',
      csharp: '6.12.0',
      cpp: '11.2.0',
      c: '10.2.0',
      ruby: '3.0.0',
      go: '1.16.2',
      rust: '1.68.2',
      php: '8.2.3',
    };
    
    return versionMap[language] || '*';
  }
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error: string;
  exitCode: number;
}

// Singleton instance
const executionService = new ExecutionService();
export default executionService; 