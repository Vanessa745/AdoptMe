import SolicitudAdopcion from '../domain/SolicitudAdopcion.js';
import Adoptante from '../domain/Adoptante.js';
import Mascota from '../domain/Mascota.js';
const _hostname =
  globalThis.window !== undefined && globalThis.location && globalThis.location.hostname
    ? globalThis.location.hostname
    : "localhost";
const API_URL =
  _hostname === "localhost"
    ? "http://localhost:3001" // desarrollo
    : "https://ingsoftadoptme.onrender.com"; // producción

function mapJsonToSolicitudAdopcion(json = {}) {
  const adoptanteNombre =
    json.adoptanteNombre ||
    (json.adoptante && json.adoptante.nombre) ||
    '';

  const mascotaId =
    json.mascotaId ||
    (json.mascota && (json.mascota.id || json.mascota._id)) ||
    null;

  const adoptante = new Adoptante({ nombre: adoptanteNombre });
  const mascota = new Mascota({ id: mascotaId });

  const fecha  = json.fechaSolicitud || json.createdAt || json.fecha || null;
  const estado = json.estado || 'pendiente';
  const id     = json.id || json._id || null; 

  return new SolicitudAdopcion(adoptante, mascota, fecha, id, estado);
}

class SolicitudAdopcionRepository {
  constructor() {
  }

  async create(mascotaId, adoptanteNombre) {
    const res = await fetch(`${API_URL}/api/solicitudes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "mascotaId": mascotaId, "adoptanteNombre": adoptanteNombre })
    });

    if (!res.ok) {
      // tratar de extraer el mensaje de error devuelto por el servidor
      let message = 'Error al crear solicitud de adopción';
      try {
        const body = await res.json();
        if (body && body.message) message = body.message;
      } catch (e) {
        console.error("No se pudo parsear la respuesta de error como JSON:", e);
        try {
          const text = await res.text();
          if (text) message = text;
        } catch (error) {
          console.error("No se pudo leer la respuesta de error como texto:", error);
        }
      }
      throw new Error(message);
    }

    const json = await res.json();
    return mapJsonToSolicitudAdopcion(json);
  }

  async obtenerTodasSolicitudes() {
    const res = await fetch(`${API_URL}/api/solicitudes`);

    if (!res.ok) {
      let message = 'Error al obtener solicitudes de adopción';
      try {
        const body = await res.json();
        if (body && body.message) message = body.message;
      } catch (e) {
        console.error("No se pudo parsear la respuesta de error como JSON:", e);
        try {
          const text = await res.text();
          if (text) message = text;
        } catch (error) {
          console.error("No se pudo leer la respuesta de error como texto:", error);
        }
      }
      throw new Error(message);
    }

    const jsonArray = await res.json(); // es un array como el de Postman
    return jsonArray.map(mapJsonToSolicitudAdopcion);
  }

  async actualizarEstado(solicitudId, nuevoEstado) {
    const res = await fetch(`${API_URL}/api/solicitudes/${solicitudId}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });

    if (!res.ok) {
      let message = 'Error al actualizar estado de la solicitud';
      try {
        const body = await res.json();
        if (body && body.message) message = body.message;
      } catch (e) {
        console.error("No se pudo parsear la respuesta de error como JSON:", e);
        try {
          const text = await res.text();
          if (text) message = text;
        } catch (error) {
          console.error("No se pudo leer la respuesta de error como texto:", error);
        }
      }
      throw new Error(message);
    }

    const json = await res.json();
    return mapJsonToSolicitudAdopcion(json);
  }
}
export default SolicitudAdopcionRepository;