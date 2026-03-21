import Mascota from '../domain/Mascota.js';

export function validarFormulario() {
  const nombre = document.getElementById('nombre')?.value || '';
  const especie = document.getElementById('especie')?.value || '';
  const edad = document.getElementById('edad')?.value || '';
  const raza = document.getElementById('Raza')?.value || '';
  const sexo = document.getElementById('Sexo')?.value || '';

  if (!nombre.trim() || !especie.trim() || !edad.toString().trim() || !raza.trim() || !sexo.trim()) {
    alert('Por favor, complete todos los campos del formulario.');
    return null;
  }

  // Crear instancia de Mascota con los datos del formulario
  const mascota = new Mascota({
    nombre: nombre.trim(),
    especie: especie.trim(),
    raza: raza.trim(),
    sexo: sexo.trim(),
    edad: Number(edad) || 0,
  });

  return mascota;
}