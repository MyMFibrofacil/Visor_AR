/** Permite desplazar cada silla del combo Montessori de forma independiente. */
import { mostrarMedidas } from './shared/medidas.js';

const SILLAS = {
  izquierda: { animacion: 'Silla izquierda' },
  derecha: { animacion: 'Silla derecha' },
};

export function iniciarMovimientoSillasMontessori(modelo, configuracion, medidasBase) {
  const selector = document.querySelector('#selector-silla-montessori');
  const barra = document.querySelector('#avance-silla-montessori');
  const salida = document.querySelector('#valor-silla-montessori');
  const descripcion = document.querySelector('#descripcion-silla-montessori');
  const posiciones = { izquierda: 0, derecha: 0 };
  const duracion = configuracion.duracion_segundos || 1;

  function actualizarControl() {
    const id = selector.value;
    const valor = posiciones[id];
    barra.value = String(Math.round(valor * 100));
    salida.textContent = valor === 0 ? 'Adentro' : valor === 1 ? 'Afuera' : `${Math.round(valor * 100)}% afuera`;
    descripcion.textContent = `${id === 'izquierda' ? 'Silla izquierda' : 'Silla derecha'}: movela sin cambiar la posición de la otra silla.`;
  }

  function aplicarRecorridos() {
    const id = selector.value;
    const otroId = id === 'izquierda' ? 'derecha' : 'izquierda';
    const animacion = SILLAS[id].animacion;
    const animacionOtra = SILLAS[otroId].animacion;
    if (!modelo.loaded || !modelo.availableAnimations.includes(animacion) ||
        !modelo.availableAnimations.includes(animacionOtra)) return;

    modelo.pause();
    if (modelo.animationName !== animacion) modelo.animationName = animacion;
    if (modelo.appendedAnimations.includes(animacionOtra)) {
      modelo.detachAnimation(animacionOtra, { fade: false });
    }
    modelo.pause();
    modelo.currentTime = posiciones[id] * duracion;
    modelo.appendAnimation(animacionOtra, {
      time: posiciones[otroId] * duracion,
      timeScale: 0,
      repetitions: 1,
      fade: 0,
    });
    modelo.pause();
    mostrarMedidas({ ancho: medidasBase.ancho + configuracion.desplazamiento_maximo_metros *
      1000 * (posiciones.izquierda + posiciones.derecha) });
  }

  function iniciarAlCargar() {
    const faltante = Object.values(SILLAS).find(({ animacion }) =>
      !modelo.availableAnimations.includes(animacion));
    if (faltante) {
      descripcion.textContent = 'El modelo no contiene los movimientos de las dos sillas.';
      selector.disabled = true;
      barra.disabled = true;
      return;
    }
    selector.disabled = false;
    barra.disabled = false;
    actualizarControl();
    aplicarRecorridos();
  }

  selector.disabled = true;
  barra.disabled = true;
  selector.addEventListener('change', () => {
    actualizarControl();
    aplicarRecorridos();
  });
  barra.addEventListener('input', () => {
    posiciones[selector.value] = Number(barra.value) / 100;
    aplicarRecorridos();
    actualizarControl();
    const distancia = Math.max(posiciones.izquierda, posiciones.derecha);
    modelo.cameraOrbit = `35deg 65deg ${(2.1 + 0.9 * distancia).toFixed(2)}m`;
  });
  modelo.addEventListener('load', iniciarAlCargar);
  if (modelo.loaded) iniciarAlCargar();
}
