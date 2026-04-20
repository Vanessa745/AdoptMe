import MascotaRepository from '../infraestructure/MascotaRepository.js';
import Mascota from '../domain/Mascota.js';

describe('MascotaRepository (unidad, con fetch mock)', () => {
  let repository;

  beforeEach(() => {
    repository = new MascotaRepository();
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('obtenerMascotas retorna el arreglo cuando la respuesta es válida', async () => {
    const apiData = [
      {
        _id: '1',
        nombre: 'Luna',
        especie: 'Perro',
        raza: 'Labrador',
        sexo: 'Hembra',
        edad: 3,
        estado: 'Disponible',
        img_ref: 'uploads/luna.jpg',
        facilitador: 'Ana',
        id: '1',
      },
    ];

    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(apiData),
    });

    const result = await repository.obtenerMascotas();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result).toBe(apiData);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
  });

  test('obtenerMascotas lanza error cuando la respuesta es un arreglo vacío', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([]),
    });

    await expect(repository.obtenerMascotas()).rejects.toThrow('No hay mascotas disponibles.');
  });

  test('obtenerMascotas lanza error cuando la respuesta no es un arreglo', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ mensaje: 'respuesta inválida' }),
    });

    await expect(repository.obtenerMascotas()).rejects.toThrow('No hay mascotas disponibles.');
  });

  test('obtenerDetalleMascotaPorId retorna una instancia de Mascota cuando el id existe', async () => {
    const apiItem = {
      id: 'mas-1',
      nombre: 'Toby',
      especie: 'Perro',
      raza: 'Beagle',
      sexo: 'Macho',
      edad: 2,
      estado: 'Disponible',
      img_ref: 'https://example.com/toby.jpg',
      facilitador: 'Luis',
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(apiItem),
    });

    const result = await repository.obtenerDetalleMascotaPorId('mas-1');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/mascotas/mas-1'));
    expect(result).toBeInstanceOf(Mascota);
    expect(result.id).toBe('mas-1');
    expect(result.nombre).toBe('Toby');
    expect(result.especie).toBe('Perro');
  });

  test('obtenerDetalleMascotaPorId lanza error cuando no se envía id', async () => {
    await expect(repository.obtenerDetalleMascotaPorId()).rejects.toThrow('id de mascota no proporcionado.');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('crearMascota envía FormData cuando la entrada es un formulario', async () => {
    const formData = new FormData();
    formData.append('nombre', 'Milo');

    const apiResponse = {
      id: 'mas-2',
      nombre: 'Milo',
      especie: 'Gato',
      raza: 'Criollo',
      sexo: 'Macho',
      edad: 1,
      estado: 'disponible',
      img_ref: 'uploads/milo.jpg',
      facilitador: 'Carla',
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(apiResponse),
    });

    const result = await repository.crearMascota(formData);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][1].body).toBe(formData);
    expect(global.fetch.mock.calls[0][1].headers).toBeUndefined();
    expect(result).toBeInstanceOf(Mascota);
    expect(result.nombre).toBe('Milo');
  });

  test('crearMascota envía JSON cuando la entrada no es FormData', async () => {
    const mascotaData = {
      nombre: 'Coco',
      especie: 'Perro',
      raza: 'Poodle',
      sexo: 'Macho',
      edad: 4,
    };

    const apiResponse = {
      id: 'mas-3',
      nombre: 'Coco',
      especie: 'Perro',
      raza: 'Poodle',
      sexo: 'Macho',
      edad: 4,
      estado: 'disponible',
      img_ref: '',
      facilitador: 'María',
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(apiResponse),
    });

    const result = await repository.crearMascota(mascotaData);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][1].headers).toEqual({ 'Content-Type': 'application/json' });
    expect(global.fetch.mock.calls[0][1].body).toBe(JSON.stringify(mascotaData));
    expect(result).toBeInstanceOf(Mascota);
    expect(result.nombre).toBe('Coco');
  });

  test('crearMascota lanza error cuando la respuesta no es ok', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: 'Error servidor' }),
    });

    await expect(
      repository.crearMascota({ nombre: 'Kira', especie: 'Perro', raza: 'Mestiza' })
    ).rejects.toThrow('Error al crear mascota');
  });
});