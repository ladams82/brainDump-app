//connects render process => main process
const { contextBridge, ipcRenderer } = require("electron");

//exposes certain functions to renderer and makes them globally available via electronAPI
//ipcRenderer.invoke() sends request to main.js and waits for response
contextBridge.exposeInMainWorld("electronAPI", {
  //each property creates a js funct thats used in the page + passes args from page to main process
  saveDumpToFile: (data) => ipcRenderer.invoke("save-dump-to-file", data),

  openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),

  getFileContent: (binName, dumpName) =>
    ipcRenderer.invoke("get-file-contents", binName, dumpName),

  updateWordCount: (text) => {
    const count = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    return count;
  },

  getBins: () => {
    return ipcRenderer.invoke("get-user-data-path");
  },

  getDumps: (binName) => {
    return ipcRenderer.invoke("return-dump-path", binName);
  },
  renameFile: (oldFileName, currentFolder, newFileName) => {
    return ipcRenderer.invoke(
      "rename-file",
      oldFileName,
      currentFolder,
      newFileName
    );
  },
});
