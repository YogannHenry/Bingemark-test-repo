import React, { useState, useRef } from "react";
import { Search, Settings, BookmarkPlus, FolderPlus, Download, ChevronDown, Sun, Moon } from "lucide-react";
import { useBookmarks } from "../context/BookmarkContext";
import DisplaySettingsMenu from "./DisplaySettingsMenu";
import CategoryVisibilityMenu from "./CategoryVisibilityMenu";
import ImportExportMenu from "./ImportExportMenu";
import BookmarkModal from "./BookmarkModal";
import CategoryModal from "./CategoryModal";

const Header: React.FC = () => {
  const { searchTerm, setSearchTerm, theme, toggleTheme } = useBookmarks();
  const [isDisplayMenuOpen, setIsDisplayMenuOpen] = useState(false);
  const [isCategoryVisibilityMenuOpen, setIsCategoryVisibilityMenuOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);

  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);

  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-red-600">
          <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
        <h1 className="text-3xl font-bold">Bingemark</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative ml-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookmarks..."
            className={`${theme === "dark" ? "bg-gray-800 text-white placeholder-gray-400 focus:ring-red-600" : "bg-white text-black placeholder-gray-500 focus:ring-sky-600 border border-slate-900"} rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <button onClick={() => setIsDisplayMenuOpen(!isDisplayMenuOpen)} className={`${theme === "dark" ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-slate-300"} rounded-full p-2`} title="Display settings">
            <Settings className="w-6 h-6" />
          </button>

          {isDisplayMenuOpen && <DisplaySettingsMenu onClose={() => setIsDisplayMenuOpen(false)} />}
        </div>

        <div className="relative">
          <button onClick={() => setIsCategoryVisibilityMenuOpen(!isCategoryVisibilityMenuOpen)} className={`${theme === "dark" ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-slate-300"} rounded-full p-2`} title="Toggle category visibility">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>

          {isCategoryVisibilityMenuOpen && <CategoryVisibilityMenu onClose={() => setIsCategoryVisibilityMenuOpen(false)} />}
        </div>

        <button onClick={() => setIsAddingBookmark(true)} className={`${theme === "dark" ? "text-white" : "text-white"} rounded-full p-2 bg-red-600 hover:bg-red-700`} title="Add new bookmark">
          <BookmarkPlus className="w-6 h-6" />
        </button>

        {isAddingBookmark && <BookmarkModal isOpen={isAddingBookmark} onClose={() => setIsAddingBookmark(false)} bookmark={{}} editingBookmarkId={null} />}

        <button onClick={() => setIsManagingCategories(true)} className={`${theme === "dark" ? "text-white" : "text-white"} rounded-full p-2 bg-red-600 hover:bg-red-700`} title="Manage categories">
          <FolderPlus className="w-6 h-6" />
        </button>

        {isManagingCategories && <CategoryModal isOpen={isManagingCategories} onClose={() => setIsManagingCategories(false)} />}

        <div className="relative">
          <button onClick={() => setIsImportMenuOpen(!isImportMenuOpen)} className={`${theme === "dark" ? "text-white" : "text-white"} bg-sky-600 hover:bg-sky-700 rounded-full p-2 flex items-center gap-1`} title="Import/Export">
            <Download className="w-6 h-6" />
            <ChevronDown className="w-4 h-4" />
          </button>

          {isImportMenuOpen && <ImportExportMenu onClose={() => setIsImportMenuOpen(false)} />}
        </div>

        <div className="relative">
          <button onClick={toggleTheme}  className={`${theme === "dark" ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-slate-300"} rounded-full p-2`} title="Toggle theme">
            {theme === "dark" ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
