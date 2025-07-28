// Obtener elementos del DOM
const form = document.getElementById('resetForm');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordError = document.getElementById('passwordError');
const confirmError = document.getElementById('confirmError');
const statusMessage = document.getElementById('statusMessage');
const submitBtn = document.getElementById('submitBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const successMessage = document.getElementById('successMessage');

// Obtener token de la URL (está en el path, no en query params)
const pathParts = window.location.pathname.split('/').filter(p => p); // elimina elementos vacíos
const token = pathParts[pathParts.length - 1]; // Obtener el último elemento del path filtrado
const urlParams = new URLSearchParams(window.location.search);
const error = urlParams.get('error');

console.log('🔐 TOKEN EXTRACTION - Full URL:', window.location.href);
console.log('🔐 TOKEN EXTRACTION - Pathname:', window.location.pathname);
console.log('🔐 TOKEN EXTRACTION - Path parts (original):', window.location.pathname.split('/'));
console.log('🔐 TOKEN EXTRACTION - Path parts (filtered):', pathParts);
console.log('🔐 TOKEN EXTRACTION - Path parts length:', pathParts.length);
console.log('🔐 TOKEN EXTRACTION - Last element:', pathParts[pathParts.length - 1]);
console.log('🔐 TOKEN EXTRACTION - Token extracted:', token);
console.log('🔐 TOKEN EXTRACTION - Error param:', error);

// Verificar si hay error en la URL
if (error === 'invalid_token') {
    showStatusMessage('Este enlace ha expirado o es inválido. Solicita un nuevo enlace de recuperación.', 'error');
    submitBtn.disabled = true;
    form.style.display = 'none';
}

// Verificar si el token existe y es válido (debe ser un UUID)
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
console.log('🔐 TOKEN VALIDATION - Token exists:', !!token);
console.log('🔐 TOKEN VALIDATION - Token matches UUID pattern:', uuidRegex.test(token));
if (!token || !uuidRegex.test(token)) {
    showStatusMessage('Enlace inválido. Por favor, solicita un nuevo enlace de recuperación.', 'error');
    submitBtn.disabled = true;
    form.style.display = 'none';
}

// Validación en tiempo real
function validatePassword(password) {
    if (password.length < 8) {
        return 'La contraseña debe tener al menos 8 caracteres';
    }
    return '';
}

function validateConfirmPassword(password, confirmPassword) {
    if (password !== confirmPassword) {
        return 'Las contraseñas no coinciden';
    }
    return '';
}

// Función para mostrar errores
function showError(element, message) {
    element.textContent = message;
    element.style.display = message ? 'block' : 'none';
}

// Función para mostrar mensaje de estado
function showStatusMessage(message, type = 'error') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.style.display = message ? 'block' : 'none';
    
    // Hacer el mensaje más visible
    if (message) {
        statusMessage.style.backgroundColor = type === 'error' ? '#fee2e2' : '#dcfce7';
        statusMessage.style.color = type === 'error' ? '#dc2626' : '#16a34a';
        statusMessage.style.padding = '12px';
        statusMessage.style.borderRadius = '8px';
        statusMessage.style.margin = '10px 0';
        statusMessage.style.border = type === 'error' ? '1px solid #fca5a5' : '1px solid #86efac';
    }
    
    console.log(`🔐 STATUS MESSAGE - ${type.toUpperCase()}:`, message);
}

