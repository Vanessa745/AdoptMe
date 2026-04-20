import { inicializarEstadoMascota } from '../services/CambiarEstado.js';

describe('inicializarEstadoMascota (unidad DOM, sin API)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('no falla cuando no existen radios o contenedor de resultado', () => {
    expect(() => inicializarEstadoMascota('input[name="estado"]', '#resultado')).not.toThrow();
  });

  test('actualiza resultado al cambiar una opcion seleccionada', () => {
    document.body.innerHTML = `
      <input type="radio" name="estado" value="disponible" id="r1" />
      <input type="radio" name="estado" value="adoptado" id="r2" />
      <div id="resultado" style="display:none"></div>
    `;

    inicializarEstadoMascota('input[name="estado"]', '#resultado');

    const adoptado = document.getElementById('r2');
    const result = document.getElementById('resultado');

    adoptado.checked = true;
    adoptado.dispatchEvent(new Event('change'));

    expect(result.style.display).toBe('block');
    expect(result.textContent).toBe('La mascota ha sido marcada como adoptado.');
  });
});
