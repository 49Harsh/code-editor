// Code templates for different programming languages
export const codeTemplates: Record<string, string> = {
  python: `# Welcome to Python Programming!
# This is a simple Python program that asks for your name and greets you

# NOTE: Before running this code, make sure to:
# 1. Check "Enable Input" above
# 2. Enter sample values in the input box for each input() call
# For example: "John" and "25" (each on a separate line)

name = input("What is your name? ")
print(f"Hello, {name}! Welcome to CodeLab!")

# Try printing something else:
print("Python is a fun language to learn!")

# Simple math calculation
age = input("How old are you? ")
years_to_100 = 100 - int(age)
print(f"You will be 100 years old in {years_to_100} years!")`,

  javascript: `// Welcome to JavaScript Programming!
// This is a simple program that prints messages to the console

console.log("Hello, World! Welcome to CodeLab!");

// Let's do some simple math
const num1 = 10;
const num2 = 5;
console.log(num1 + " + " + num2 + " = " + (num1 + num2));
console.log(num1 + " - " + num2 + " = " + (num1 - num2));
console.log(num1 + " * " + num2 + " = " + (num1 * num2));
console.log(num1 + " / " + num2 + " = " + (num1 / num2));

// Try using a function
function greetUser(name) {
  return "Hello, " + name + "! Nice to meet you.";
}

// You can get user input in the terminal below
// For now, we'll use a default name
const greeting = greetUser("Coder");
console.log(greeting);`
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