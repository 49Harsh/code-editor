# CodeLab - Online Coding Editor

CodeLab is an interactive coding playground designed for young programmers to learn and experiment with different programming languages. This web-based application provides a user-friendly interface with a code editor, terminal output, and helpful resources to make coding accessible and fun.

## Features

- **Code Editor**: Write code with syntax highlighting for multiple languages
- **Terminal Output**: See the results of your code execution in real-time
- **Input Support**: Enter input for programs that require user interaction
- **Multiple Languages**: Support for Python, JavaScript, Java, C++, C#, Ruby, and Go
- **Learning Resources**: Access to relevant tutorials, documentation, and courses
- **Code Explanations**: Get explanations about what your code does and how it works
- **Dark/Light Themes**: Choose your preferred visual theme

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/codelab.git
   cd codelab
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

To create a production build:

```
npm run build
```

The output will be in the `out` directory, which can be served by any static web server.

## How to Use

1. **Select a Language**: Choose your preferred programming language from the dropdown menu
2. **Write Code**: Use the editor to write or modify code
3. **Run Code**: Click the "Run Code" button to execute your code
4. **View Output**: See the results in the terminal section below
5. **Access Resources**: Use the sidebar to access learning materials and code explanations

## Deployment

This application can be easily deployed to various static hosting platforms:

- **Vercel**: Connect your Git repository for automatic deployments
- **Netlify**: Deploy directly from Git or upload the `out` directory
- **GitHub Pages**: Upload the `out` directory to a GitHub Pages branch

## Technologies Used

- Next.js
- React
- Monaco Editor (VS Code's editor)
- xterm.js (Terminal emulator)
- Tailwind CSS (Styling)
- Piston API (Code execution)

## Acknowledgments

- Monaco Editor for the powerful code editing capabilities
- Piston API for code execution functionality
- Tailwind CSS for the responsive design

## License

This project is licensed under the MIT License - see the LICENSE file for details
