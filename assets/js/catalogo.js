/** Lista los productos publicados; agregar productos requiere editar solo el catálogo. */
import { leerJson } from './shared/archivos.js';
const contenedor = document.querySelector('#catalogo');
try {
  const productos = await leerJson(new URL('../../productos/catalogo.json', import.meta.url));
  contenedor.replaceChildren();
  for (const producto of productos) {
    const enlace = document.createElement('a');
    const base = new URL(`../../productos/${producto.carpeta}/`, import.meta.url);
    enlace.href = base.href;
    const imagen = document.createElement('img');
    imagen.src = new URL(producto.imagen, base).href;
    imagen.alt = producto.nombre;
    imagen.loading = 'lazy';
    const titulo = document.createElement('h2');
    titulo.textContent = producto.nombre;
    const texto = document.createElement('span');
    texto.textContent = 'Ver en 3D y en mi espacio';
    enlace.append(imagen, titulo, texto);
    contenedor.append(enlace);
  }
} catch (error) {
  console.error('No se pudo cargar el catálogo:', error);
  contenedor.textContent = 'No se pudo cargar el catálogo. Recargá la página para intentar otra vez.';
}
