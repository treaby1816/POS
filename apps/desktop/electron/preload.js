const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('treabynAPI', {
  // Platform info
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  getDeviceId: () => ipcRenderer.invoke('get-device-id'),
  isElectron: true,

  // License
  validateLicense: (key) => ipcRenderer.invoke('validate-license', key),

  // Database
  dbRun: (sql, params) => ipcRenderer.invoke('db-run', { sql, params }),
  dbGet: (sql, params) => ipcRenderer.invoke('db-get', { sql, params }),
  dbAll: (sql, params) => ipcRenderer.invoke('db-all', { sql, params }),
});
