export class MascotaService {
  constructor(mascotaRepository, validarConexion) {
    this.mascotaRepository = mascotaRepository;
    this.validarConexion = validarConexion;
  }

  async obtenerMascotas() {
    this.validarConexion.validarConexionInternet();
    this.validarConexion.validarConexionBackend();
    return this.mascotaRepository.obtenerMascotas();
  }

  async obtenerDetalleMascotaPorId(idMascota) {
    this.validarConexion.validarConexionInternet();
    this.validarConexion.validarConexionBackend();
    return this.mascotaRepository.obtenerDetalleMascotaPorId(idMascota);
  }
}