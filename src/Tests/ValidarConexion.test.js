import ValidarConexion from "../infraestructure/ValidarConexion";

function setupBrowserGlobals() {
  if (globalThis.window === undefined) {
    globalThis.window = { location: { hostname: "localhost", search: "" } };
  } else {
    globalThis.window.location =
      globalThis.window.location || { hostname: "localhost", search: "" };
  }

  if (globalThis.navigator === undefined) {
    globalThis.navigator = {};
  }

  Object.defineProperty(globalThis.navigator, "onLine", {
    value: true,
    configurable: true,
    writable: true,
  });
}

const mockInternetConnection = (status) => {
  Object.defineProperty(globalThis.navigator, "onLine", {
    value: status,
    configurable: true,
    writable: true,
  });
};

function createFetchMock({
  healthOk = true,
} = {}) {
  return jest.fn(async (url) => {
    const u = String(url);

    if (
      u === "http://localhost:3001" ||
      u === "https://ingsoftadoptme.onrender.com"
    ) {
      if (healthOk) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ status: "ok" }),
        };
      }

      return {
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("HTTP 500");
        },
      };
    }

    return {
      ok: true,
      status: 200,
      json: async () => ({}),
    };
  });
}

describe("ValidarConexion", () => {
  let validarConexion;

  beforeEach(() => {
    setupBrowserGlobals();
    validarConexion = new ValidarConexion();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (global.fetch) {
      global.fetch.mockClear();
    }
  });

  describe("validarConexionInternet", () => {
    test("TC1 - lanza error cuando !navigator.online", () => {
      mockInternetConnection(false);

      expect(() => validarConexion.validarConexionInternet()).toThrow(
        "Revise su conexión a internet."
      );
    });

    test("TC2 - no lanza error cuando navigator.online", () => {
      mockInternetConnection(true);

      expect(() => validarConexion.validarConexionInternet()).not.toThrow();
    });
  });

  describe("validarConexionBackend", () => {
    test("TC1 - lanza error cuando _hostname === 'localhost' y cuando !respuesta.ok", async () => {
      globalThis.window.location.hostname = "localhost";
      global.fetch = createFetchMock({ healthOk: false });

      await expect(validarConexion.validarConexionBackend()).rejects.toThrow(
        "Hubo un error con la conexion a nuestro servidor."
      );
    });

    test("TC2 - no lanza error cuando _hostname === 'localhost' y cuando respuesta.ok", async () => {
      globalThis.window.location.hostname = "localhost";
      global.fetch = createFetchMock({ healthOk: true });

      await expect(validarConexion.validarConexionBackend()).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:3001");
    });

    // test("TC3 - lanza error cuando _hostname != 'localhost' y cuando !respuesta.ok", async () => {
    //   delete globalThis.window.location; 
    //   globalThis.window.location = { hostname: "midominio.com" };
    //   global.fetch = createFetchMock({ healthOk: false });

    //   await expect(validarConexion.validarConexionBackend()).rejects.toThrow(
    //     "Hubo un error con la conexion a nuestro servidor."
    //   );
    // });

    // test("TC4 - no lanza error cuando _hostname != 'localhost' y cuando respuesta.ok", async () => {
    //   delete globalThis.window.location; 
    //   globalThis.window.location = { hostname: "midominio.com" };
    //   global.fetch = createFetchMock({ healthOk: true });

    //   await expect(validarConexion.validarConexionBackend()).resolves.toBeUndefined();
    //   expect(global.fetch).toHaveBeenCalledWith("https://ingsoftadoptme.onrender.com");
    // });
  });
});