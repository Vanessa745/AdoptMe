class SolicitudAdopcion {

  constructor(adoptante, mascota, fechaSolicitud, id = null, estado = 'pendiente') {
    if (mascota && mascota.estado && mascota.estado !== 'disponible') {
      throw new Error('La mascota no está disponible para adopción');
    }

    if (adoptante) this.adoptante = adoptante;
    if (mascota) this.mascota = mascota;

    this.id = id;                 
    this.estado = estado;       
    this.fechaSolicitud = fechaSolicitud;
  }
}

export default SolicitudAdopcion;