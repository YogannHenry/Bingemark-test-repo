import React, { useRef, useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';

interface DisplaySettingsMenuProps {
  onClose: () => void;
}

const DisplaySettingsMenu: React.FC<DisplaySettingsMenuProps> = ({ onClose }) => {
  const { displaySettings, saveDisplaySettings } = useBookmarks();
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

  return (
    <div 
      ref={menuRef} 
      className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
    >
      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Card Size</h3>
          <div className="flex gap-2">
            {(["small", "medium", "large"] as const).map((size) => (
              <button 
                key={size} 
                onClick={() => saveDisplaySettings({ ...displaySettings, cardSize: size })} 
                className={`px-3 py-1 rounded-md text-sm ${displaySettings.cardSize === size ? "bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2">Category Layout</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => saveDisplaySettings({ ...displaySettings, categoryLayout: "grid" })} 
              className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${displaySettings.categoryLayout === "grid" ? "bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}
            >
              <LayoutGrid className="w-4 h-4" />
              Grid
            </button>
            <button 
              onClick={() => saveDisplaySettings({ ...displaySettings, categoryLayout: "flex" })} 
              className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${displaySettings.categoryLayout === "flex" ? "bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-4 h-4"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              Flex
            </button>
            <button 
              onClick={() => saveDisplaySettings({ ...displaySettings, categoryLayout: "horizontal" })} 
              className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${displaySettings.categoryLayout === "horizontal" ? "bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-4 h-4"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
              Scroll
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplaySettingsMenu;