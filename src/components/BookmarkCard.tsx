import React from 'react';
import { Edit2, X, Tag } from 'lucide-react';
import { BookmarkItem } from '../types';
import { useBookmarks } from '../context/BookmarkContext';

interface BookmarkCardProps {
  bookmark: BookmarkItem;
  index: number;
  provided: any;
  onEdit: (bookmark: BookmarkItem) => void;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark, index, provided, onEdit }) => {
  const { displaySettings, saveBookmarks, bookmarks } = useBookmarks();
  
  const openBookmark = (url: string) => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url, active: true });
    } else {
      window.open(url, '_blank');
    }
  };
  
  const deleteBookmark = (id: string) => {
    saveBookmarks(bookmarks.filter((b) => b.id !== id));
  };
  
  // Helper functions to get correct size classes based on display settings
  const getCardSizeClass = () => {
    switch (displaySettings.cardSize) {
      case "small": return "w-40";
      case "medium": return "w-48";
      case "large": return "w-64";
      default: return "w-80";
    }
  };

  const getCardSizeHeight = () => {
    switch (displaySettings.cardSize) {
      case "small": return "h-26";
      case "medium": return "h-50";
      case "large": return "h-64";
      default: return "h-60";
    }
  };

  const getCardImageSizeHeight = () => {
    switch (displaySettings.cardSize) {
      case "small": return "h-16";
      case "medium": return "h-24";
      case "large": return "h-36";
      default: return "h-36";
    }
  };

  const getTypographyClass = () => {
    switch (displaySettings.cardSize) {
      case "small": return "text-xs";
      case "medium": return "text-sm";
      case "large": return "text-lg";
      default: return "text-lg";
    }
  }
  
  const layoutClass = displaySettings.categoryLayout === "horizontal" ? "flex-shrink-0" : "";

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`bg-gray-800 ${getCardSizeClass()} ${getCardSizeHeight()} rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer ${layoutClass}`}
      onClick={(e) => {
        // Prevent opening link when clicking on edit/delete buttons
        if (!(e.target as HTMLElement).closest("button")) {
          openBookmark(bookmark.url);
        }
      }}
    >
      <img
        src={bookmark.imageUrl}
        alt={bookmark.title}
        className={`${getCardImageSizeHeight()} ${getCardSizeClass()} object-cover`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=128`;
        }}
      />
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className={`${getTypographyClass()} font-semibold hover:text-red-500 truncate`}>{bookmark.title}</h3>
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => onEdit(bookmark)} 
              className="text-gray-400 hover:text-blue-500"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => deleteBookmark(bookmark.id)} 
              className="text-gray-400 hover:text-red-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        {displaySettings.cardSize !== "small" && (
          <p className="text-gray-400 text-sm mt-2 line-clamp-2">{bookmark.description}</p>
        )}
        {bookmark.tags.length > 0 && displaySettings.cardSize !== "small" && (
          <div className="flex flex-wrap gap-2 mt-3">
            {bookmark.tags.map((tag, i) => (
              <span 
                key={i} 
                className="bg-gray-700 text-xs px-2 py-1 rounded-full flex items-center gap-1" 
                onClick={(e) => e.stopPropagation()}
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkCard;