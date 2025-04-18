import React, { useState } from 'react';
import { BookmarkProvider } from './context/BookmarkContext';
import Header from './components/Header';
import CategoryList from './components/CategoryList';
import TagList from './components/TagList';
import BookmarkGrid from './components/BookmarkGrid';
import BookmarkModal from './components/BookmarkModal';
import CategoryModal from './components/CategoryModal';
import { BookmarkItem } from './types';

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

  return (
    <BookmarkProvider>
      <div className="min-h-screen bg-[#141414] text-white p-8">
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
    </BookmarkProvider>
  );
}

export default App;