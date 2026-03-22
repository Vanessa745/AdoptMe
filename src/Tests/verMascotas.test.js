import Mascota from '../domain/Mascota.js';
import { MascotaService } from '../services/MascotaService.js';
import MascotaRepository from '../infraestructure/MascotaRepository.js';
import ValidarConexion from '../infraestructure/ValidarConexion.js';

// Helpers: provide browser-like globals and a conditional fetch mock so
// the real ValidarConexion methods can run inside Node/Jest.
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
// 3.1. Ver listado general de mascotas disponibles

// Como: Interesado/Adoptante/Ciudadano
// Quiero: poder ver el listado general de mascotas disponibles
// Para: ver todas las mascotas disponibles directamente.

// Criterios de confirmación:

// Si no hay mascotas disponibles, se debería mostrar el mensaje 
// "Lo siento por el momento no hay mascotas disponibles.".

// Cuando el ciudadano haga click en la pestaña "Adoptar" debería 
// mostrar el nombre, imagen y facilitador de todas las mascotas disponibles para adoptar.

// Si el ciudadano no cuenta con una conexión a internet estable al hacer click en la 
// pestaña "Adoptar", se mostrará el mensaje "Revise su conexión a internet.".


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

    // default fetch: health ok and API returns empty array for mascotas
    jest.spyOn(globalThis, 'fetch').mockImplementation(
      createFetchMock({ healthOk: true, mascotasResponse: { ok: true, status: 200, json: async () => [] } })
    );
  });

  it('retorna un mensaje cuando no hay conexión', async () => {
    // use the real ValidarConexion; simulate offline
    mockInternetConnection(false);
    await expect(mascotaService.obtenerMascotas()).rejects.toThrow('Revise su conexión a internet.');
  });

  it('devuelve un array vacío cuando la API responde con []', async () => {
    // default mock (set in beforeEach) returns [] for /api/mascotas
    await expect(mascotaService.obtenerMascotas()).rejects.toThrow('No hay mascotas disponibles.');
  });

  it('lanza error con código HTTP cuando la respuesta no es ok', async () => {
    jest.spyOn(globalThis, 'fetch').mockImplementation(
      createFetchMock({ healthOk: true, mascotasResponse: { ok: false, status: 500, json: async () => { throw new Error('HTTP 500'); } } })
    );
    await expect(mascotaService.obtenerMascotas()).rejects.toThrow('HTTP 500');
  });


  it('devuelve un array cuyos objetos contienen las claves esperadas', async () => {
    const apiData = [
      {
        _id: '6921d0e55bd8ce602b65311e',
        nombre: 'Juanito',
        especie: 'Perro',
        raza: 'bulldog',
        edad: 3,
        estado: 'Disponible',
        img_ref: 'https://example.com/image.jpg',
        facilitador: 'Andres Calamaro',
        id: '6921d0e55bd8ce602b65311e'
      },
      {
        _id: '6922195d6432e11c00316713',
        nombre: 'Sparky',
        especie: 'Perro',
        raza: 'Husky',
        edad: 1,
        estado: 'Adoptado',
        img_ref: 'https://example.com/husky.jpg',
        facilitador: 'Jose Maria',
        id: '6922195d6432e11c00316713'
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




// 3.3. Ver detalles completos de las mascotas

// Como: ciudadano/adoptante
// Quiero: poder ver detalles completos de la mascota
// Para: ver toda la información que necesito considerar para adoptar a la mascota.

// Criterios de confirmación:

// Cuando el ciudadano haga click en una mascota, se debería cargar la información completa y detallada 
// del mismo, como nombre, fotos, cartilla de vacunación, estado.

// Si el ciudadano no cuenta con una conexión de internet estable al hacer click en la mascota, se mostrará 
// el mensaje “Revise su conexión a internet.”.

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

  it("deberia mostrar 'Revise su conexión a internet.'",  async () => {
    mockInternetConnection(false);
    await expect(mascotaService.obtenerDetalleMascotaPorId()).rejects.toThrow('Revise su conexión a internet.');
  });
  it('lanza error con código HTTP cuando la respuesta no es ok', async () => {
      jest.spyOn(globalThis, 'fetch').mockImplementation(
        createFetchMock({ healthOk: true, mascotasResponse: { ok: false, status: 500, json: async () => { throw new Error('HTTP 500'); } } })
      );
      // pasar un id para que la función realice la llamada fetch por id
      await expect(mascotaService.obtenerDetalleMascotaPorId('some-id')).rejects.toThrow('HTTP 500');
  });
  it("deberia mostrar la información de la mascota por el id", async () => {
    const apiItem = {
      id: '6921d0e55bd8ce602b65311e',
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
  it('lanza error si no se proporciona id', async () => {
    await expect(mascotaService.obtenerDetalleMascotaPorId()).rejects.toThrow('id de mascota no proporcionado.');
  });
});

describe('ValidarConexion (unidad)', () => {
  afterEach(() => jest.restoreAllMocks());
  it('validarConexionBackend lanza cuando el health-check falla', async () => {
    setupBrowserGlobals();
    const validar = new ValidarConexion();
    // mock fetch so health-check returns ok:false
    jest.spyOn(globalThis, 'fetch').mockImplementation(createFetchMock({ healthOk: false }));
    await expect(validar.validarConexionBackend()).rejects.toThrow('Hubo un error con la conexion a nuestro servidor.');
  });
});