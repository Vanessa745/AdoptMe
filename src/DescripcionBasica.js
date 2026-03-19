import { validarFormulario } from './services/ValidarFormRegistro.js';
import { mostrarArchivoSeleccionado } from './services/MostrarArchivoSeleccionado.js';
import { registrarNuevaMascota } from './services/RegistroMascotaService.js';
import { inicializarEstadoMascota } from './services/CambiarEstado.js';


const botonSubir = document.getElementById('subirDocumentoBtn');
const archivoInput = document.getElementById('documento');
const Estado = document.getElementById('MarcarEstado');
const radios = document.querySelectorAll('input[name="estado"]');
const result = document.getElementById('resultEstadoMarc');
const registrarbton = document.getElementById('registrarBtn');


botonSubir.addEventListener('click', () => {
  archivoInput.click();
});

archivoInput.addEventListener('change', mostrarArchivoSeleccionado);

registrarbton.addEventListener('click', () => {
  if (validarFormulario()) {
    const formData = new FormData();
    formData.append('nombre', document.getElementById('nombre').value);
    formData.append('especie', document.getElementById('especie').value);
    formData.append('edad', document.getElementById('edad').value);
    formData.append('raza', document.getElementById('Raza').value);
    formData.append('sexo', document.getElementById('Sexo').value);
    formData.append('facilitador', document.getElementById('facilitador').value);
    
    const imagenInput = document.getElementById('documento');
    if (imagenInput.files.length > 0) {
      formData.append('imagen', imagenInput.files[0]);
    }

    registrarNuevaMascota(formData)
    .then(data => {
      console.log('Success:', data);
      alert('Mascota registrada.');
      setTimeout(() => {
        globalThis.location.href = '../index.html';
      }, 1000);
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Error al registrar la mascota.');
    });
  }
});

inicializarEstadoMascota('input[name="estado"]', '#resultEstadoMarc');