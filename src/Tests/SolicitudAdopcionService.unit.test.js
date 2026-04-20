import SolicitudAdopcionService from '../services/SolicitudAdopcionService.js';

describe('SolicitudAdopcionService (unidad, sin API)', () => {
  let repository;
  let validarConexion;
  let service;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      obtenerTodasSolicitudes: jest.fn(),
      actualizarEstado: jest.fn(),
    };

    validarConexion = {
      validarConexionInternet: jest.fn(),
      validarConexionBackend: jest.fn(),
    };

    service = new SolicitudAdopcionService(repository, validarConexion);
  });

  test('createSolicitud debe validar conexión y delegar al repositorio', async () => {
    const expected = { id: 'sol-1', estado: 'pendiente' };
    validarConexion.validarConexionInternet.mockResolvedValue(undefined);
    validarConexion.validarConexionBackend.mockResolvedValue(undefined);
    repository.create.mockResolvedValue(expected);

    const result = await service.createSolicitud('mas-1', 'Lucia');

    expect(validarConexion.validarConexionInternet).toHaveBeenCalledTimes(1);
    expect(validarConexion.validarConexionBackend).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith('mas-1', 'Lucia');
    expect(result).toBe(expected);
  });

  test('getTodasLasSolicitudes debe delegar al repositorio', async () => {
    const expected = [{ id: 'sol-1' }, { id: 'sol-2' }];
    repository.obtenerTodasSolicitudes.mockResolvedValue(expected);

    const result = await service.getTodasLasSolicitudes();

    expect(repository.obtenerTodasSolicitudes).toHaveBeenCalledTimes(1);
    expect(result).toBe(expected);
  });

  test('actualizarEstadoSolicitud debe validar conexión y delegar al repositorio', async () => {
    const expected = { id: 'sol-7', estado: 'aprobada' };
    validarConexion.validarConexionInternet.mockResolvedValue(undefined);
    validarConexion.validarConexionBackend.mockResolvedValue(undefined);
    repository.actualizarEstado.mockResolvedValue(expected);

    const result = await service.actualizarEstadoSolicitud('sol-7', 'aprobada');

    expect(validarConexion.validarConexionInternet).toHaveBeenCalledTimes(1);
    expect(validarConexion.validarConexionBackend).toHaveBeenCalledTimes(1);
    expect(repository.actualizarEstado).toHaveBeenCalledWith('sol-7', 'aprobada');
    expect(result).toBe(expected);
  });

  test('createSolicitud no debe llamar backend ni repositorio si falla validarConexionInternet', async () => {
    validarConexion.validarConexionInternet.mockRejectedValue(new Error('Sin internet'));

    await expect(service.createSolicitud('mas-1', 'Lucia')).rejects.toThrow('Sin internet');

    expect(validarConexion.validarConexionBackend).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
  });
});
