import React from 'react';
import { useBookmarks } from '../context/BookmarkContext';

const CategoryList: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory } = useBookmarks();

  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <button 
        onClick={() => setSelectedCategory("all")} 
        className={`px-4 py-2 rounded-full ${
          selectedCategory === "all" ? "bg-red-600" : "bg-gray-800 hover:bg-gray-700"
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button 
          key={category.id} 
          onClick={() => setSelectedCategory(category.id)} 
          className={`px-4 py-2 rounded-full ${
            selectedCategory === category.id ? "bg-red-600" : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryList;