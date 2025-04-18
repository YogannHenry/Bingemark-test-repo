import React, { useRef, useEffect, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';
import { BookmarkItem } from '../types';

interface ImportExportMenuProps {
  onClose: () => void;
}

const ImportExportMenu: React.FC<ImportExportMenuProps> = ({ onClose }) => {
  const { bookmarks, saveBookmarks } = useBookmarks();
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<"replace" | "add">("add");

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

  const importChromeBookmarks = () => {
    if (typeof chrome === 'undefined' || !chrome.bookmarks) {
      alert('Chrome bookmarks API is not available');
      return;
    }

    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
      const extractBookmarks = (nodes: chrome.bookmarks.BookmarkTreeNode[]): BookmarkItem[] => {
        const items: BookmarkItem[] = [];
        
        nodes.forEach(node => {
          if (node.url) {
            items.push({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              title: node.title,
              url: node.url,
              description: '',
              imageUrl: `https://www.google.com/s2/favicons?domain=${new URL(node.url).hostname}&sz=128`,
              tags: [],
              categoryId: 'default'
            });
          }
          if (node.children) {
            items.push(...extractBookmarks(node.children));
          }
        });
        
        return items;
      };

      const newBookmarks = extractBookmarks(bookmarkTreeNodes);
      
      if (importMode === 'replace') {
        saveBookmarks(newBookmarks);
      } else {
        const existingUrls = new Set(bookmarks.map(b => b.url));
        const uniqueNewBookmarks = newBookmarks.filter(b => !existingUrls.has(b.url));
        saveBookmarks([...bookmarks, ...uniqueNewBookmarks]);
      }

      alert(`Successfully imported ${newBookmarks.length} bookmarks!`);
      onClose();
    });
  };

  const importBookmarksFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonBookmarks = JSON.parse(e.target?.result as string) as BookmarkItem[];

        if (!Array.isArray(jsonBookmarks)) {
          alert("Invalid bookmark file format");
          return;
        }

        if (importMode === "replace") {
          saveBookmarks(jsonBookmarks);
          alert(`Replaced bookmarks with ${jsonBookmarks.length} imported bookmarks`);
        } else {
          const existingUrls = new Set(bookmarks.map(b => b.url));
          const uniqueNewBookmarks = jsonBookmarks.filter(b => !existingUrls.has(b.url));
          saveBookmarks([...bookmarks, ...uniqueNewBookmarks]);
          alert(`Added ${uniqueNewBookmarks.length} new bookmarks`);
        }
        onClose();
      } catch (error) {
        console.error("Error parsing JSON:", error);
        alert(`Failed to import: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    reader.readAsText(file);
  };

  const exportBookmarksAsJson = () => {
    const bookmarksJson = JSON.stringify(bookmarks, null, 2);
    const blob = new Blob([bookmarksJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "bookmarks.json";
    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    onClose();
  };

  return (
    <div 
      ref={menuRef}
      className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
    >
      <div className="py-1">
        <button
          onClick={importChromeBookmarks}
          className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Import Chrome Bookmarks</span>
        </button>
        
        <div className="px-4 py-2 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-2">Import from JSON file:</p>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setImportMode("add")}
              className={`px-3 py-1 text-xs rounded ${
                importMode === "add" ? "bg-red-600" : "bg-gray-700"
              }`}
            >
              Add
            </button>
            <button
              onClick={() => setImportMode("replace")}
              className={`px-3 py-1 text-xs rounded ${
                importMode === "replace" ? "bg-red-600" : "bg-gray-700"
              }`}
            >
              Replace
            </button>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Select JSON File</span>
          </button>
          
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={importBookmarksFromJson}
            style={{ display: 'none' }}
          />
        </div>
        
        <button
          onClick={exportBookmarksAsJson}
          className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2 border-t border-gray-700"
        >
          <Download className="w-4 h-4" />
          <span>Export as JSON</span>
        </button>
      </div>
    </div>
  );
};

export default ImportExportMenu;