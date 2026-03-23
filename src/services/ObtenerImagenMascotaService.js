// Determinar URL base del API según entorno (coincide con otros repos)
const _hostname =
    globalThis.window?.location?.hostname || 'localhost';
const API_URL = _hostname === 'localhost' ? 'http://localhost:3001' : 'https://ingsoftadoptme.onrender.com';

export const buildImgUrl = (imgRef) => {
    if (!imgRef) return '';
    // si ya es absoluta
    if (/^https?:\/\//i.test(imgRef)) return imgRef;
    // si empieza con slash, unimos directamente
    if (imgRef.startsWith('/')) return `${API_URL}${imgRef}`;
    // si viene como uploads/filename
    return `${API_URL}${imgRef}`;
};

