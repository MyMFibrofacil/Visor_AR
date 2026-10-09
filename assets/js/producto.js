/** Entrada de cada página de producto: carga configuración e inicia el visor. */
import '../vendor/model-viewer.min.js';
import { cargarVistaProducto } from './vista-producto.js';
import { iniciarControles } from './controles-visor.js';
import { leerJson } from './shared/archivos.js';

try {
  const config = await leerJson(new URL('producto.json', location.href));
  const modelo = cargarVistaProducto(config);
  iniciarControles(modelo, config.camara, config.apariencia);
  // Se asigna después de registrar los eventos, incluso si el modelo está en caché.
  modelo.src = new URL(config.archivos.glb, location.href).href;
} catch (error) {
  console.error('No se pudo iniciar el producto:', error);
  document.querySelector('#nota-producto').textContent = 'No se pudo cargar el producto. Recargá la página para intentar otra vez.';
}
