import SolicitudAdopcionRepository from '../infraestructure/SolicitudAdopcionRepository.js';
import SolicitudAdopcion from '../domain/SolicitudAdopcion.js';

describe('SolicitudAdopcionRepository.create', () => {
  let solicitudAdopcionRepository;

  beforeEach(() => {
    solicitudAdopcionRepository = new SolicitudAdopcionRepository();
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('TC1 - debe retornar una SolicitudAdopcion cuando res.ok es true', async () => {
    const jsonResponse = {
      id: 1,
      mascotaId: 6,
      adoptanteNombre: 'Oscar',
      fechaSolicitud: '2026-04-19',
      estado: 'pendiente'
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(jsonResponse)
    });

    const result = await solicitudAdopcionRepository.create(6, 'Oscar');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/solicitudes'),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mascotaId: 6,
          adoptanteNombre: 'Oscar'
        })
      }
    );

    expect(result).toBeInstanceOf(SolicitudAdopcion);
    expect(result.id).toBe(1);
    expect(result.estado).toBe('pendiente');
    expect(result.fechaSolicitud).toBe('2026-04-19');
    expect(result.adoptante.nombre).toBe('Oscar');
    expect(result.mascota.id).toBe(6);
  });

  test('TC2 - debe lanzar Error con body.message cuando !res.ok y res.json() funciona con message', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({
        message: 'La mascota ya tiene una solicitud pendiente'
      })
    });

    await expect(solicitudAdopcionRepository.create(6, 'Oscar')).rejects.toThrow(
      'La mascota ya tiene una solicitud pendiente'
    );
  });

  test('TC3 - debe lanzar Error por defecto cuando !res.ok y res.json() funciona sin body.message', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({
        detalle: 'No existe campo message'
      })
    });

    await expect(solicitudAdopcionRepository.create(6, 'Oscar')).rejects.toThrow(
      'Error al crear solicitud de adopción'
    );
  });

  test('TC4 - debe lanzar Error con text cuando !res.ok, res.json() falla y res.text() devuelve texto', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockRejectedValue(new Error('JSON inválido')),
      text: jest.fn().mockResolvedValue('No se pudo procesar la solicitud')
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(solicitudAdopcionRepository.create(6, 'Oscar')).rejects.toThrow(
      'No se pudo procesar la solicitud'
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'No se pudo parsear la respuesta de error como JSON:',
      expect.any(Error)
    );
  });

  test('TC5 - debe lanzar Error por defecto cuando !res.ok, res.json() falla y res.text() devuelve vacío', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockRejectedValue(new Error('JSON inválido')),
      text: jest.fn().mockResolvedValue('')
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(solicitudAdopcionRepository.create(6, 'Oscar')).rejects.toThrow(
      'Error al crear solicitud de adopción'
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'No se pudo parsear la respuesta de error como JSON:',
      expect.any(Error)
    );
  });

  test('TC6 - debe lanzar Error por defecto cuando !res.ok, res.json() falla y res.text() también falla', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockRejectedValue(new Error('JSON inválido')),
      text: jest.fn().mockRejectedValue(new Error('No se pudo leer texto'))
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(solicitudAdopcionRepository.create(6, 'Oscar')).rejects.toThrow(
      'Error al crear solicitud de adopción'
    );

    expect(consoleSpy).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenNthCalledWith(
      1,
      'No se pudo parsear la respuesta de error como JSON:',
      expect.any(Error)
    );
    expect(consoleSpy).toHaveBeenNthCalledWith(
      2,
      'No se pudo leer la respuesta de error como texto:',
      expect.any(Error)
    );
  });
});

