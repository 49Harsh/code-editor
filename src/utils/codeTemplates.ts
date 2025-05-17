// Code templates for different programming languages
export const codeTemplates: Record<string, string> = {
  python: `# Simple Python program with input
# This program asks for your name and greets you

# Print a welcome message
print("Welcome to Python CodeLab!")
print("------------------------")

# Ask for user input
print("What is your name?")
name = input()

# Display a greeting
print(f"Hello {name}, nice to meet you!")

# Do a simple calculation 
print("Let me show you a calculation.")
print(f"The sum of the first 10 numbers is: {sum(range(1, 11))}")

# End of program
print("Thanks for trying Python!")
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