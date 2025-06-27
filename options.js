// options.js

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(["userPromptEnabled", "autoSaveEnabled"], (result) => {
    document.getElementById("userPromptEnabled").checked = result.userPromptEnabled ?? true;
    document.getElementById("autoSaveEnabled").checked = result.autoSaveEnabled ?? true;
  });

  document.getElementById("userPromptEnabled").addEventListener("change", (e) => {
    chrome.storage.local.set({ userPromptEnabled: e.target.checked });
  });

  document.getElementById("autoSaveEnabled").addEventListener("change", (e) => {
    chrome.storage.local.set({ autoSaveEnabled: e.target.checked });
  });
});
