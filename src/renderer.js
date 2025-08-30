const { ipcRenderer } = require('electron');

// Estado de la aplicación
let profiles = [];
let currentProfile = null;
let currentWebview = null;

// Elementos del DOM
const elements = {
  profileSelect: document.getElementById('profileSelect'),
  createProfileBtn: document.getElementById('createProfileBtn'),
  editProfileBtn: document.getElementById('editProfileBtn'),
  deleteProfileBtn: document.getElementById('deleteProfileBtn'),
  refreshProfilesBtn: document.getElementById('refreshProfilesBtn'),
  debugBtn: document.getElementById('debugBtn'),
  
  welcomeModal: document.getElementById('welcomeModal'),
  createFirstProfileBtn: document.getElementById('createFirstProfileBtn'),
  noProfileSelected: document.getElementById('noProfileSelected'),
  
  profileModal: document.getElementById('profileModal'),
  modalTitle: document.getElementById('modalTitle'),
  profileForm: document.getElementById('profileForm'),
  profileName: document.getElementById('profileName'),
  profileDescription: document.getElementById('profileDescription'),
  profileId: document.getElementById('profileId'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  cancelBtn: document.getElementById('cancelBtn'),
  saveProfileBtn: document.getElementById('saveProfileBtn'),
  
  deleteModal: document.getElementById('deleteModal'),
  deleteProfileName: document.getElementById('deleteProfileName'),
  closeDeleteModalBtn: document.getElementById('closeDeleteModalBtn'),
  cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
  confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
  
  webviews: document.getElementById('webviews')
};// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    await loadProfiles();
    setupEventListeners();
    setupIPCListeners();
    
    // Mostrar modal de bienvenida si no hay perfiles
    if (profiles.length === 0) {
        showWelcomeModal();
    } else {
        showNoProfileSelected();
    }
});

// Configurar event listeners
function setupEventListeners() {
    // Selector de perfiles
    elements.profileSelect.addEventListener('change', handleProfileChange);
    
  // Botones de la toolbar
  elements.createProfileBtn.addEventListener('click', () => openProfileModal());
  elements.editProfileBtn.addEventListener('click', () => openProfileModal(currentProfile));
  elements.deleteProfileBtn.addEventListener('click', handleDeleteProfile);
  elements.refreshProfilesBtn.addEventListener('click', loadProfiles);
  elements.debugBtn.addEventListener('click', showDebugInfo);    // Modal de perfil
    elements.createFirstProfileBtn.addEventListener('click', () => {
        hideWelcomeModal();
        openProfileModal();
    });
    
    elements.closeModalBtn.addEventListener('click', closeProfileModal);
    elements.cancelBtn.addEventListener('click', closeProfileModal);
    elements.profileForm.addEventListener('submit', handleSaveProfile);
    
    // Modal de confirmación de borrado
    elements.closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
    elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    elements.confirmDeleteBtn.addEventListener('click', confirmDeleteProfile);
    
    // Cerrar modales con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProfileModal();
            closeDeleteModal();
        }
    });
    
    // Cerrar modales haciendo clic fuera
    elements.profileModal.addEventListener('click', (e) => {
        if (e.target === elements.profileModal) {
            closeProfileModal();
        }
    });
    
    elements.deleteModal.addEventListener('click', (e) => {
        if (e.target === elements.deleteModal) {
            closeDeleteModal();
        }
    });
}

// Configurar listeners para IPC
function setupIPCListeners() {
    // Eventos del menú
    ipcRenderer.on('create-profile', () => openProfileModal());
    ipcRenderer.on('edit-profile', () => {
        if (currentProfile) {
            openProfileModal(currentProfile);
        }
    });
    ipcRenderer.on('delete-profile', handleDeleteProfile);
    ipcRenderer.on('load-profile', () => {
        // Mostrar modal para seleccionar perfil si hay varios
        if (profiles.length > 0) {
            elements.profileSelect.focus();
        }
    });
    
    // Eventos de vista
    ipcRenderer.on('reload-profile', () => {
        if (currentWebview) {
            currentWebview.reload();
        }
    });
    
    ipcRenderer.on('zoom-in', () => {
        if (currentWebview) {
            const currentZoom = currentWebview.getZoomFactor();
            currentWebview.setZoomFactor(Math.min(currentZoom + 0.1, 3));
        }
    });
    
    ipcRenderer.on('zoom-out', () => {
        if (currentWebview) {
            const currentZoom = currentWebview.getZoomFactor();
            currentWebview.setZoomFactor(Math.max(currentZoom - 0.1, 0.5));
        }
    });
    
    ipcRenderer.on('reset-zoom', () => {
        if (currentWebview) {
            currentWebview.setZoomFactor(1);
        }
    });
    
    ipcRenderer.on('toggle-notifications', (event, enabled) => {
        // Implementar toggle de notificaciones
        console.log('Notificaciones:', enabled ? 'activadas' : 'desactivadas');
    });
}

