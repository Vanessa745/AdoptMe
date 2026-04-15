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
});