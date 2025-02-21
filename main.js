const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { pdfToPng } = require('pdf-to-png-converter');
const { convert, sizes } = require('image-to-pdf');
const JSZip = require('jszip');

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

app.whenReady().then(() => {
    createWindow();

    ipcMain.handle('scanPdf', async (event, buffer, password = "") => {
      try {
        const pdfBuffer = Buffer.from(buffer);
        const pngs = await pdfToPng(pdfBuffer, {
          pdfFilePassword: password,
          viewportScale: 2.0,
        });
        let bufferArr = pngs.map(v => Buffer.from(v.content));
        let pdfBuffers = [];
        return new Promise((resolve, reject) => {
            let stream = convert(bufferArr, sizes.A4);
            stream.on("data", (chunk) => {
                pdfBuffers.push(chunk);
            });
            stream.on("end", () => {
                const pdfBuffer = Buffer.concat(pdfBuffers);
                let result = pdfBuffer.toString('base64');
                resolve({ cd: '0000', msg: '성공', base64: result });
            });
            stream.on("error", (err) => {
                console.error("Error:", err);
                reject({ cd: '9999', msg: '시스템 에러', base64: null });
            });
        });
      } catch(err) {
        if(err.name == 'PasswordException') {
          return { cd: '1000', msg : '비밀번호 잠김', base64: null };
        } else {
          return { cd: '9999', msg : '시스템 에러', base64: null };
        }
      }
    });
    
    ipcMain.handle('pdfToImg', async (event, buffer, password = "") => {
      try {
        const pdfBuffer = Buffer.from(buffer);
        const pngs = await pdfToPng(pdfBuffer, {
          pdfFilePassword: password,
          viewportScale: 2.0,
        });
        let result = pngs.map(v => v.content.toString('base64'));
        return {cd: '0000', msg: '성공', base64 : result};
      } catch(err) {
        if(err.name == 'PasswordException') {
          return { cd: '1000', msg : '비밀번호 잠김', base64: null };
        } else {
          return { cd: '9999', msg : '시스템 에러', base64: null };
        }
      }
    });

    ipcMain.handle('imgToPdf', async (event, buffers) => {
      try {
          let bufferArr = buffers.map(v => Buffer.from(v));
          let pdfBuffers = [];
          return new Promise((resolve, reject) => {
              let stream = convert(bufferArr, sizes.A4);
              stream.on("data", (chunk) => {
                  pdfBuffers.push(chunk);
              });
              stream.on("end", () => {
                  const pdfBuffer = Buffer.concat(pdfBuffers);
                  let result = pdfBuffer.toString('base64');
                  resolve({ cd: '0000', msg: '성공', base64: result });
              });
              stream.on("error", (err) => {
                  console.error("Error:", err);
                  reject({ cd: '9999', msg: '시스템 에러', base64: null });
              });
          });
      } catch (err) {
          return { cd: '9999', msg: '시스템 에러', base64: null };
      }
  });

  ipcMain.on('download', async (event, fileInfo) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: fileInfo.ext.toUpperCase() + '파일 저장',
      defaultPath: path.join(app.getPath('downloads'), fileInfo.fileName + "." + fileInfo.ext),
      filters: [{ name: fileInfo.ext.charAt(0).toUpperCase() + fileInfo.ext.slice(1) + ' Files', extensions: [fileInfo.ext] }]
    });
    if (!result.canceled) {
      try {
        const downloadPath = result.filePath;
        if(fileInfo.ext == 'zip') {
          const zip = new JSZip();
          for(let i=0; i<fileInfo.base64.length; i++) {
            const base64 = fileInfo.base64[i];
            const buffer = Buffer.from(base64, 'base64');
            zip.file(`${fileInfo.fileName}_${i + 1}.png`, buffer);
          }
          const zipContent = await zip.generateAsync({type: 'nodebuffer'});
          fs.writeFileSync(downloadPath, zipContent);
        } else {
          const base64 = fileInfo.base64[0];
          const buffer = Buffer.from(base64, 'base64');
          fs.writeFileSync(downloadPath, buffer);
        }
        event.sender.send('download-complete', { cd: '0000', filePath: downloadPath });
      } catch(err) {
        event.sender.send('download-complete', { cd: '9999' });
      }

    } else {
      event.sender.send('download-complete', { cd: '1000' });
    }
  });

  ipcMain.on('open-file', (event, filePath) => {
    shell.openPath(filePath);
  });

  ipcMain.on('open-folder', (event, filePath) => {
    shell.showItemInFolder(filePath);
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
