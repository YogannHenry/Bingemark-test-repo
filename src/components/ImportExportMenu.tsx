import React, { useRef, useEffect } from 'react';
import {ExternalLink } from 'lucide-react';

interface ImportExportMenuProps {
  onClose: () => void;
}

const ImportExportMenu: React.FC<ImportExportMenuProps> = ({ onClose }) => {
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

  const openImportExportTab = () => {
    chrome.runtime.sendMessage(
      { type: "openImportExportTab" },
      (response) => {
        if (response.success) {
          onClose();
        }
      }
    );
  };

  return (
    <div 
      ref={menuRef}
      className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
    >
      <div className="py-1">
        <button
          onClick={openImportExportTab}
          className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open Import/Export Page</span>
        </button>
      </div>
    </div>
  );
};

export default ImportExportMenu;