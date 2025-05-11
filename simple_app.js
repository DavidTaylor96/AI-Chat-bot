const { app, BrowserWindow } = require('electron');
const path = require('path');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load a simple HTML file directly
  mainWindow.loadFile('index.html');

  // Open DevTools (optional, for debugging)
  // mainWindow.webContents.openDevTools();

  // Window closed event
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', function() {
  // On macOS applications stay open until the user quits explicitly
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function() {
  // On macOS re-create a window when dock icon is clicked and no windows are open
  if (mainWindow === null) createWindow();
});