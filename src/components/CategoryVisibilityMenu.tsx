import React, { useRef, useEffect } from 'react';
import { useBookmarks } from '../context/BookmarkContext';

interface CategoryVisibilityMenuProps {
  onClose: () => void;
}

const CategoryVisibilityMenu: React.FC<CategoryVisibilityMenuProps> = ({ onClose }) => {
  const { categories, hiddenCategories, saveHiddenCategories } = useBookmarks();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const toggleCategoryVisibility = (categoryId: string) => {
    const updatedHiddenCategories = hiddenCategories.includes(categoryId)
      ? hiddenCategories.filter(id => id !== categoryId)
      : [...hiddenCategories, categoryId];
    
    saveHiddenCategories(updatedHiddenCategories);
  };

  return (
    <div 
      ref={menuRef} 
      className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
    >
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-medium mb-2">Show/Hide Categories</h3>
        {categories.map((category) => (
          <div key={category.id} className="flex items-center">
            <input 
              type="checkbox" 
              id={`visibility-${category.id}`} 
              checked={!hiddenCategories.includes(category.id)} 
              onChange={() => toggleCategoryVisibility(category.id)} 
              className="rounded text-red-600 focus:ring-red-500 h-4 w-4 mr-2" 
            />
            <label htmlFor={`visibility-${category.id}`} className="text-sm">
              {category.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryVisibilityMenu;