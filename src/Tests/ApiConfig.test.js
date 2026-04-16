import { buildImgUrl, API_URL } from '../services/ApiConfig.js';

describe('ApiConfig.buildImgUrl (unidad)', () => {
  test('retorna cadena vacia cuando no hay referencia de imagen', () => {
    expect(buildImgUrl('')).toBe('');
    expect(buildImgUrl(null)).toBe('');
    expect(buildImgUrl(undefined)).toBe('');
  });

  test('retorna la URL original cuando ya es absoluta', () => {
    const absolute = 'https://cdn.example.com/image.jpg';
    expect(buildImgUrl(absolute)).toBe(absolute);
  });

  test('construye URL cuando la ruta empieza con slash', () => {
    expect(buildImgUrl('/uploads/foto.png')).toBe(`${API_URL}/uploads/foto.png`);
  });

  test('construye URL cuando la ruta es relativa', () => {
    expect(buildImgUrl('uploads/foto.png')).toBe(`${API_URL}/uploads/foto.png`);
  });
});
