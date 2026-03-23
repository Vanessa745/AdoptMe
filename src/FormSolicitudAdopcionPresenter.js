import Mascota from './domain/Mascota.js';
import SolicitudAdopcionService from './services/SolicitudAdopcionService.js';
import SolicitudAdopcionRepository from './infraestructure/SolicitudAdopcionRepository.js';
import MascotaRepository  from './infraestructure/MascotaRepository.js';
import ValidarConexion from './infraestructure/ValidarConexion.js';
const botonEnviarSolicitud = document.getElementById('enviarSolicitudBtn');
let registroMensajeDiv = document.getElementById('registroMensaje');
const Estado = document.getElementById('MarcarEstado');

let solicitudAdopcionService = new SolicitudAdopcionService(new SolicitudAdopcionRepository(), new ValidarConexion());
let mascotaRepository = new MascotaRepository();
let currentMascotaId = null;
// Si venimos con ?id=..., pedimos la mascota al backend y precargamos los campos
(async () => {
  try {
    const params = new URLSearchParams(globalThis.location.search);
    const id = params.get('id');
    if (id) {
      const m = await mascotaRepository.obtenerDetalleMascotaPorId( id);
      currentMascotaId = m.id || id;
      const setVal = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
      };
      const estadoEl = document.getElementById('mascotaEstado');
      setVal('mascotaNombre', m.nombre || '');
      setVal('mascotaEspecie', m.especie || '');
      setVal('mascotaRaza', m.raza || '');
      setVal('mascotaSexo', m.sexo || '');
      setVal('mascotaEdad', m.edad || '');
      setVal('mascotaEstado', m.estado || '');
      if (estadoEl && m.estado) {
        const optValue = m.estado.toString().toLowerCase();
        const match = Array.from(estadoEl.options).find(o => o.value.toLowerCase() === optValue || o.value === m.estado);
        if (match) estadoEl.value = match.value;
      }
      
    }
  } catch (err) {
    console.error('Error procesando query string en FormSolicitudAdopcionPresenter', err);
  }
})();

if (botonEnviarSolicitud) {
    botonEnviarSolicitud.addEventListener('click', () => {
      const mascota = new Mascota({
        id: currentMascotaId || undefined,
        nombre: document.getElementById('mascotaNombre')?.value || '',
        especie: document.getElementById('mascotaEspecie')?.value || '',
        raza: document.getElementById('mascotaRaza')?.value || '',
        sexo: document.getElementById('mascotaSexo')?.value || '',
        edad: Number(document.getElementById('mascotaEdad')?.value) || 0,
        estado: document.getElementById('mascotaEstado')?.value || 'disponible',
      });
      
      (async () => {
        try {
          // Leer directamente el nombre del adoptante y el id de la mascota
          // desde los valores actuales del formulario para evitar inconsistencias
          const adoptanteNombre = document.getElementById('adoptanteNombre')?.value || '';
          const mascotaIdToSend = mascota.id || currentMascotaId || undefined;

          const solicitud = await solicitudAdopcionService.createSolicitud(mascotaIdToSend, adoptanteNombre);

          globalThis.__ultimaSolicitudAdopcion = solicitud;
          const mensajeDiv = document.getElementById('solicitudMensaje');
          if (mensajeDiv) mensajeDiv.innerText = 'Solicitud enviada correctamente';
        } catch (err) {
          const mensajeDiv = document.getElementById('solicitudMensaje');
          if (mensajeDiv) mensajeDiv.innerText = err?.message || 'Error al crear la solicitud';
          console.error('Error creando SolicitudAdopcion', err);
        }
      })();
    });
  }