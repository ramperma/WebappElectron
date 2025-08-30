const { app, BrowserWindow, Menu, Tray, ipcMain, dialog } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Configuración de almacenamiento local
const store = new Store();

let mainWindow;
let tray;

// Configuración de la aplicación
const APP_CONFIG = {
  MIN_WIDTH: 1200,
  MIN_HEIGHT: 800,
  ICON_PATH: path.join(__dirname, '../assets/whatsapp_icon.png')
};

function createMainWindow() {
  // Crear la ventana principal
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: APP_CONFIG.MIN_WIDTH,
    minHeight: APP_CONFIG.MIN_HEIGHT,
    icon: APP_CONFIG.ICON_PATH,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true
    },
    show: false
  });

  // Cargar la interfaz principal
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Mostrar la ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Manejar el cierre de la ventana
  mainWindow.on('close', (event) => {
    const minimizeOnClose = store.get('minimizeOnClose', false);
    
    if (minimizeOnClose) {
      event.preventDefault();
      mainWindow.hide();
    } else {
      app.quit();
    }
  });

  // Crear el menú de la aplicación
  createApplicationMenu();
  
  // Crear el system tray
  createSystemTray();
}

function createApplicationMenu() {
  const template = [
    {
      label: 'Perfiles',
      submenu: [
        {
          label: 'Crear Nuevo',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('create-profile');
          }
        },
        {
          label: 'Editar',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('edit-profile');
          }
        },
        {
          label: 'Borrar',
          accelerator: 'CmdOrCtrl+D',
          click: () => {
            mainWindow.webContents.send('delete-profile');
          }
        },
        { type: 'separator' },
        {
          label: 'Cargar',
          accelerator: 'CmdOrCtrl+L',
          click: () => {
            mainWindow.webContents.send('load-profile');
          }
        }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        {
          label: 'Recargar Perfil',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('reload-profile');
          }
        },
        { type: 'separator' },
        {
          label: 'Zoom +',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            mainWindow.webContents.send('zoom-in');
          }
        },
        {
          label: 'Zoom -',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            mainWindow.webContents.send('zoom-out');
          }
        },
        {
          label: 'Restablecer Zoom',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainWindow.webContents.send('reset-zoom');
          }
        }
      ]
    },
    {
      label: 'Configuración',
      submenu: [
        {
          label: 'Minimizar al cerrar',
          type: 'checkbox',
          checked: store.get('minimizeOnClose', false),
          click: (item) => {
            store.set('minimizeOnClose', item.checked);
          }
        }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Atajos de Teclado',
          click: () => {
            showKeyboardShortcuts();
          }
        },
        {
          label: 'Notificaciones',
          type: 'checkbox',
          checked: store.get('notificationsEnabled', true),
          click: (item) => {
            store.set('notificationsEnabled', item.checked);
            mainWindow.webContents.send('toggle-notifications', item.checked);
          }
        },
        { type: 'separator' },
        {
          label: 'Acerca de',
          click: () => {
            showAboutDialog();
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createSystemTray() {
  tray = new Tray(APP_CONFIG.ICON_PATH);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Mostrar',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Ocultar',
      click: () => {
        mainWindow.hide();
      }
    },
    { type: 'separator' },
    {
      label: 'Salir',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('WhatsApp Desktop Multi-Profile');
  
  // Doble clic para mostrar/ocultar
  tray.on('double-click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });
}

function showKeyboardShortcuts() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Atajos de Teclado',
    message: 'Atajos disponibles:',
    detail: `
Perfiles:
• Ctrl+N - Crear nuevo perfil
• Ctrl+E - Editar perfil
• Ctrl+D - Borrar perfil
• Ctrl+L - Cargar perfil

Ver:
• Ctrl+R - Recargar perfil
• Ctrl++ - Aumentar zoom
• Ctrl+- - Disminuir zoom
• Ctrl+0 - Restablecer zoom

General:
• Ctrl+Q - Salir de la aplicación
    `
  });
}

function showAboutDialog() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Acerca de',
    message: 'WhatsApp Desktop Multi-Profile',
    detail: `
Versión: 1.0.0
Una aplicación de escritorio para usar múltiples cuentas de WhatsApp Web.

Características:
• Hasta 3 perfiles diferentes
• Gestión completa de perfiles
• System tray integrado
• Zoom personalizable
• Notificaciones configurables

Desarrollado con Electron para Linux.
    `
  });
}

// IPC handlers para comunicación con el renderer
ipcMain.handle('get-profiles', () => {
  return store.get('profiles', []);
});

ipcMain.handle('save-profile', (event, profile) => {
  const profiles = store.get('profiles', []);
  
  if (profiles.length >= 3 && !profile.id) {
    throw new Error('Máximo 3 perfiles permitidos');
  }
  
  if (profile.id) {
    // Editar perfil existente
    const index = profiles.findIndex(p => p.id === profile.id);
    if (index !== -1) {
      profiles[index] = profile;
    }
  } else {
    // Crear nuevo perfil
    profile.id = Date.now().toString();
    profiles.push(profile);
  }
  
  store.set('profiles', profiles);
  return profiles;
});

ipcMain.handle('delete-profile', (event, profileId) => {
  const profiles = store.get('profiles', []);
  const updatedProfiles = profiles.filter(p => p.id !== profileId);
  store.set('profiles', updatedProfiles);
  return updatedProfiles;
});

ipcMain.handle('get-setting', (event, key, defaultValue) => {
  return store.get(key, defaultValue);
});

ipcMain.handle('set-setting', (event, key, value) => {
  store.set(key, value);
});

// Eventos de la aplicación
app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Prevenir múltiples instancias
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
