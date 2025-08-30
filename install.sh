#!/bin/bash

# Script de instalación para WhatsApp Desktop Multi-Profile
# Uso: ./install.sh

set -e

echo "=== WhatsApp Desktop Multi-Profile - Instalador ==="
echo

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado."
    echo "Por favor instala Node.js desde: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js versión 16 o superior requerida."
    echo "Versión actual: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) detectado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está disponible."
    exit 1
fi

echo "✅ npm $(npm --version) detectado"

# Instalar dependencias
echo
echo "📦 Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error instalando dependencias"
    exit 1
fi

# Crear directorio de escritorio si no existe
DESKTOP_DIR="$HOME/Desktop"
if [ ! -d "$DESKTOP_DIR" ]; then
    DESKTOP_DIR="$HOME/Escritorio"
fi

# Crear acceso directo en el escritorio
if [ -d "$DESKTOP_DIR" ]; then
    SHORTCUT_FILE="$DESKTOP_DIR/WhatsApp-Multi-Profile.desktop"
    CURRENT_DIR=$(pwd)
    
    cat > "$SHORTCUT_FILE" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=WhatsApp Multi-Profile
Comment=Aplicación de WhatsApp con múltiples perfiles
Exec=$CURRENT_DIR/start.sh
Icon=$CURRENT_DIR/assets/whatsapp_icon.png
Terminal=false
StartupWMClass=whatsapp-desktop-multiprofile
Categories=Network;InstantMessaging;
EOF
    
    chmod +x "$SHORTCUT_FILE"
    echo "✅ Acceso directo creado en el escritorio"
fi

# Crear script de inicio
cat > "start.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
npm start
EOF

chmod +x start.sh
echo "✅ Script de inicio creado (start.sh)"

echo
echo "🎉 ¡Instalación completada!"
echo
echo "Para ejecutar la aplicación:"
echo "  • Haz doble clic en el acceso directo del escritorio"
echo "  • O ejecuta: ./start.sh"
echo "  • O ejecuta: npm start"
echo
echo "Para crear un paquete distribuible:"
echo "  npm run build"
echo
