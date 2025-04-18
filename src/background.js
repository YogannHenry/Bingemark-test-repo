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
      console.log("Extracted bookmarks:", bookmarks.length);
      sendResponse({ success: true, bookmarks: bookmarks });
    });
    return true; // Keep the message channel open for async response
  }
  
  if (request.action === "ping") {
    console.log("Received ping");
    sendResponse({ success: true, message: "Background script is active" });
    return true;
  }
});