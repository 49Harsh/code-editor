// Learning resources for different programming languages

export interface Resource {
  title: string;
  url: string;
  description: string;
  type: 'tutorial' | 'documentation' | 'course' | 'challenge';
  level: 'beginner' | 'intermediate' | 'advanced';
}

export const learningResources: Record<string, Resource[]> = {
  python: [
    {
      title: 'Python for Beginners',
      url: 'https://www.python.org/about/gettingstarted/',
      description: 'Official Python.org getting started guide',
      type: 'tutorial',
      level: 'beginner',
    },
    {
      title: 'Python Documentation',
      url: 'https://docs.python.org/3/',
      description: 'Official Python documentation',
      type: 'documentation',
      level: 'beginner',
    },
    {
      title: 'Codecademy Python Course',
      url: 'https://www.codecademy.com/learn/learn-python-3',
      description: 'Interactive Python course',
      type: 'course',
      level: 'beginner',
    },
    {
      title: 'Python Coding Challenges',
      url: 'https://www.codewars.com/?language=python',
      description: 'Practice Python with coding challenges',
      type: 'challenge',
      level: 'intermediate',
    },
  ],
  javascript: [
    {
      title: 'JavaScript Guide',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
      description: 'MDN Web Docs JavaScript guide',
      type: 'tutorial',
      level: 'beginner',
    },
    {
      title: 'JavaScript Documentation',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      description: 'MDN Web Docs JavaScript reference',
      type: 'documentation',
      level: 'beginner',
    },
    {
      title: 'Codecademy JavaScript Course',
      url: 'https://www.codecademy.com/learn/introduction-to-javascript',
      description: 'Interactive JavaScript course',
      type: 'course',
      level: 'beginner',
    },
    {
      title: 'JavaScript Coding Challenges',
      url: 'https://www.codewars.com/?language=javascript',
      description: 'Practice JavaScript with coding challenges',
      type: 'challenge',
      level: 'intermediate',
    },
  ],
  java: [
    {
      title: 'Java Tutorials',
      url: 'https://docs.oracle.com/javase/tutorial/',
      description: 'Official Java tutorials',
      type: 'tutorial',
      level: 'beginner',
    },
    {
      title: 'Java Documentation',
      url: 'https://docs.oracle.com/en/java/',
      description: 'Official Java documentation',
      type: 'documentation',
      level: 'beginner',
    },
    {
      title: 'Codecademy Java Course',
      url: 'https://www.codecademy.com/learn/learn-java',
      description: 'Interactive Java course',
      type: 'course',
      level: 'beginner',
    },
    {
      title: 'Java Coding Challenges',
      url: 'https://www.codewars.com/?language=java',
      description: 'Practice Java with coding challenges',
      type: 'challenge',
      level: 'intermediate',
    },
  ],
  cpp: [
    {
      title: 'C++ Tutorial',
      url: 'https://www.learncpp.com/',
      description: 'Comprehensive C++ tutorial',
      type: 'tutorial',
      level: 'beginner',
    },
    {
      title: 'C++ Reference',
      url: 'https://en.cppreference.com/w/',
      description: 'C++ language reference',
      type: 'documentation',
      level: 'beginner',
    },
    {
      title: 'Codecademy C++ Course',
      url: 'https://www.codecademy.com/learn/learn-c-plus-plus',
      description: 'Interactive C++ course',
      type: 'course',
      level: 'beginner',
    },
    {
      title: 'C++ Coding Challenges',
      url: 'https://www.codewars.com/?language=cpp',
      description: 'Practice C++ with coding challenges',
      type: 'challenge',
      level: 'intermediate',
    },
  ],
  csharp: [
    {
      title: 'C# Guide',
      url: 'https://docs.microsoft.com/en-us/dotnet/csharp/',
      description: 'Official Microsoft C# guide',
      type: 'tutorial',
      level: 'beginner',
    },
    {
      title: 'C# Documentation',
      url: 'https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/',
      description: 'Official C# programming guide',
      type: 'documentation',
      level: 'beginner',
    },
    {
      title: 'Codecademy C# Course',
      url: 'https://www.codecademy.com/learn/learn-c-sharp',
      description: 'Interactive C# course',
      type: 'course',
      level: 'beginner',
    },
    {
      title: 'C# Coding Challenges',
      url: 'https://www.codewars.com/?language=csharp',
      description: 'Practice C# with coding challenges',
      type: 'challenge',
      level: 'intermediate',
    },
  ],
};

// Get resources for a specific language
export const getResourcesForLanguage = (language: string): Resource[] => {
  return learningResources[language] || [];
};

// Get all beginner resources across languages
export const getBeginnerResources = (): Resource[] => {
  const beginnerResources: Resource[] = [];
  
  Object.values(learningResources).forEach(resources => {
    resources.forEach(resource => {
      if (resource.level === 'beginner') {
        beginnerResources.push(resource);
      }
    });
  });
  
  return beginnerResources;
}; 