// Función para mostrar loading
function setLoading(loading) {
    if (loading) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
    } else {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Función para mostrar éxito
function showSuccess() {
    form.style.display = 'none';
    successMessage.style.display = 'block';
}

// Event listeners para validación en tiempo real
newPasswordInput.addEventListener('input', function() {
    const error = validatePassword(this.value);
    showError(passwordError, error);
    
    // Validar confirmación si existe
    if (confirmPasswordInput.value) {
        const confirmError = validateConfirmPassword(this.value, confirmPasswordInput.value);
        showError(confirmError, confirmError);
    }
});

confirmPasswordInput.addEventListener('input', function() {
    const error = validateConfirmPassword(newPasswordInput.value, this.value);
    showError(confirmError, error);
});

// Manejar envío del formulario
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    console.log('🔐 FORM SUBMITTED - Iniciando proceso de actualización de contraseña');
    
    // Obtener valores
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    console.log('🔐 FORM SUBMITTED - Token:', token);
    console.log('🔐 FORM SUBMITTED - Nueva contraseña:', newPassword ? '***' : 'vacía');
    console.log('🔐 FORM SUBMITTED - Confirmar contraseña:', confirmPassword ? '***' : 'vacía');
    
    // Validar
    const passwordErrorMsg = validatePassword(newPassword);
    const confirmErrorMsg = validateConfirmPassword(newPassword, confirmPassword);
    
    if (passwordErrorMsg) {
        console.log('❌ FORM SUBMITTED - Error de validación de contraseña:', passwordErrorMsg);
        showError(passwordError, passwordErrorMsg);
        return;
    }
    
    if (confirmErrorMsg) {
        console.log('❌ FORM SUBMITTED - Error de validación de confirmación:', confirmErrorMsg);
        showError(confirmError, confirmErrorMsg);
        return;
    }
    
    // Limpiar errores
    showError(passwordError, '');
    showError(confirmError, '');
    showStatusMessage('');
    
    // Mostrar loading
    setLoading(true);
    
    try {
        // Determinar la URL base según el entorno
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const baseUrl = isLocalhost 
            ? 'http://localhost:8001' 
            : 'https://backend-alphabets-production.up.railway.app';
        
        const apiUrl = `${baseUrl}/api/usuarios/reset-password/${token}/`;
        const requestBody = {
            new_password: newPassword
        };
        
        console.log('🔐 FORM SUBMITTED - URL de la API:', apiUrl);
        console.log('🔐 FORM SUBMITTED - Body de la petición:', requestBody);
        
        // Hacer petición al API
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('🔐 FORM SUBMITTED - Status de respuesta:', response.status);
        console.log('🔐 FORM SUBMITTED - Headers de respuesta:', response.headers);
        
        const data = await response.json();
        console.log('🔐 FORM SUBMITTED - Datos de respuesta:', data);
        
        if (response.ok) {
            // Éxito
            console.log('✅ FORM SUBMITTED - Contraseña actualizada exitosamente');
            showSuccess();
        } else {
            // Error
            const errorMessage = data.error || data.message || 'Error al actualizar la contraseña';
            console.error('❌ FORM SUBMITTED - Error del servidor:', errorMessage);
            showStatusMessage(errorMessage, 'error');
        }
        
    } catch (error) {
        // Error de red
        console.error('❌ FORM SUBMITTED - Error de red:', error);
        const errorMessage = 'Error de conexión. Verifica tu conexión a internet e intenta de nuevo.';
        showStatusMessage(errorMessage, 'error');
    } finally {
        // Ocultar loading
        setLoading(false);
    }
});

// Función para verificar si el token es válido al cargar la página
async function validateToken() {
    // Si ya hay un error en la URL, no validar
    if (error === 'invalid_token') {
        return;
    }
    
    // Si no hay token, no validar
    if (!token) {
        return;
    }
    
    try {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const baseUrl = isLocalhost 
            ? 'http://localhost:8001' 
            : 'https://backend-alphabets-production.up.railway.app';
        
        const response = await fetch(`${baseUrl}/api/usuarios/validate-reset-token/${token}/`);
        
        if (!response.ok) {
            showStatusMessage('Este enlace ha expirado o es inválido. Solicita un nuevo enlace de recuperación.', 'error');
            submitBtn.disabled = true;
            form.style.display = 'none';
        }
    } catch (error) {
        console.error('Error validando token:', error);
        // No bloquear el formulario si hay error de red
    }
}

// Validar token al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 PAGE LOADED - Página de recuperación de contraseña cargada');
    console.log('🔐 PAGE LOADED - Token:', token);
    console.log('🔐 PAGE LOADED - Error:', error);
    
    // Mostrar mensaje inicial si el token es válido
    if (token && !error) {
        showStatusMessage('Formulario listo. Introduce tu nueva contraseña.', 'success');
    }
    
    validateToken();
});

// Función para copiar al portapapeles (opcional)
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Texto copiado al portapapeles');
        });
    }
}

// Función para detectar si es móvil
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Añadir clase móvil si es necesario
if (isMobile()) {
    document.body.classList.add('mobile');
}

// Función para manejar errores de red
window.addEventListener('online', function() {
    showStatusMessage('', '');
});

window.addEventListener('offline', function() {
    showStatusMessage('Sin conexión a internet. Verifica tu conexión.', 'error');
});

// Función para prevenir envío múltiple
let isSubmitting = false;

form.addEventListener('submit', function(e) {
    if (isSubmitting) {
        e.preventDefault();
        return;
    }
    
    isSubmitting = true;
    
    // Reset después de un tiempo
    setTimeout(() => {
        isSubmitting = false;
    }, 3000);
}); 