'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
  theme?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  onChange,
  theme = 'vs-dark',
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  if (!isClient) {
    return <div className="h-96 w-full bg-gray-800 rounded-md animate-pulse"></div>;
  }

  return (
    <div className="h-[500px] border border-gray-700 rounded-md overflow-hidden">
      <Editor
        height="100%"
        width="100%"
        language={language}
        value={code}
        theme={theme}
        onChange={handleEditorChange}
        options={{
          fontSize: 14,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          lineNumbers: 'on',
        }}
      />
    </div>
  );
};

export default CodeEditor; 