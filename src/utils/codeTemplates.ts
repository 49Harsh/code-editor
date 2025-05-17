// Code templates for different programming languages
export const codeTemplates: Record<string, string> = {
  python: `# Welcome to Python Programming!
# This is a simple Python program that asks for your name and greets you

# NOTE: Before running this code, make sure to:
# 1. Check "Enable Input" above
# 2. Enter sample values in the input box for each input() call
# For example: "John" and "25" (each on a separate line)

class Calculator:
    @staticmethod
    def add_numbers(num1, num2):
        return num1 + num2

# Example call with hardcoded values
result = Calculator.add_numbers(10, 20)

print("The sum is:", result)
`,

  javascript: `// Welcome to JavaScript Programming!
// This is a simple program that demonstrates both output and input

// NOTE: Before running this code, make sure to:
// 1. Enable Interactive Mode above
// 2. Enter your name when prompted in the terminal below

// First, let's do some simple calculations
const num1 = 10;
const num2 = 5;
console.log(num1 + " + " + num2 + " = " + (num1 + num2));
console.log(num1 + " - " + num2 + " = " + (num1 - num2));
console.log(num1 + " * " + num2 + " = " + (num1 * num2));
console.log(num1 + " / " + num2 + " = " + (num1 / num2));

// Now let's get input from the user
// This uses the Node.js readline module to get input
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask for the user's name
console.log("Let's get to know you!");
readline.question('What is your name? ', (name) => {
  console.log(\`Hello, \${name}! Nice to meet you.\`);
  
  // Ask for their age
  readline.question('How old are you? ', (age) => {
    console.log(\`Wow, \${age} years old! That's great!\`);
    
    // Calculate birth year (approximate)
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - parseInt(age);
    console.log(\`You were born around \${birthYear}.\`);
    
    // Close the readline interface
    readline.close();
  });
});`
};

// Default language to show when the app loads
export const defaultLanguage = 'python';

// Get template for a specific language
export const getTemplateForLanguage = (language: string): string => {
  return codeTemplates[language] || codeTemplates[defaultLanguage];
};

// List of available languages with their display names
export const availableLanguages = [
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'javascript', name: 'JavaScript', icon: '📜' },
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