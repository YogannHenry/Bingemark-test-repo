document.addEventListener('DOMContentLoaded', function() {
  // Close tab button
  document.getElementById('closeTab').addEventListener('click', function() {
    window.close();
  });

  // File input handling
  document.getElementById('selectJsonFile').addEventListener('click', function() {
    document.getElementById('jsonFileInput').click();
  });

  // Import from Chrome - Add
  document.getElementById('importChrome-add').addEventListener('click', function() {
    importChromeBookmarks('add');
  });

  // Import from Chrome - Replace
  document.getElementById('importChrome-replace').addEventListener('click', function() {
    importChromeBookmarks('replace');
  });

  // Import JSON - Add
  document.getElementById('importJson-add').addEventListener('click', function() {
    importBookmarksFromJson('add');
  });

  // Import JSON - Replace
  document.getElementById('importJson-replace').addEventListener('click', function() {
    importBookmarksFromJson('replace');
  });

  // Export JSON
  document.getElementById('exportJson').addEventListener('click', exportBookmarksAsJson);

  // Handle file selection
  document.getElementById('jsonFileInput').addEventListener('change', function(event) {
    const fileName = event.target.files[0]?.name;
    if (fileName) {
      document.getElementById('jsonImportStatus').textContent = `Selected file: ${fileName}`;
    }
  });
});

const importChromeBookmarks = (mode) => {
  console.log("Importing Chrome bookmarks...");
  updateStatus('chromeImportStatus', 'Importing bookmarks from Chrome...', 'info');

  try {
    chrome.runtime.sendMessage({ action: "getBookmarks" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error getting bookmarks:", chrome.runtime.lastError);
        updateStatus('chromeImportStatus', `Error: ${chrome.runtime.lastError.message}`, 'error');
        return;
      }

      if (response && response.bookmarks && response.bookmarks.length > 0) {
        console.log("Received", response.bookmarks.length, "bookmarks from Chrome");

        // Convert Chrome bookmarks to app format
        const newBookmarks = response.bookmarks.map((item, index) => ({
          id: `imported-${Date.now()}-${index}`,
          title: item.title || "Untitled",
          url: item.url,
          description: "",
          imageUrl: `https://www.google.com/s2/favicons?domain=${new URL(item.url).hostname}&sz=128`,
          tags: [],
          categoryId: "default",
        }));

        chrome.storage.local.get(['bookmarks'], function(result) {
          const existingBookmarks = result.bookmarks || [];
          let updatedBookmarks;
          
          if (mode === 'replace') {
            updatedBookmarks = newBookmarks;
            updateStatus('chromeImportStatus', `Replaced with ${newBookmarks.length} bookmarks from Chrome`, 'success');
          } else {
            // Filter out duplicates
            const existingUrls = new Set(existingBookmarks.map((b) => b.url));
            const uniqueNewBookmarks = newBookmarks.filter((b) => !existingUrls.has(b.url));
            
            console.log("Adding", uniqueNewBookmarks.length, "unique new bookmarks");
            
            if (uniqueNewBookmarks.length > 0) {
              updatedBookmarks = [...existingBookmarks, ...uniqueNewBookmarks];
              updateStatus('chromeImportStatus', `Added ${uniqueNewBookmarks.length} new bookmarks from Chrome`, 'success');
            } else {
              updateStatus('chromeImportStatus', "No new bookmarks to import", 'info');
              return;
            }
          }

          chrome.storage.local.set({ bookmarks: updatedBookmarks }, () => {
            if (chrome.runtime.lastError) {
              console.error("Error saving bookmarks:", chrome.runtime.lastError);
              updateStatus('chromeImportStatus', `Failed to save: ${chrome.runtime.lastError.message}`, 'error');
            }
          });
        });
      } else {
        console.error("No bookmarks received from Chrome or empty response", response);
        updateStatus('chromeImportStatus', "No bookmarks found to import", 'error');
      }
    });
  } catch (error) {
    console.error("Exception during bookmark import:", error);
    updateStatus('chromeImportStatus', `Import failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
  }
};

const importBookmarksFromJson = (mode) => {
  const fileInput = document.getElementById('jsonFileInput');
  const file = fileInput.files?.[0];
  if (!file) {
    updateStatus('jsonImportStatus', 'Please select a file first', 'error');
    return;
  }

  updateStatus('jsonImportStatus', 'Reading file...', 'info');

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const jsonData = JSON.parse(e.target.result);
      let jsonBookmarks;
      
      // Handle both formats: array of bookmarks or {bookmarks, categories} object
      if (Array.isArray(jsonData)) {
        jsonBookmarks = jsonData;
      } else if (jsonData.bookmarks && Array.isArray(jsonData.bookmarks)) {
        jsonBookmarks = jsonData.bookmarks;
        
        // If categories are present, import them as well
        if (jsonData.categories && Array.isArray(jsonData.categories)) {
          chrome.storage.local.set({ categories: jsonData.categories }, () => {
            console.log("Categories imported successfully");
          });
        }
      } else {
        updateStatus('jsonImportStatus', "Invalid bookmark file format", 'error');
        return;
      }

      chrome.storage.local.get(['bookmarks'], function(result) {
        const existingBookmarks = result.bookmarks || [];
        let updatedBookmarks;
        
        if (mode === 'replace') {
          updatedBookmarks = jsonBookmarks;
          updateStatus('jsonImportStatus', `Replaced with ${jsonBookmarks.length} imported bookmarks`, 'success');
        } else {
          // In add mode, merge while avoiding duplicates by URL
          const existingUrls = new Set(existingBookmarks.map((b) => b.url));
          const newBookmarks = jsonBookmarks.filter((b) => !existingUrls.has(b.url));

          if (newBookmarks.length > 0) {
            updatedBookmarks = [...existingBookmarks, ...newBookmarks];
            updateStatus('jsonImportStatus', `Added ${newBookmarks.length} new bookmarks`, 'success');
          } else {
            updateStatus('jsonImportStatus', "No new bookmarks to add", 'info');
            return;
          }
        }

        chrome.storage.local.set({ bookmarks: updatedBookmarks }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error saving bookmarks:", chrome.runtime.lastError);
            updateStatus('jsonImportStatus', `Failed to save: ${chrome.runtime.lastError.message}`, 'error');
          }
        });
      });
    } catch (error) {
      console.error("Error parsing JSON:", error);
      updateStatus('jsonImportStatus', `Failed to import: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }

    // Reset the file input
    fileInput.value = "";
  };

  reader.readAsText(file);
};

function exportBookmarksAsJson() {
  chrome.storage.local.get(['bookmarks', 'categories'], function(result) {
    const exportData = {
      bookmarks: result.bookmarks || [],
      categories: result.categories || []
    };
    
    const bookmarksJson = JSON.stringify(exportData, null, 2);
    const blob = new Blob([bookmarksJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "bookmarks.json";
    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  });
}

function updateStatus(elementId, message, type) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.className = `text-sm ${type === 'error' ? 'text-red-400' : type === 'success' ? 'text-green-400' : 'text-gray-400'}`;
}