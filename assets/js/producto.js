/** Entrada de cada página de producto: carga configuración e inicia el visor. */
import '../vendor/model-viewer.min.js';
import { cargarVistaProducto } from './vista-producto.js?v=20261009-sillas';
import { iniciarControles } from './controles-visor.js';
import { leerJson } from './shared/archivos.js';
import { iniciarMovimientoProducto } from './movimiento-producto.js';
import { iniciarMovimientosProducto } from './movimientos-producto.js';
import { iniciarPresentacionesProducto } from './presentaciones-producto.js';
import { iniciarMovimientoSillasMontessori } from './movimiento-sillas-montessori.js?v=20261009-sillas';

try {
  const config = await leerJson(new URL('producto.json', location.href));
  const modelo = cargarVistaProducto(config);
  iniciarControles(modelo, config.camara, config.apariencia);
  // Se asigna después de registrar los eventos, incluso si el modelo está en caché.
  if (config.movimiento_sillas) {
    modelo.src = new URL(config.archivos.glb, location.href).href;
  } else if (!iniciarPresentacionesProducto(modelo, config.presentaciones)) {
    modelo.src = new URL(config.archivos.glb, location.href).href;
  }
  if (config.movimiento) iniciarMovimientoProducto(modelo, config.movimiento);
  if (config.movimientos) iniciarMovimientosProducto(modelo, config.movimientos);
  if (config.movimiento_sillas) iniciarMovimientoSillasMontessori(modelo, config.movimiento_sillas);
} catch (error) {
  console.error('No se pudo iniciar el producto:', error);
  document.querySelector('#nota-producto').textContent = 'No se pudo cargar el producto. Recargá la página para intentar otra vez.';
}
