// Context bridge: exposes a tiny, safe save/quit API to the renderer.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('gameAPI', {
  isElectron: true,
  saveGame: (slot, data) => ipcRenderer.invoke('save:write', slot, data),
  loadGame: (slot) => ipcRenderer.invoke('save:read', slot),
  listSaves: () => ipcRenderer.invoke('save:list'),
  quit: () => ipcRenderer.invoke('app:quit'),
  toggleFullscreen: () => ipcRenderer.invoke('app:fullscreen')
});
