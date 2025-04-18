import React, { useRef, useEffect, useState } from 'react';
import { X, Image, Tag } from 'lucide-react';
import { BookmarkItem } from '../types';
import { useBookmarks } from '../context/BookmarkContext';

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmark?: Partial<BookmarkItem>;
  editingBookmarkId: string | null;
}

const BookmarkModal: React.FC<BookmarkModalProps> = ({ 
  isOpen, 
  onClose, 
  bookmark = {}, 
  editingBookmarkId 
}) => {
  const { bookmarks, categories, saveBookmarks } = useBookmarks();
  const [newBookmark, setNewBookmark] = useState<Partial<BookmarkItem>>({
    title: bookmark.title || "",
    url: bookmark.url || "",
    description: bookmark.description || "",
    imageUrl: bookmark.imageUrl || "",
    tags: bookmark.tags || [],
    categoryId: bookmark.categoryId || "default",
  });
  const [currentTag, setCurrentTag] = useState<string>("");
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setNewBookmark({
      title: bookmark.title || "",
      url: bookmark.url || "",
      description: bookmark.description || "",
      imageUrl: bookmark.imageUrl || "",
      tags: bookmark.tags || [],
      categoryId: bookmark.categoryId || "default",
    });
  }, [bookmark]);
  
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
  
  const fetchOgImage = async (url: string) => {
    try {
      setIsLoadingImage(true);
      const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      if (data.data?.image?.url) {
        setNewBookmark((prev) => ({ ...prev, imageUrl: data.data.image.url }));
      } else {
        // Fallback to favicon if no OG image
        setNewBookmark((prev) => ({
          ...prev,
          imageUrl: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`,
        }));
      }
    } catch (error) {
      console.error("Error fetching image:", error);
      // Fallback to favicon on error
      setNewBookmark((prev) => ({
        ...prev,
        imageUrl: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`,
      }));
    } finally {
      setIsLoadingImage(false);
    }
  };
  
  const addBookmark = () => {
    if (!newBookmark.title || !newBookmark.url) return;

    const bookmark: BookmarkItem = {
      id: Date.now().toString(),
      title: newBookmark.title!,
      url: newBookmark.url!,
      description: newBookmark.description || "",
      imageUrl: newBookmark.imageUrl || `https://www.google.com/s2/favicons?domain=${new URL(newBookmark.url!).hostname}&sz=128`,
      tags: newBookmark.tags || [],
      categoryId: newBookmark.categoryId || "default",
    };

    saveBookmarks([...bookmarks, bookmark]);
    onClose();
  };
  
  const updateBookmark = () => {
    if (!editingBookmarkId || !newBookmark.title || !newBookmark.url) return;

    const updatedBookmarks = bookmarks.map((bookmark) =>
      bookmark.id === editingBookmarkId
        ? {
            ...bookmark,
            title: newBookmark.title!,
            url: newBookmark.url!,
            description: newBookmark.description || "",
            imageUrl: newBookmark.imageUrl || bookmark.imageUrl,
            tags: newBookmark.tags || [],
            categoryId: newBookmark.categoryId || "default",
          }
        : bookmark
    );

    saveBookmarks(updatedBookmarks);
    onClose();
  };
  
  const addTagToBookmark = () => {
    if (!currentTag.trim()) return;

    // Check if tag already exists
    if (newBookmark.tags?.includes(currentTag.trim())) {
      return;
    }

    setNewBookmark({
      ...newBookmark,
      tags: [...(newBookmark.tags || []), currentTag.trim()],
    });

    // Clear the input
    setCurrentTag("");
  };

  const removeTagFromBookmark = (tagToRemove: string) => {
    setNewBookmark({
      ...newBookmark,
      tags: newBookmark.tags?.filter((tag) => tag !== tagToRemove) || [],
    });
  };
  
  // Get all unique tags from bookmarks for suggestions
  const getAllTags = () => {
    const tagSet = new Set<string>();
    bookmarks.forEach((bookmark) => {
      bookmark.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editingBookmarkId ? "Edit Bookmark" : "Add New Bookmark"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Title" 
            className="w-full bg-gray-700 rounded p-2" 
            value={newBookmark.title} 
            onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })} 
          />
          <div className="flex gap-2">
            <input 
              type="url" 
              placeholder="URL" 
              className="flex-1 bg-gray-700 rounded p-2" 
              value={newBookmark.url} 
              onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })} 
            />
            <button 
              onClick={() => newBookmark.url && fetchOgImage(newBookmark.url)} 
              className="bg-blue-600 hover:bg-blue-700 rounded px-3 py-2" 
              disabled={!newBookmark.url || isLoadingImage}
            >
              <Image className="w-5 h-5" />
            </button>
          </div>
          <input 
            type="url" 
            placeholder="Custom Image URL (optional)" 
            className="w-full bg-gray-700 rounded p-2" 
            value={newBookmark.imageUrl} 
            onChange={(e) => setNewBookmark({ ...newBookmark, imageUrl: e.target.value })} 
          />
          <textarea 
            placeholder="Description" 
            className="w-full bg-gray-700 rounded p-2" 
            value={newBookmark.description} 
            onChange={(e) => setNewBookmark({ ...newBookmark, description: e.target.value })} 
          />

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a tag"
                className="flex-1 bg-gray-700 rounded p-2"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTagToBookmark();
                  }
                }}
              />
              <button 
                onClick={addTagToBookmark} 
                className="bg-blue-600 hover:bg-blue-700 rounded px-3 py-2"
              >
                <Tag className="w-5 h-5" />
              </button>
            </div>

            {/* Existing tags dropdown */}
            {getAllTags().length > 0 && (
              <div className="mt-2">
                <label className="block text-sm text-gray-400 mb-1">Select existing tag:</label>
                <div className="flex flex-wrap gap-2">
                  {getAllTags()
                    .filter((tag) => !newBookmark.tags?.includes(tag))
                    .map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setNewBookmark({
                            ...newBookmark,
                            tags: [...(newBookmark.tags || []), tag],
                          });
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-sm px-2 py-1 rounded-full flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Display current tags */}
            {newBookmark.tags && newBookmark.tags.length > 0 && (
              <div className="mt-2">
                <label className="block text-sm text-gray-400 mb-1">Current tags:</label>
                <div className="flex flex-wrap gap-2">
                  {newBookmark.tags.map((tag, i) => (
                    <div key={i} className="bg-red-600 text-white text-sm px-2 py-1 rounded-full flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                      <button 
                        onClick={() => removeTagFromBookmark(tag)} 
                        className="ml-1 hover:bg-red-700 rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <select 
            className="w-full bg-gray-700 rounded p-2" 
            value={newBookmark.categoryId} 
            onChange={(e) => setNewBookmark({ ...newBookmark, categoryId: e.target.value })}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button 
            onClick={editingBookmarkId ? updateBookmark : addBookmark} 
            className="w-full bg-red-600 hover:bg-red-700 rounded p-2 font-semibold"
          >
            {editingBookmarkId ? "Update Bookmark" : "Add Bookmark"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookmarkModal;