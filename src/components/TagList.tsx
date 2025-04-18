import React from 'react';
import { Tag } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';

const TagList: React.FC = () => {
  const { getAllTags, selectedTags, toggleTag } = useBookmarks();
  const allTags = getAllTags();
  
  if (allTags.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {allTags.map((tag) => (
        <button 
          key={tag} 
          onClick={() => toggleTag(tag)} 
          className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
            selectedTags.includes(tag) ? "bg-red-600" : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          <Tag className="w-3 h-3" />
          {tag}
        </button>
      ))}
    </div>
  );
};

export default TagList;