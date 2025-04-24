// Simple background script for Chrome extension
console.log("Background script initialized");

// Function to recursively extract bookmarks
function extractBookmarks(bookmarkNodes, allBookmarks = []) {
  for (const node of bookmarkNodes) {
    if (node.url) {
      allBookmarks.push({ title: node.title, url: node.url });
    }
    if (node.children) {
      extractBookmarks(node.children, allBookmarks);
    }
  }
  return allBookmarks;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("Background received message:", request);
  
  if (request.action === "getBookmarks") {
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
      const bookmarks = extractBookmarks(bookmarkTreeNodes);
      sendResponse({ success: true, bookmarks: bookmarks });
    });
    return true; // Keep the message channel open for async response
  }
  
  if (request.action === "ping") {
    console.log("Received ping");
    sendResponse({ success: true, message: "Background script is active" });
    return true;
  }
  return true;
});

// Add listener for opening import/export tab
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "openImportExportTab") {
    chrome.tabs.create({ url: "import-export.html" }, (tab) => {
      sendResponse({ success: true, tabId: tab.id });
    });
    return true;
  }
  
  if (message.type === "importBookmarksFromJson") {
    const file = message.file;
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        sendResponse({ success: true, data: importData });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    };

    reader.readAsText(file);
    return true;
  }
});