// Obtener elementos del DOM
const openAppBtn = document.getElementById('openAppBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Obtener token de la URL
const pathParts = window.location.pathname.split('/');
const token = pathParts[pathParts.length - 1];

// Debug: mostrar información del token
console.log('URL completa:', window.location.href);
console.log('Path parts:', pathParts);
console.log('Token extraído:', token);

// Función para detectar si es móvil
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Función para detectar si es iOS
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// Función para detectar si es Android
function isAndroid() {
    return /Android/.test(navigator.userAgent);
}

// Función para abrir la app
function openApp() {
    const isMobileDevice = isMobile();
    
    if (isMobileDevice) {
        // Intentar abrir la app con deep link
        const deepLink = `alphabets://confirm-email/${token}`;
        
        // Crear un iframe oculto para intentar abrir la app
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = deepLink;
        document.body.appendChild(iframe);
        
        // Después de un tiempo, si no se abrió la app, mostrar mensaje
        setTimeout(() => {
            // Remover el iframe
            document.body.removeChild(iframe);
            
            // Mostrar mensaje de que la app no está instalada
            alert('Si la app no se abrió automáticamente, asegúrate de tener Alphabets instalada.');
        }, 2000);
        
    } else {
        // En ordenador, mostrar mensaje
        alert('Para abrir Alphabets, usa la app en tu móvil.');
    }
}

// Función para descargar la app
function downloadApp() {
    const isMobileDevice = isMobile();
    
    if (isMobileDevice) {
        if (isIOS()) {
            // Enlace a App Store (cuando esté disponible)
            window.open('https://apps.apple.com/app/alphabets', '_blank');
        } else if (isAndroid()) {
            // Enlace a Google Play Store (cuando esté disponible)
            window.open('https://play.google.com/store/apps/details?id=com.example.alphabetsapp', '_blank');
        } else {
            alert('Descarga Alphabets desde tu tienda de aplicaciones.');
        }
    } else {
        // En ordenador, mostrar QR code o enlaces
        alert('Escanea el QR code con tu móvil para descargar Alphabets.');
        // Aquí podrías mostrar un QR code
    }
}

// Event listeners
openAppBtn.addEventListener('click', openApp);
downloadBtn.addEventListener('click', downloadApp);

// Función para confirmar el email automáticamente
async function confirmEmail() {
    try {
        // Determinar la URL base según el entorno
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const baseUrl = isLocalhost 
            ? 'http://localhost:8001' 
            : 'https://backend-alphabets-production.up.railway.app';
        
        // Hacer petición al API para confirmar el email
        const response = await fetch(`${baseUrl}/api/usuarios/confirm-email/${token}/`);
        
        if (response.ok) {
            console.log('✅ Email confirmado exitosamente');
            
            // Si es móvil, intentar abrir la app automáticamente
            if (isMobile()) {
                setTimeout(() => {
                    openApp();
                }, 1000);
            }
            
        } else {
            console.error('❌ Error confirmando email');
            const data = await response.json();
            console.error('Error:', data.error);
        }
        
    } catch (error) {
        console.error('❌ Error de red:', error);
    }
}

// Confirmar email al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    confirmEmail();
});

// Función para manejar errores de red
window.addEventListener('online', function() {
    console.log('Conexión restaurada');
});

window.addEventListener('offline', function() {
    console.log('Sin conexión a internet');
}); 