/**
 * @jest-environment jsdom
 */

import SolicitudAdopcion from '../domain/SolicitudAdopcion.js';
import Adoptante from '../domain/Adoptante.js'; 
import Mascota from '../domain/Mascota.js';
import SolicitudAdopcionService from '../services/SolicitudAdopcionService.js';
import SolicitudAdopcionRepository from '../infraestructure/SolicitudAdopcionRepository.js';
import ValidarConexion from '../infraestructure/ValidarConexion.js';

describe('SolicitudAdopcion - EnviarSolicitud', () => {
	let solicitudAdopcionService;
	const mockInternetConnection = (status) => {
        Object.defineProperty(navigator, 'onLine', {
            value: status,
            configurable: true
        });
    };
	beforeEach(() => {
		solicitudAdopcionService = new SolicitudAdopcionService(new SolicitudAdopcionRepository(), new ValidarConexion());

		// Mock global.fetch for health-check and POST /api/solicitudes
		jest.spyOn(globalThis, 'fetch').mockImplementation(async (url, opts) => {
			const u = String(url);
			if (u === 'http://localhost:3001' || u === 'https://ingsoftadoptme.onrender.com') {
				return { ok: true, status: 200, json: async () => ({ status: 'ok' }) };
			}
			if (u.includes('/api/solicitudes') && opts && opts.method === 'POST') {
				// simulate backend validation error for invalid mascotaId
				return { ok: false, status: 400, json: async () => ({ message: 'mascotaId inválido' }) };
			}
			// fallback
			return { ok: true, status: 200, json: async () => ({}) };
		});
	});

	beforeAll(() => {
        globalThis.alert = jest.fn(); 
    });

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test('EnviarSolicitud debe fallar cuando no hay conexión a internet', async () => {
		mockInternetConnection(false);
		const data = {
			mascotaId: "6925071aa83df10a4b76900c",
			adoptanteNombre: "Juan Pérez"
		}
		await expect(solicitudAdopcionService.createSolicitud(data.mascotaId, data.adoptanteNombre)).rejects.toThrow('Revise su conexión a internet.');
	});

	test('EnviarSolicitud debe fallar cuando id no existe', async () => {
		mockInternetConnection(true);
		const data = {
			mascotaId: "id-inexistente",
			adoptanteNombre: "Juan Pérez"
		}
		await expect(solicitudAdopcionService.createSolicitud(data.mascotaId, data.adoptanteNombre)).rejects.toThrow('mascotaId inválido');
	});

	test('EnviarSolicitud debe construir una solicitud con adoptante, mascota, fecha y estado', async () => {
		mockInternetConnection(true);
		const data = { mascotaId: '6925071aa83df10a4b76900c', adoptanteNombre: 'Juan Pérez' };

		// mock fetch: health-check to API_URL and POST /api/solicitudes
		jest.spyOn(globalThis, 'fetch').mockImplementation(async (url, opts) => {
			const u = String(url);
			if (u === 'http://localhost:3001' || u === 'https://ingsoftadoptme.onrender.com') {
				return { ok: true, status: 200, json: async () => ({ status: 'ok' }) };
			}
			if (u.includes('/api/solicitudes') && opts && opts.method === 'POST') {
				return {
					ok: true,
					status: 201,
					json: async () => ({
						mascotaId: data.mascotaId,
						adoptanteNombre: data.adoptanteNombre,
						estado: 'Disponible', //mascota de pruebas que siempre se matiene disponible
						fechaSolicitud: new Date().toISOString(),
						id: 'generated-id-123'
					})
				};
			}
			// fallback
			return { ok: true, status: 200, json: async () => ({}) };
		});

		const resultado = await solicitudAdopcionService.createSolicitud(data.mascotaId, data.adoptanteNombre);

		expect(resultado).toBeDefined();
		expect(resultado.adoptante).toBeDefined();
		expect(resultado.adoptante.nombre).toBe(data.adoptanteNombre);
		expect(resultado.mascota).toBeDefined();
		expect(resultado.mascota.id).toBe(data.mascotaId);
		expect(resultado.estado).toBe('Disponible');
		expect(resultado.fechaSolicitud).toBeDefined();
	});


	
});

describe('SolicitudAdopcion - EnviarSolicitud', () => {
	test('EnviarSolicitud NO debe construir una solicitud porque la mascota no está disponible', () => {
		const adoptante = new Adoptante({
			nombre: 'Juan Pérez',
			cuestionario: {
				responsabilidad: 'Porque quiero compañía y cuidar de un animal',
				ambiente: 'grande',
				Problemas_de_salud: 'No',
					ninos: 'Si',
				otras_mascotas: 'No',
				economia: 500,
			},
			contacto: {
				email: 'juan.perez@example.com',
				telefono: '555-1234'
			}
		});

		const mascota = new Mascota({
			nombre: 'Luna',
			especie: 'Perro',
			raza: 'Labrador',
			sexo: 'Hembra',
			edad: 2,
			estado: 'en proceso'
		});

		expect(() => new SolicitudAdopcion(adoptante, mascota)).toThrowError('La mascota no está disponible para adopción');
	});
});