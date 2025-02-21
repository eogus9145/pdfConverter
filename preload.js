const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  minimize: () => ipcRenderer.send('minimize'),
  close: () => ipcRenderer.send('close'),
  scanPdf: (buffer, password) => ipcRenderer.invoke('scanPdf', buffer, password),
  pdfToImg: (buffer, password) => ipcRenderer.invoke('pdfToImg', buffer, password),
  imgToPdf: (buffers) => ipcRenderer.invoke('imgToPdf', buffers),
  download: (fileInfo) => ipcRenderer.send('download', fileInfo),
  onDownloadComplete: (callback) => ipcRenderer.on('download-complete', (event, data) => callback(data)),
  openFile: (filePath) => ipcRenderer.send('open-file', filePath),
  openFolder: (filePath) => ipcRenderer.send('open-folder', filePath),
});