const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { pdfToPng } = require('pdf-to-png-converter');
const sharp = require('sharp');
const electronReload = require('electron-reload');
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  mainWindow.loadFile('index.html');

  ipcMain.on('minimize', () => {
    mainWindow.minimize();
  });

  ipcMain.on('close', () => {
    mainWindow.close();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

electronReload(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
});

app.whenReady().then(() => {
    createWindow();
    
    ipcMain.handle('pdfToImg', async (event, buffer, password = "") => {
      try {
        const pdfBuffer = Buffer.from(buffer);
        const pngs = await pdfToPng(pdfBuffer, {
          pdfFilePassword: password,
          //pagesToProcess: [1],
        });
        let buffers = png.map(v => v.content);
        let result = [];
        for(let i=0; i<buffers.length; i++) {
          let base64 = (await sharp(pngBuffer).toBuffer()).toString('base64');
          result.push(base64);
        }
        return {cd: '0000', msg: '성공', base64 : result};
      } catch(err) {
        if(err.name == 'PasswordException') {
          return { cd: '1000', msg : '비밀번호 잠김', base64: null };
        } else {
          return { cd: '9999', msg : '시스템 에러', base64: null };
        }
      }
    });

    ipcMain.handle('imgToPdf', async (event, buffer) => {
        return "imgToPdf";
    });

});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
