// background.js
// If you have logic here, ensure it's compatible with module format.

// export default {}; // Placeholder if you have no logic; remove if you have actual code.
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  });
});
