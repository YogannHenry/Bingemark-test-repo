import React, { useRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose }) => {
  const { categories, bookmarks, saveCategories, saveBookmarks } = useBookmarks();
  const [newCategory, setNewCategory] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  const addCategory = () => {
    if (!newCategory.trim()) return;

    const category = {
      id: newCategory.toLowerCase().replace(/\s+/g, "-"),
      name: newCategory.trim(),
    };

    saveCategories([...categories, category]);
    setNewCategory("");
  };

  const deleteCategory = (categoryId: string) => {
    // Move bookmarks from deleted category to default
    const updatedBookmarks = bookmarks.map((bookmark) => 
      bookmark.categoryId === categoryId ? { ...bookmark, categoryId: "default" } : bookmark
    );
    saveBookmarks(updatedBookmarks);

    // Remove category
    saveCategories(categories.filter((c) => c.id !== categoryId));
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage Categories</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="New Category Name" 
              className="flex-1 bg-gray-700 rounded p-2" 
              value={newCategory} 
              onChange={(e) => setNewCategory(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCategory();
                }
              }}
            />
            <button 
              onClick={addCategory} 
              className="bg-red-600 hover:bg-red-700 rounded px-4 py-2 font-semibold"
            >
              Add
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between bg-gray-700 rounded p-2">
                <span>{category.name}</span>
                {category.id !== "default" && (
                  <button 
                    onClick={() => deleteCategory(category.id)} 
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;