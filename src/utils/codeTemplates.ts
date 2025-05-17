// Code templates for different programming languages
export const codeTemplates: Record<string, string> = {
  python: `# Simple Python program with functions and input
# This program demonstrates a simple function and user input

# Define a simple function
def greet():
    print("Hi, you are a good guy!")

# Call the function
greet()

# --- Example of getting user input ---
# NOTE: To run code with input, enable Interactive Mode above!

print("\\nIf you want to use input, enable Interactive Mode first!")
print("Then run the code below:")
print("------------------------")

# print("What is your name?")
# name = input()
# print(f"Hello {name}, nice to meet you!")
`
};

// Default language is Python (only option now)
export const defaultLanguage = 'python';

// Get template for a specific language
export const getTemplateForLanguage = (language: string): string => {
  return codeTemplates[language] || codeTemplates[defaultLanguage];
};

// List of available languages with their display names
export const availableLanguages = [
  { id: 'python', name: 'Python', icon: '🐍' },
];

// Improved algorithm to filter out all blank lines and spaces
export function filterTextContent(text: string): string {
  // Return empty string if no text
  if (!text) return '';
  
  // Split text into lines
  const lines = text.split('\n');
  let result = '';
  
  // Iterate through each line
  for (let i = 0; i < lines.length; i++) {
    // Get current line and trim whitespace
    const line = lines[i].trim();
    
    // Only include non-empty lines
    if (line.length > 0) {
      // Add to result with line break if not the first line added
      if (result.length > 0) {
        result += '\n';
      }
      result += line;
    }
  }
  
  // Remove any double line breaks that might have been created
  return result.replace(/\n\s*\n/g, '\n');
} 