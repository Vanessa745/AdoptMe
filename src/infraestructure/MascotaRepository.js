import Mascota from "../domain/Mascota.js";
const _hostname =
  globalThis.window?.location?.hostname || "localhost";
const API_URL =
  _hostname === "localhost"
    ? "http://localhost:3001" // desarrollo
    : "https://ingsoftadoptme.onrender.com"; // producción
function mapJsonToMascota(json) {
  return new Mascota({
    id: json.id ?? json._id,   
    nombre: json.nombre,
    especie: json.especie,
    raza: json.raza,
    sexo: json.sexo,
    edad: json.edad,
    estado: json.estado,
    img_ref: json.img_ref,
    facilitador: json.facilitador,
  });
}
export default class MascotaRepository {

  async obtenerMascotas() {
    const res = await fetch(`${API_URL}/api/mascotas`);
    const mascotas = await res.json();
    if (!Array.isArray(mascotas) || mascotas.length === 0) {
        throw new Error("No hay mascotas disponibles.");
    }
    return mascotas;
  }

  async obtenerDetalleMascotaPorId(idMascota = null) {
    if (!idMascota) {
      throw new Error('id de mascota no proporcionado.');
    }

    const res = await fetch(`${API_URL}/api/mascotas/${encodeURIComponent(idMascota)}`);
    const json = await res.json();
    return mapJsonToMascota(json);
  }

  async crearMascota(mascotaData) {
    const url = `${API_URL}/api/mascotas`;

    const options = { method: "POST" };

    if (mascotaData instanceof FormData) {
      // Caso con imagen
      options.body = mascotaData;
    } else {
      // Caso JSON (sin imagen)
      options.headers = { "Content-Type": "application/json" };
      options.body = JSON.stringify(mascotaData);
    }

    const res = await fetch(url, options);

    if (!res.ok) {
      throw new Error("Error al crear mascota");
    }

    const json = await res.json();
    return mapJsonToMascota(json);
}
}
