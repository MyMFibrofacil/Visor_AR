/** Inserta los datos reales en la ficha visual sin reconstruir su diseño. */
import { mostrarMedidas } from './shared/medidas.js';

export function cargarVistaProducto(config) {
  const modelo = document.querySelector('#modelo');
  const titulo = document.querySelector('h1');
  titulo.textContent = config.nombre;
  document.querySelector('#categoria-producto').textContent = `Línea ${config.categoria || 'Montessori'}`;
  if (config.ar_modos) modelo.setAttribute('ar-modes', config.ar_modos);
  if (config.movimiento) {
    document.querySelector('#control-movimiento').classList.remove('hidden');
    const selector = document.querySelector('#nivel-movimiento');
    selector.max = String(config.movimiento.desplazamientos_metros.length - 1);
    document.querySelector('#posicion-movimiento').textContent =
      `Nivel 1 de ${config.movimiento.desplazamientos_metros.length}`;
  }
  if (config.movimientos?.length) {
    document.querySelector('#control-movimiento').classList.remove('hidden');
    document.querySelector('#control-movimiento-individual').classList.add('hidden');
    document.querySelector('#control-movimiento-multiple').classList.remove('hidden');
  }
  if (config.movimiento_sillas) {
    document.querySelector('#control-movimiento-sillas').classList.remove('hidden');
    document.querySelector('#control-presentaciones').classList.add('hidden');
    document.querySelector('#control-movimiento').classList.add('hidden');
  }
  const codigo = document.querySelector('#codigo-producto');
  if (config.codigo) {
    codigo.textContent = `• Código ${config.codigo}`;
  } else {
    codigo.hidden = true;
  }
  document.querySelector('#nota-producto').textContent =
    `${config.apariencia} Para verlo en tu habitación, abrí esta página desde un celular compatible con realidad aumentada y usá el botón de AR.`;
  document.querySelector('#descripcion-producto').textContent =
    'Giralo para explorar sus detalles desde todos los ángulos.';
  mostrarMedidas(config.medidas_mm);
  modelo.setAttribute('alt', config.descripcion);
  modelo.setAttribute('poster', new URL(config.archivos.poster, location.href).href);
  if (!config.movimiento_sillas) {
    modelo.setAttribute('ios-src', new URL(config.archivos.usdz, location.href).href);
  }
  for (const [atributo, clave] of [
    ['camera-orbit', 'orbita_plantilla'], ['camera-target', 'objetivo'],
    ['field-of-view', 'campo'], ['min-camera-orbit', 'minimo'],
    ['max-camera-orbit', 'maximo'],
  ]) {
    const valor = atributo === 'camera-orbit'
      ? config.camara.orbita_plantilla || config.camara.orbita
      : config.camara[clave];
    if (valor) modelo.setAttribute(atributo, valor);
  }
  document.title = `${config.nombre} · Ver en tu espacio`;
  return modelo;
}