// Cargar perfiles desde el almacenamiento
async function loadProfiles() {
    try {
        profiles = await ipcRenderer.invoke('get-profiles');
        updateProfileSelector();
        updateToolbarButtons();
    } catch (error) {
        console.error('Error cargando perfiles:', error);
        showNotification('Error al cargar los perfiles', 'error');
    }
}

// Actualizar el selector de perfiles
function updateProfileSelector() {
    // Limpiar opciones existentes (excepto la primera)
    elements.profileSelect.innerHTML = '<option value="">Seleccionar perfil...</option>';
    
    profiles.forEach(profile => {
        const option = document.createElement('option');
        option.value = profile.id;
        option.textContent = profile.name;
        option.style.color = profile.color;
        elements.profileSelect.appendChild(option);
    });
}

// Actualizar estado de los botones de la toolbar
function updateToolbarButtons() {
    const hasProfiles = profiles.length > 0;
    const hasSelection = currentProfile !== null;
    
    elements.editProfileBtn.disabled = !hasSelection;
    elements.deleteProfileBtn.disabled = !hasSelection;
}

// Manejar cambio de perfil
async function handleProfileChange() {
  const selectedId = elements.profileSelect.value;
  
  if (!selectedId) {
    currentProfile = null;
    hideWebview();
    showNoProfileSelected();
    updateToolbarButtons();
    return;
  }
  
  currentProfile = profiles.find(p => p.id === selectedId);
  if (currentProfile) {
    hideNoProfileSelected();
    await loadWhatsAppWebView(currentProfile);
    updateToolbarButtons();
  }
}// Crear y mostrar webview para WhatsApp Web
async function loadWhatsAppWebView(profile) {
  console.log('Cargando webview para perfil:', profile.name);
  
  // Ocultar webview actual si existe
  hideWebview();
  
  // Crear nuevo webview de forma simple
  const webview = document.createElement('webview');
  webview.src = 'https://web.whatsapp.com';
  webview.partition = `persist:profile-${profile.id}`;
  webview.useragent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  webview.style.width = '100%';
  webview.style.height = '100%';
  
  // Event listeners básicos
  webview.addEventListener('dom-ready', () => {
    console.log('WebView listo para:', profile.name);
  });
  
  // Agregar al DOM
  elements.webviews.appendChild(webview);
  currentWebview = webview;
}// Ocultar webview actual
function hideWebview() {
  if (currentWebview) {
    currentWebview.remove();
    currentWebview = null;
  }
}

// Mostrar/ocultar elementos de la interfaz
function showWelcomeModal() {
    elements.welcomeModal.style.display = 'flex';
    elements.noProfileSelected.style.display = 'none';
}

function hideWelcomeModal() {
    elements.welcomeModal.style.display = 'none';
}

function showNoProfileSelected() {
    elements.noProfileSelected.style.display = 'flex';
    elements.welcomeModal.style.display = 'none';
}

function hideNoProfileSelected() {
    elements.noProfileSelected.style.display = 'none';
}

function showLoadingIndicator() {
  elements.webviews.classList.add('loading');
  
  // Crear overlay de carga si no existe
  let loadingOverlay = document.getElementById('loadingOverlay');
  if (!loadingOverlay) {
    loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.innerHTML = `
      <div class="loading-content">
        <img src="../assets/whatsapp_icon.png" alt="WhatsApp" class="loading-icon">
        <h3>Cargando WhatsApp Web...</h3>
        <p>Por favor espera mientras se conecta</p>
        <div class="loading-spinner"></div>
      </div>
    `;
    loadingOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;
    elements.webviews.appendChild(loadingOverlay);
  }
  
  loadingOverlay.style.display = 'flex';
}

function hideLoadingIndicator() {
  elements.webviews.classList.remove('loading');
  
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }
}// Gestión de modales
function openProfileModal(profile = null) {
    const isEditing = profile !== null;
    
    elements.modalTitle.textContent = isEditing ? 'Editar Perfil' : 'Crear Nuevo Perfil';
    elements.saveProfileBtn.textContent = isEditing ? 'Guardar Cambios' : 'Crear Perfil';
    
    if (isEditing) {
        elements.profileName.value = profile.name;
        elements.profileDescription.value = profile.description || '';
        elements.profileId.value = profile.id;
        
        // Seleccionar color
        const colorInput = document.querySelector(`input[name="color"][value="${profile.color}"]`);
        if (colorInput) {
            colorInput.checked = true;
        }
    } else {
        elements.profileForm.reset();
        elements.profileId.value = '';
        
        // Verificar límite de perfiles
        if (profiles.length >= 3) {
            showNotification('Máximo 3 perfiles permitidos. Elimina uno para crear otro.', 'warning');
            return;
        }
    }
    
    elements.profileModal.style.display = 'flex';
    elements.profileName.focus();
}

