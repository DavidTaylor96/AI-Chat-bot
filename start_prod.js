const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'public', 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#FFFFFF'
  });

  // Get the correct path to index.html
  const indexPath = path.join(__dirname, 'build', 'index.html');
  
  // Check if the file exists
  if (!fs.existsSync(indexPath)) {
    console.error(`Error: Could not find index.html at ${indexPath}`);
    app.quit();
    return;
  }
  
  // Load the app
  const startUrl = `file://${indexPath}`;
  console.log(`Loading app from: ${startUrl}`);
  
  mainWindow.loadURL(startUrl);

  // Open links in external browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Open DevTools in development
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});