// Preload script para mejorar la seguridad y funcionalidad
const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Gestión de perfiles
  getProfiles: () => ipcRenderer.invoke('get-profiles'),
  saveProfile: (profile) => ipcRenderer.invoke('save-profile', profile),
  deleteProfile: (profileId) => ipcRenderer.invoke('delete-profile', profileId),
  
  // Configuración
  getSetting: (key, defaultValue) => ipcRenderer.invoke('get-setting', key, defaultValue),
  setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
  
  // Listeners para eventos del menú
  onMenuAction: (callback) => {
    ipcRenderer.on('create-profile', callback);
    ipcRenderer.on('edit-profile', callback);
    ipcRenderer.on('delete-profile', callback);
    ipcRenderer.on('load-profile', callback);
    ipcRenderer.on('reload-profile', callback);
    ipcRenderer.on('zoom-in', callback);
    ipcRenderer.on('zoom-out', callback);
    ipcRenderer.on('reset-zoom', callback);
    ipcRenderer.on('toggle-notifications', callback);
  }
});

// Log para confirmar que el preload se cargó
console.log('Preload script cargado correctamente');
