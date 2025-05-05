import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BookmarkItem, Category, DisplaySettings } from '../types';

interface BookmarkContextType {
  bookmarks: BookmarkItem[];
  categories: Category[];
  displaySettings: DisplaySettings;
  hiddenCategories: string[];
  searchTerm: string;
  selectedCategory: string;
  selectedTags: string[];
  saveBookmarks: (bookmarks: BookmarkItem[]) => void;
  saveCategories: (categories: Category[]) => void;
  saveDisplaySettings: (settings: DisplaySettings) => void;
  saveHiddenCategories: (categories: string[]) => void;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedTags: (tags: string[]) => void;
  toggleTag: (tag: string) => void;
  getAllTags: () => string[];
  getFilteredBookmarks: () => BookmarkItem[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarkProvider");
  }
  return context;
};

interface BookmarkProviderProps {
  children: ReactNode;
}

export const BookmarkProvider: React.FC<BookmarkProviderProps> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: "default", name: "General" },
    { id: "work", name: "Work" },
    { id: "personal", name: "Personal" },
  ]);
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    cardSize: "large",
    categoryLayout: "grid",
  });
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Load data from storage when component mounts
    if (typeof chrome === "undefined" || !chrome.storage) {
      console.error("Chrome storage API not available");
      return;
    }

    const loadFromStorage = () => {
      chrome.storage.local.get(["bookmarks", "categories", "displaySettings", "hiddenCategories"], (result) => {
        if (result.bookmarks) {
          setBookmarks(result.bookmarks);
        }

        if (result.categories) {
          setCategories(result.categories);
        }

        if (result.displaySettings) {
          setDisplaySettings(result.displaySettings);
        }

        if (result.hiddenCategories) {
          setHiddenCategories(result.hiddenCategories);
        }
      });
    };

    try {
      chrome.runtime.sendMessage({ action: "ping" }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn("Background script ping failed:", chrome.runtime.lastError);
        }
        
        // Load data regardless of ping outcome
        loadFromStorage();
      });
    } catch (error) {
      console.error("Error pinging background script:", error);
      loadFromStorage();
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', theme === 'light');
  }, [theme]);

  const saveBookmarks = (updatedBookmarks: BookmarkItem[]) => {
    chrome.storage.local.set({ bookmarks: updatedBookmarks }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving bookmarks:", chrome.runtime.lastError);
        alert(`Failed to save bookmarks: ${chrome.runtime.lastError.message}`);
      } else {
        setBookmarks(updatedBookmarks);
      }
    });
  };

  const saveCategories = (updatedCategories: Category[]) => {
    chrome.storage.local.set({ categories: updatedCategories }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving categories:", chrome.runtime.lastError);
        alert(`Failed to save categories: ${chrome.runtime.lastError.message}`);
      } else {
        setCategories(updatedCategories);
      }
    });
  };

  const saveDisplaySettings = (settings: DisplaySettings) => {
    chrome.storage.local.set({ displaySettings: settings }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving display settings:", chrome.runtime.lastError);
      } else {
        setDisplaySettings(settings);
      }
    });
  };

  const saveHiddenCategories = (categories: string[]) => {
    chrome.storage.local.set({ hiddenCategories: categories }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving hidden categories:", chrome.runtime.lastError);
      } else {
        setHiddenCategories(categories);
      }
    });
  };

  const getAllTags = () => {
    const tagSet = new Set<string>();
    bookmarks.forEach((bookmark) => {
      bookmark.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => 
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getFilteredBookmarks = () => {
    return bookmarks.filter((bookmark) => {
      const matchesSearch = 
        bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        bookmark.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        bookmark.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === "all" || bookmark.categoryId === selectedCategory;

      const matchesTags = 
        selectedTags.length === 0 || 
        selectedTags.every((tag) => bookmark.tags.includes(tag));

      return matchesSearch && matchesCategory && matchesTags;
    });
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    chrome.storage.local.set({ theme: newTheme }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving theme:", chrome.runtime.lastError);
      } else {
        setTheme(newTheme);
      }
    });
  };

  const value = {
    bookmarks,
    categories,
    displaySettings,
    hiddenCategories,
    searchTerm,
    selectedCategory,
    selectedTags,
    saveBookmarks,
    saveCategories,
    saveDisplaySettings,
    saveHiddenCategories,
    setSearchTerm,
    setSelectedCategory,
    setSelectedTags,
    toggleTag,
    getAllTags,
    getFilteredBookmarks,
    theme,
    toggleTheme,
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};