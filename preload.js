const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  minimize: () => ipcRenderer.send('minimize'),
  close: () => ipcRenderer.send('close'),
  pdfToImg: (buffer, password) => ipcRenderer.invoke('pdfToImg', buffer, password),
  imgToPdf: (buffer) => ipcRenderer.invoke('imgToPdf', buffer)
});