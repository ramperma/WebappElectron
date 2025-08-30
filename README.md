# WhatsApp Desktop Multi-Profile

Una aplicación de escritorio para Linux que permite usar múltiples cuentas de WhatsApp Web simultáneamente.

## Características

- ✅ **Múltiples perfiles**: Hasta 3 perfiles diferentes de WhatsApp
- ✅ **Interfaz intuitiva**: Selector de perfiles y gestión completa
- ✅ **System Tray**: Minimizar a la bandeja del sistema
- ✅ **Zoom personalizable**: Controles de zoom para cada perfil
- ✅ **Atajos de teclado**: Navegación rápida
- ✅ **Almacenamiento local**: Los datos se guardan localmente
- ✅ **Notificaciones**: Control de notificaciones
- ✅ **Aislamiento de sesiones**: Cada perfil mantiene su sesión independiente

## Instalación

### Requisitos
- Node.js 16 o superior
- npm o yarn

### Pasos
1. Clona o descarga este repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Ejecuta la aplicación:
   ```bash
   npm start
   ```

### Compilar para distribución
```bash
npm run build
```

## Uso

### Primer uso
1. Al abrir la aplicación por primera vez, verás un modal de bienvenida
2. Haz clic en "Crear Mi Primer Perfil"
3. Ingresa un nombre para tu perfil (ej: Personal, Trabajo, etc.)
4. Selecciona un color identificativo
5. Guarda el perfil

### Gestión de perfiles
- **Crear**: Botón "Crear Perfil" o Ctrl+N
- **Editar**: Selecciona un perfil y usa el botón "Editar" o Ctrl+E
- **Borrar**: Selecciona un perfil y usa el botón "Borrar" o Ctrl+D
- **Cargar**: Usa el selector de perfiles en la barra superior

### Menús disponibles

#### Perfiles
- Crear Nuevo (Ctrl+N)
- Editar (Ctrl+E)
- Borrar (Ctrl+D)
- Cargar (Ctrl+L)

#### Ver
- Recargar Perfil (Ctrl+R)
- Zoom + (Ctrl++)
- Zoom - (Ctrl+-)
- Restablecer Zoom (Ctrl+0)

#### Configuración
- Minimizar al cerrar (checkbox)

#### Ayuda
- Atajos de Teclado
- Activar/Desactivar Notificaciones
- Acerca de

### System Tray
- Doble clic: Mostrar/Ocultar ventana
- Clic derecho: Menú contextual

## Estructura del proyecto

```
WebappElectron/
├── src/
│   ├── main.js          # Proceso principal de Electron
│   ├── index.html       # Interfaz principal
│   ├── styles.css       # Estilos de la aplicación
│   └── renderer.js      # Lógica del renderer
├── assets/
│   └── whatsapp_icon.png # Icono de la aplicación
├── package.json         # Configuración del proyecto
└── README.md           # Este archivo
```

## Tecnologías utilizadas

- **Electron**: Framework para aplicaciones de escritorio
- **electron-store**: Almacenamiento local persistente
- **HTML/CSS/JavaScript**: Interfaz de usuario
- **WhatsApp Web**: Integración mediante webviews

## Características técnicas

### Aislamiento de sesiones
Cada perfil utiliza una partición diferente (`persist:profile-{id}`) que permite mantener sesiones independientes de WhatsApp Web.

### Almacenamiento
Los datos se almacenan localmente usando `electron-store`:
- Perfiles con nombres, descripciones y colores
- Configuraciones de la aplicación
- Preferencias del usuario

### Seguridad
- Las sesiones están aisladas entre perfiles
- No se almacenan credenciales de WhatsApp
- Comunicación segura con WhatsApp Web

## Solución de problemas

### La aplicación no abre
- Verifica que Node.js esté instalado
- Ejecuta `npm install` para asegurar las dependencias
- Comprueba los permisos de ejecución

### WhatsApp Web no carga
- Verifica tu conexión a internet
- Recarga el perfil (Ctrl+R)
- Revisa si WhatsApp Web funciona en tu navegador

### Problemas de zoom
- Usa Ctrl+0 para restablecer el zoom
- Los niveles de zoom van de 0.5x a 3x

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Changelog

### v1.0.0
- Implementación inicial
- Soporte para hasta 3 perfiles
- Interfaz completa con menús
- System tray funcional
- Almacenamiento local
- Controles de zoom
- Atajos de teclado
