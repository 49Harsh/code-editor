'use client';

import { useState } from 'react';
import { getResourcesForLanguage } from '@/utils/learningResources';

interface LearningResourcesPanelProps {
  language: string;
}

const LearningResourcesPanel: React.FC<LearningResourcesPanelProps> = ({ language }) => {
  const resources = getResourcesForLanguage(language);
  const [filter, setFilter] = useState<string>('all');

  // Filter resources by type
  const filteredResources = filter === 'all' 
    ? resources 
    : resources.filter(resource => resource.type === filter);

  // Get icon for resource type
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'tutorial':
        return '📚';
      case 'documentation':
        return '📄';
      case 'course':
        return '🎓';
      case 'challenge':
        return '🏆';
      default:
        return '📖';
    }
  };

  if (resources.length === 0) {
    return (
      <div className="rounded-md bg-white dark:bg-gray-800 p-4 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Learning Resources</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          No resources available for this language yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md bg-white dark:bg-gray-800 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Learning Resources</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-1 text-xs rounded-full ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('tutorial')}
            className={`px-2 py-1 text-xs rounded-full ${
              filter === 'tutorial'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Tutorials
          </button>
          <button
            onClick={() => setFilter('course')}
            className={`px-2 py-1 text-xs rounded-full ${
              filter === 'course'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Courses
          </button>
        </div>
      </div>

      <div className="space-y-3 mt-3">
        {filteredResources.map((resource, index) => (
          <a
            key={index}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <div className="flex items-start space-x-3">
              <div className="text-xl">{getResourceIcon(resource.type)}</div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">{resource.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{resource.description}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                    {resource.level}
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default LearningResourcesPanel; 