function closeProfileModal() {
    elements.profileModal.style.display = 'none';
    elements.profileForm.reset();
}

function closeDeleteModal() {
    elements.deleteModal.style.display = 'none';
}

// Manejar guardado de perfil
async function handleSaveProfile(e) {
    e.preventDefault();
    
    const formData = new FormData(elements.profileForm);
    const profile = {
        id: formData.get('id') || null,
        name: formData.get('name').trim(),
        description: formData.get('description').trim(),
        color: formData.get('color'),
        createdAt: new Date().toISOString()
    };
    
    // Validaciones
    if (!profile.name) {
        showNotification('El nombre del perfil es obligatorio', 'error');
        return;
    }
    
    if (profile.name.length > 50) {
        showNotification('El nombre del perfil no puede tener más de 50 caracteres', 'error');
        return;
    }
    
    // Verificar nombres duplicados
    const existingProfile = profiles.find(p => 
        p.name.toLowerCase() === profile.name.toLowerCase() && p.id !== profile.id
    );
    
    if (existingProfile) {
        showNotification('Ya existe un perfil con ese nombre', 'error');
        return;
    }
    
    try {
        profiles = await ipcRenderer.invoke('save-profile', profile);
        closeProfileModal();
        await loadProfiles();
        
        const action = profile.id ? 'actualizado' : 'creado';
        showNotification(`Perfil ${action} correctamente`, 'success');
        
        // Si es un perfil nuevo, seleccionarlo automáticamente
        if (!profile.id) {
            const newProfile = profiles.find(p => p.name === profile.name);
            if (newProfile) {
                elements.profileSelect.value = newProfile.id;
                await handleProfileChange();
            }
        }
    } catch (error) {
        console.error('Error guardando perfil:', error);
        showNotification(error.message || 'Error al guardar el perfil', 'error');
    }
}

// Manejar eliminación de perfil
function handleDeleteProfile() {
    if (!currentProfile) {
        showNotification('Selecciona un perfil para eliminar', 'warning');
        return;
    }
    
    elements.deleteProfileName.textContent = currentProfile.name;
    elements.deleteModal.style.display = 'flex';
}

async function confirmDeleteProfile() {
    if (!currentProfile) return;
    
    try {
        profiles = await ipcRenderer.invoke('delete-profile', currentProfile.id);
        closeDeleteModal();
        
        // Limpiar estado actual
        currentProfile = null;
        hideWebview();
        
        await loadProfiles();
        
        if (profiles.length === 0) {
            showWelcomeModal();
        } else {
            showNoProfileSelected();
        }
        
        showNotification('Perfil eliminado correctamente', 'success');
    } catch (error) {
        console.error('Error eliminando perfil:', error);
        showNotification('Error al eliminar el perfil', 'error');
    }
}

// Sistema de notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos de la notificación
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '4px',
        color: 'white',
        fontWeight: '500',
        zIndex: '20000',
        maxWidth: '400px',
        wordWrap: 'break-word',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    // Colores según el tipo
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Función de debug
function showDebugInfo() {
  const debugInfo = {
    perfiles: profiles,
    perfilActual: currentProfile,
    webviewActual: currentWebview ? 'Presente' : 'Ausente',
    webviewsEnDOM: document.querySelectorAll('webview').length,
    webviewTag: typeof document.createElement('webview').src !== 'undefined',
    electron: typeof require !== 'undefined'
  };
  
  console.log('=== DEBUG INFO ===');
  console.log(debugInfo);
  
  // Mostrar en modal
  const debugMessage = `
DEBUG INFO:
• Perfiles: ${profiles.length}
• Perfil actual: ${currentProfile ? currentProfile.name : 'Ninguno'}
• WebView actual: ${currentWebview ? 'Presente' : 'Ausente'}
• WebViews en DOM: ${document.querySelectorAll('webview').length}
• WebView tag support: ${typeof document.createElement('webview').src !== 'undefined'}
• Electron available: ${typeof require !== 'undefined'}

${currentProfile ? `
Perfil actual:
• ID: ${currentProfile.id}
• Nombre: ${currentProfile.name}
• Color: ${currentProfile.color}
` : ''}

Console output en DevTools para más detalles.
  `;
  
  alert(debugMessage);
  
  // Si hay un perfil seleccionado pero no webview, intentar forzar carga
  if (currentProfile && !currentWebview) {
    console.log('Intentando forzar carga del webview...');
    loadWhatsAppWebView(currentProfile);
  }
}

// Función de test para crear webview básico
function testWebview() {
  const testDiv = document.createElement('div');
  testDiv.innerHTML = '<webview src="https://www.google.com" style="width: 100%; height: 400px;"></webview>';
  elements.webviews.appendChild(testDiv);
  console.log('Test webview creado');
}

// Funciones de utilidad
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Exportar funciones para uso global si es necesario
window.WhatsAppApp = {
    loadProfiles,
    openProfileModal,
    showNotification
};
