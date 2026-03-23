export default class ValidarConexion {
  validarConexionInternet() {
    if (!navigator.onLine) {
      throw new Error("Revise su conexión a internet.");
    }
  }

  async validarConexionBackend() {
    const _hostname =
      globalThis.window?.location?.hostname || "localhost";

    const API_URL =
      _hostname === "localhost"
        ? "http://localhost:3001" // desarrollo
        : "https://ingsoftadoptme.onrender.com"; // producción

    // Llamar a un endpoint que exista en el backend (root devuelve 404)
    const respuesta = await fetch(`${API_URL}`);
    if (!respuesta.ok) {
      throw new Error("Hubo un error con la conexion a nuestro servidor.");
    }
  }
}