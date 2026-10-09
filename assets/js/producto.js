/** Entrada de cada página de producto: carga configuración e inicia el visor. */
import '../vendor/model-viewer.min.js';
import { cargarVistaProducto } from './vista-producto.js?v=20261009-prevent-pull-refresh';
import { evitarRecargaPorTiron } from './evitar-recarga-por-tiron.js';
import { iniciarControles } from './controles-visor.js';
import { leerJson } from './shared/archivos.js';
import { iniciarMovimientoProducto } from './movimiento-producto.js';
import { iniciarMovimientosProducto } from './movimientos-producto.js';
import { iniciarPresentacionesProducto } from './presentaciones-producto.js';
import { iniciarMovimientoSillasMontessori } from './movimiento-sillas-montessori.js?v=20261009-ar-base';

try {
  const config = await leerJson(new URL('producto.json', location.href));
  const modelo = cargarVistaProducto(config);
  if (config.movimiento || config.movimientos?.length || config.movimiento_sillas) {
    evitarRecargaPorTiron();
  }
  // Se asigna después de registrar los eventos, incluso si el modelo está en caché.
  if (config.movimiento_sillas) {
    modelo.setAttribute('src', new URL(config.archivos.glb, location.href).href);
  } else if (!iniciarPresentacionesProducto(modelo, config.presentaciones)) {
    modelo.setAttribute('src', new URL(config.archivos.glb, location.href).href);
  }
  const tieneMovimiento = config.movimiento || config.movimientos?.length || config.movimiento_sillas;
  const nombresAR = config.archivos_ar || (tieneMovimiento && {
    glb: 'modelo-ar.glb', usdz: 'modelo-ar.usdz',
  });
  const archivosAR = nombresAR && {
    glb: new URL(nombresAR.glb, location.href).href,
    usdz: new URL(nombresAR.usdz, location.href).href,
  };
  iniciarControles(modelo, config.camara, config.apariencia, archivosAR);
  if (config.movimiento) iniciarMovimientoProducto(modelo, config.movimiento);
  if (config.movimientos) iniciarMovimientosProducto(modelo, config.movimientos);
  if (config.movimiento_sillas) {
    iniciarMovimientoSillasMontessori(modelo, config.movimiento_sillas, config.medidas_mm);
  }
} catch (error) {
  console.error('No se pudo iniciar el producto:', error);
  document.querySelector('#nota-producto').textContent = 'No se pudo cargar el producto. Recargá la página para intentar otra vez.';
}
