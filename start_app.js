const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// No need for electron-squirrel-startup check in this simple version

const createWindow = () => {
  // Create the browser window.
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

  // Check if running in development or production
  const isDev = process.env.NODE_ENV === 'development';
  
  // Determine the correct path to the HTML file
  let indexPath;
  
  if (isDev) {
    indexPath = 'http://localhost:3000';
    console.log('Running in development mode');
  } else {
    // Try to load from build directory first
    indexPath = path.join(__dirname, 'build', 'index.html');
    console.log(`Trying to load from path: ${indexPath}`);
    
    // Check if the file exists
    if (!fs.existsSync(indexPath)) {
      console.log(`Build index.html not found, trying fallback index.html`);
      
      // Try fallback to the root index.html
      indexPath = path.join(__dirname, 'index.html');
      
      if (!fs.existsSync(indexPath)) {
        console.error(`ERROR: Could not find any index.html`);
        app.quit();
        return;
      }
    }
  }

  // Load the index.html of the app.
  mainWindow.loadURL(isDev ? indexPath : `file://${indexPath}`);

  // Open the DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// This method will be called when Electron has finished initialization
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});