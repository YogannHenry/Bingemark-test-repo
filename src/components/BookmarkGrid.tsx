import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Folder } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';
import BookmarkCard from './BookmarkCard';
import BookmarkModal from './BookmarkModal';
import { BookmarkItem } from '../types';

const BookmarkGrid: React.FC = () => {
  const { 
    bookmarks, 
    categories, 
    displaySettings, 
    hiddenCategories, 
    selectedCategory,
    saveBookmarks,
    getFilteredBookmarks
  } = useBookmarks();
  
  const [isEditingBookmark, setIsEditingBookmark] = useState(false);
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [currentBookmark, setCurrentBookmark] = useState<Partial<BookmarkItem>>({});
  
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(bookmarks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    reorderedItem.categoryId = result.destination.droppableId;
    items.splice(result.destination.index, 0, reorderedItem);

    saveBookmarks(items);
  };
  
  const editBookmark = (bookmark: BookmarkItem) => {
    setEditingBookmarkId(bookmark.id);
    setCurrentBookmark(bookmark);
    setIsEditingBookmark(true);
  };
  
  // Helper function to get grid class based on display settings
  const getCategoryLayoutClass = () => {
    switch (displaySettings.categoryLayout) {
      case "grid":
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
      case "flex":
        return "flex flex-wrap gap-6";
      case "horizontal":
        return "flex flex-col gap-12";
      default:
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
    }
  };
  
  // Helper function to get bookmark container class for horizontal layout
  const getBookmarksContainerClass = () => {
    return displaySettings.categoryLayout === "horizontal" 
      ? "flex overflow-x-auto pb-4 space-x-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900" 
      : "space-y-4";
  };
  
  // Determine which categories to display
  const categoriesToDisplay = categories
    .filter((category) => !hiddenCategories.includes(category.id))
    .filter((category) => selectedCategory === "all" || category.id === selectedCategory);
  
  const filteredBookmarks = getFilteredBookmarks();
  
  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={getCategoryLayoutClass()}>
          {categoriesToDisplay.map((category) => (
            <Droppable 
              key={category.id} 
              droppableId={category.id} 
              direction={displaySettings.categoryLayout === "horizontal" ? "horizontal" : "vertical"}
            >
              {(provided) => (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Folder className="w-5 h-5" />
                    {category.name}
                  </h2>
                  <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps} 
                    className={getBookmarksContainerClass()} 
                    style={displaySettings.categoryLayout === "horizontal" ? { minHeight: "100px" } : {}}
                  >
                    {filteredBookmarks
                      .filter((bookmark) => bookmark.categoryId === category.id)
                      .map((bookmark, index) => (
                        <Draggable key={bookmark.id} draggableId={bookmark.id} index={index}>
                          {(provided) => (
                            <BookmarkCard 
                              bookmark={bookmark} 
                              index={index} 
                              provided={provided} 
                              onEdit={editBookmark} 
                            />
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      
      {isEditingBookmark && (
        <BookmarkModal
          isOpen={isEditingBookmark}
          onClose={() => {
            setIsEditingBookmark(false);
            setEditingBookmarkId(null);
            setCurrentBookmark({});
          }}
          bookmark={currentBookmark}
          editingBookmarkId={editingBookmarkId}
        />
      )}
    </>
  );
};

export default BookmarkGrid;