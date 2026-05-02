const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { initDatabase, getDb } = require('./database');
const { validateLicense, getDeviceFingerprint } = require('./license');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360, height: 860, minWidth: 1024, minHeight: 640,
    title: 'Treabyn Retail POS',
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: { nodeIntegration: false, contextIsolation: true, preload: path.join(__dirname, 'preload.js') },
    backgroundColor: '#ffffff', show: false, frame: true,
  });
  const startUrl = isDev ? 'http://localhost:5173' : `file://${path.join(__dirname, '../dist/index.html')}`;
  mainWindow.loadURL(startUrl);
  mainWindow.once('ready-to-show', () => { mainWindow.show(); if (isDev) mainWindow.webContents.openDevTools(); });
  mainWindow.on('closed', () => { mainWindow = null; });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  buildMenu();
}

function buildMenu() {
  const template = [
    { label: 'Treabyn POS', submenu: [
      { label: 'About Treabyn', role: 'about' }, { type: 'separator' },
      { label: 'Check for Updates…', click: () => shell.openExternal('https://treabyn.com/updates') },
      { type: 'separator' }, { role: 'quit', label: 'Quit Treabyn' },
    ]},
    { label: 'View', submenu: [
      { role: 'reload' }, { role: 'forceReload' }, { type: 'separator' },
      { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
      { type: 'separator' }, { role: 'togglefullscreen' },
    ]},
    { label: 'Window', submenu: [{ role: 'minimize' }, { role: 'zoom' }, { role: 'close' }] },
    { label: 'Help', submenu: [
      { label: 'Support', click: () => shell.openExternal('https://treabyn.com/support') },
      { label: 'Docs', click: () => shell.openExternal('https://treabyn.com/docs') },
    ]},
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// IPC Handlers
ipcMain.handle('get-platform', () => process.platform);
ipcMain.handle('get-version', () => app.getVersion());
ipcMain.handle('get-device-id', () => getDeviceFingerprint());

ipcMain.handle('validate-license', async (_, key) => {
  const db = getDb();
  return validateLicense(key, db);
});

ipcMain.handle('db-run', async (_, { sql, params }) => {
  const db = getDb();
  db.run(sql, params);
  return { ok: true };
});

ipcMain.handle('db-get', async (_, { sql, params }) => {
  const db = getDb();
  const stmt = db.prepare(sql);
  if (params) stmt.bind(params);
  const result = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return result;
});

ipcMain.handle('db-all', async (_, { sql, params }) => {
  const db = getDb();
  const results = [];
  const stmt = db.prepare(sql);
  if (params) stmt.bind(params);
  while (stmt.step()) results.push(stmt.getAsObject());
  stmt.free();
  return results;
});

// App lifecycle
app.whenReady().then(async () => {
  await initDatabase();
  createWindow();
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