describe('SolicitudAdopcionRepository.obtenerTodasSolicitudes', () => {
  let repository;

  beforeEach(() => {
    repository = new SolicitudAdopcionRepository();
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('TC1 - debe retornar un arreglo de SolicitudAdopcion cuando res.ok es true', async () => {
    const jsonResponse = [
      {
        id: 1,
        mascotaId: 6,
        adoptanteNombre: 'Oscar',
        fechaSolicitud: '2026-04-19',
        estado: 'pendiente'
      },
      {
        id: 2,
        mascotaId: 7,
        adoptanteNombre: 'Lucia',
        fechaSolicitud: '2026-04-20',
        estado: 'aprobada'
      }
    ];

    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(jsonResponse)
    });

    const result = await repository.obtenerTodasSolicitudes();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/solicitudes')
    );

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);

    expect(result[0]).toBeInstanceOf(SolicitudAdopcion);
    expect(result[0].id).toBe(1);
    expect(result[0].estado).toBe('pendiente');
    expect(result[0].fechaSolicitud).toBe('2026-04-19');
    expect(result[0].adoptante.nombre).toBe('Oscar');
    expect(result[0].mascota.id).toBe(6);

    expect(result[1]).toBeInstanceOf(SolicitudAdopcion);
    expect(result[1].id).toBe(2);
    expect(result[1].estado).toBe('aprobada');
    expect(result[1].fechaSolicitud).toBe('2026-04-20');
    expect(result[1].adoptante.nombre).toBe('Lucia');
    expect(result[1].mascota.id).toBe(7);
  });

  test('TC2 - debe lanzar Error con body.message cuando !res.ok y res.json() funciona con message', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({
        message: 'No se pudieron recuperar las solicitudes'
      })
    });

    await expect(repository.obtenerTodasSolicitudes()).rejects.toThrow(
      'No se pudieron recuperar las solicitudes'
    );
  });

  test('TC3 - debe lanzar Error por defecto cuando !res.ok y res.json() funciona sin body.message', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({
        detalle: 'Respuesta sin campo message'
      })
    });

    await expect(repository.obtenerTodasSolicitudes()).rejects.toThrow(
      'Error al obtener solicitudes de adopción'
    );
  });

  test('TC4 - debe lanzar Error con text cuando !res.ok, res.json() falla y res.text() devuelve texto', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockRejectedValue(new Error('JSON inválido')),
      text: jest.fn().mockResolvedValue('Servicio no disponible')
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(repository.obtenerTodasSolicitudes()).rejects.toThrow(
      'Servicio no disponible'
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'No se pudo parsear la respuesta de error como JSON:',
      expect.any(Error)
    );
  });

  test('TC5 - debe lanzar Error por defecto cuando !res.ok, res.json() falla y res.text() devuelve vacío', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockRejectedValue(new Error('JSON inválido')),
      text: jest.fn().mockResolvedValue('')
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(repository.obtenerTodasSolicitudes()).rejects.toThrow(
      'Error al obtener solicitudes de adopción'
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'No se pudo parsear la respuesta de error como JSON:',
      expect.any(Error)
    );
  });

  test('TC6 - debe lanzar Error por defecto cuando !res.ok, res.json() falla y res.text() también falla', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockRejectedValue(new Error('JSON inválido')),
      text: jest.fn().mockRejectedValue(new Error('No se pudo leer texto'))
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(repository.obtenerTodasSolicitudes()).rejects.toThrow(
      'Error al obtener solicitudes de adopción'
    );

    expect(consoleSpy).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenNthCalledWith(
      1,
      'No se pudo parsear la respuesta de error como JSON:',
      expect.any(Error)
    );
    expect(consoleSpy).toHaveBeenNthCalledWith(
      2,
      'No se pudo leer la respuesta de error como texto:',
      expect.any(Error)
    );
  });
});

describe('SolicitudAdopcionRepository.actualizarEstado', () => {
  let repository;

  beforeEach(() => {
    repository = new SolicitudAdopcionRepository();
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('TC1 - debe retornar un objeto SolicitudAdopcion cuando res.ok es true', async () => {
    const jsonResponse = {
      id: 3,
      mascotaId: 6,
      adoptanteNombre: 'Oscar',
      fechaSolicitud: '2026-04-19',
      estado: 'adoptado'
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(jsonResponse)
    });

    const result = await repository.actualizarEstado(3, 'adoptado');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/solicitudes/3/estado'),
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'adoptado' })
      }
    );

    expect(result).toBeInstanceOf(SolicitudAdopcion);
    expect(result.id).toBe(3);
    expect(result.estado).toBe('adoptado');
    expect(result.fechaSolicitud).toBe('2026-04-19');
    expect(result.adoptante.nombre).toBe('Oscar');
    expect(result.mascota.id).toBe(6);
  });

  test('TC2 - debe lanzar Error con body.message cuando !res.ok y res.json() funciona con message', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({
        message: 'No se pudo actualizar el estado'
      })
    });

    await expect(repository.actualizarEstado(3, 'adoptado')).rejects.toThrow(
      'No se pudo actualizar el estado'
    );
  });

  test('TC3 - debe lanzar Error por defecto cuando !res.ok y res.json() funciona sin body.message', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({
        detalle: 'Respuesta sin campo message'
      })
    });

    await expect(repository.actualizarEstado(3, 'adoptado')).rejects.toThrow(
      'Error al actualizar estado de la solicitud'
    );
  });

  test('TC4 - debe lanzar Error con text cuando !res.ok, res.json() falla y res.text() devuelve texto', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockRejectedValue(new Error('JSON inválido')),
      text: jest.fn().mockResolvedValue('Estado inválido')
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(repository.actualizarEstado(3, 'adoptado')).rejects.toThrow(
      'Estado inválido'
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'No se pudo parsear la respuesta de error como JSON:',
      expect.any(Error)
    );
  });

  test('TC5 - debe lanzar Error por defecto cuando !res.ok, res.json() falla y res.text() devuelve vacío', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockRejectedValue(new Error('JSON inválido')),
      text: jest.fn().mockResolvedValue('')
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(repository.actualizarEstado(3, 'adoptado')).rejects.toThrow(
      'Error al actualizar estado de la solicitud'
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'No se pudo parsear la respuesta de error como JSON:',
      expect.any(Error)
    );
  });

  test('TC6 - debe lanzar Error por defecto cuando !res.ok, res.json() falla y res.text() también falla', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockRejectedValue(new Error('JSON inválido')),
      text: jest.fn().mockRejectedValue(new Error('No se pudo leer texto'))
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(repository.actualizarEstado(3, 'adoptado')).rejects.toThrow(
      'Error al actualizar estado de la solicitud'
    );

    expect(consoleSpy).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenNthCalledWith(
      1,
      'No se pudo parsear la respuesta de error como JSON:',
      expect.any(Error)
    );
    expect(consoleSpy).toHaveBeenNthCalledWith(
      2,
      'No se pudo leer la respuesta de error como texto:',
      expect.any(Error)
    );
  });
});