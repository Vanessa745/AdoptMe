import { MascotaService } from '../services/MascotaService.js';
import MascotaRepository from '../infraestructure/MascotaRepository.js';
import ValidarConexion from '../infraestructure/ValidarConexion.js';

function setupBrowserGlobals() {
  if (globalThis.window === undefined) globalThis.window = { location: { hostname: 'localhost', search: '' } };
  else globalThis.window.location = globalThis.window.location || { hostname: 'localhost', search: '' };

  if (globalThis.navigator === undefined) globalThis.navigator = {};
  // default online; tests may toggle this value
  Object.defineProperty(globalThis.navigator, 'onLine', { value: true, configurable: true, writable: true });
}
const mockInternetConnection = (status) => {
        Object.defineProperty(navigator, 'onLine', {
            value: status,
            configurable: true
        });
    };

function createFetchMock({ healthOk = true, mascotasResponse = { ok: true, status: 200, json: async () => [] } } = {}) {
  return async (url) => {
    const u = String(url);
    // ValidarConexion.validarConexionBackend() does a fetch(API_URL) where API_URL is either
    // http://localhost:3001 or https://ingsoftadoptme.onrender.com
    if (u === 'http://localhost:3001' || u === 'https://ingsoftadoptme.onrender.com') {
      if (healthOk) return { ok: true, status: 200, json: async () => ({ status: 'ok' }) };
      return { ok: false, status: 500, json: async () => { throw new Error('HTTP 500'); } };
    }

    // llamadas a /api/mascotas o /api/mascotas/:id
    if (u.includes('/api/mascotas')) {
      return typeof mascotasResponse === 'function' ? mascotasResponse(u) : mascotasResponse;
    }

    // fallback
    return { ok: true, status: 200, json: async () => ({}) };
  };
}

describe('obtenerMascotas', () => {
  afterEach(() => jest.restoreAllMocks());
  let mascotaService;
  let mascotaRepository;
  let validarConexion;
  beforeEach(() => {
    setupBrowserGlobals();

    validarConexion = new ValidarConexion();
    mascotaRepository = new MascotaRepository();
    mascotaService = new MascotaService(mascotaRepository, validarConexion);

    jest.spyOn(globalThis, 'fetch').mockImplementation(
      createFetchMock({ healthOk: true, mascotasResponse: { ok: true, status: 200, json: async () => [] } })
    );
  });

  test('TC1 - lanza error con mensaje cuando no hay conexión a internet', async () => {
    mockInternetConnection(false);
    await expect(mascotaService.obtenerMascotas()).rejects.toThrow('Revise su conexión a internet.');
  });

  test('TC2 - lanza error con código HTTP cuando la respuesta no es ok (no se pudo conectar a Backend)', async () => {
    jest.spyOn(globalThis, 'fetch').mockImplementation(
      createFetchMock({ healthOk: true, mascotasResponse: { ok: false, status: 500, json: async () => { throw new Error('HTTP 500'); } } })
    );
    await expect(mascotaService.obtenerMascotas()).rejects.toThrow('HTTP 500');
  });


  test('TC3 - éxito, se establece conexión a internet y al Backend', async () => {
    const apiData = [
      {
        _id: '1',
        nombre: 'Juanito',
        especie: 'Perro',
        raza: 'bulldog',
        edad: 3,
        estado: 'Disponible',
        img_ref: 'https://example.com/image.jpg',
        facilitador: 'Andres Calamaro',
        id: '1'
      },
      {
        _id: '2',
        nombre: 'Sparky',
        especie: 'Perro',
        raza: 'Husky',
        edad: 1,
        estado: 'Adoptado',
        img_ref: 'https://example.com/husky.jpg',
        facilitador: 'Jose Maria',
        id: '2'
      }
    ];

    jest.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => apiData });

    const result = await mascotaService.obtenerMascotas();
    expect(Array.isArray(result)).toBe(true);

    const requiredKeys = ['_id', 'nombre', 'especie', 'raza', 'edad', 'estado', 'img_ref', 'facilitador', 'id'];
    result.forEach(item => {
      requiredKeys.forEach(k => expect(item).toHaveProperty(k));
    });
  });
});

describe("obtenerDetalleMascotaPorId", () => {
  afterEach(() => jest.restoreAllMocks());
  let mascotaService;
  let mascotaRepository;
  let validarConexion;

  beforeEach(() => {
    setupBrowserGlobals();

    validarConexion = new ValidarConexion();
    mascotaRepository = new MascotaRepository();
    mascotaService = new MascotaService(mascotaRepository, validarConexion);

    // default fetch: health ok and return empty object for detalle
    jest.spyOn(globalThis, 'fetch').mockImplementation(
      createFetchMock({ healthOk: true, mascotasResponse: { ok: true, status: 200, json: async () => ({}) } })
    );
  });

  test("TC1 - lanza error con mensaje cuando no hay conexión a internet",  async () => {
    mockInternetConnection(false);
    await expect(mascotaService.obtenerDetalleMascotaPorId()).rejects.toThrow('Revise su conexión a internet.');
  });

  test('TC2 - lanza error con código HTTP cuando la respuesta no es ok (no se pudo conectar a Backend)', async () => {
      jest.spyOn(globalThis, 'fetch').mockImplementation(
        createFetchMock({ healthOk: true, mascotasResponse: { ok: false, status: 500, json: async () => { throw new Error('HTTP 500'); } } })
      );
      // pasar un id para que la función realice la llamada fetch por id
      await expect(mascotaService.obtenerDetalleMascotaPorId('some-id')).rejects.toThrow('HTTP 500');
  });

  test("TC3 - éxito, se establece conexión a internet y al Backend", async () => {
    const apiItem = {
      id: '3',
      nombre: 'Juanito',
      especie: 'Perro',
      raza: 'bulldog',
      edad: 3,
      estado: 'Disponible',
      img_ref: 'https://example.com/image.jpg',
      facilitador: 'Andres Calamaro'
    };
    jest.spyOn(globalThis, 'fetch').mockImplementation(
      createFetchMock({ healthOk: true, mascotasResponse: { ok: true, status: 200, json: async () => apiItem } })
    );
    const result = await mascotaService.obtenerDetalleMascotaPorId(apiItem.id);
    const requiredKeys = ['id','nombre','especie','raza','edad','estado','img_ref','facilitador','id'];
    
    requiredKeys.forEach(k => expect(result).toHaveProperty(k));  
  });
});
