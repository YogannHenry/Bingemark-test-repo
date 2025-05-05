import React, { useState } from 'react';
import { useBookmarks } from '../context/BookmarkContext';
import Header from '../components/Header';
import CategoryList from '../components/CategoryList';
import TagList from '../components/TagList';
import BookmarkGrid from '../components/BookmarkGrid';
import BookmarkModal from '../components/BookmarkModal';
import CategoryModal from '../components/CategoryModal';
import { BookmarkItem } from '../types';

function App() {
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newBookmark, setNewBookmark] = useState<Partial<BookmarkItem>>({
    title: '',
    url: '',
    description: '',
    imageUrl: '',
    tags: [],
    categoryId: 'default',
  });
  const {  theme } = useBookmarks();

  return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#141414] text-white' : 'bg-white text-black'} p-8`}>
        <div className="max-w-7xl mx-auto">
          <Header />
          <CategoryList />
          <TagList />
          <BookmarkGrid />
          
          {/* Add Bookmark Modal */}
          {isAddingBookmark && (
            <BookmarkModal 
              isOpen={isAddingBookmark}
              onClose={() => {
                setIsAddingBookmark(false);
                setNewBookmark({
                  title: '',
                  url: '',
                  description: '',
                  imageUrl: '',
                  tags: [],
                  categoryId: 'default',
                });
              }}
              bookmark={newBookmark}
              editingBookmarkId={null}
            />
          )}
          
          {/* Manage Categories Modal */}
          {isManagingCategories && (
            <CategoryModal
              isOpen={isManagingCategories}
              onClose={() => setIsManagingCategories(false)}
            />
          )}
        </div>
      </div>
  );
}

export default App;