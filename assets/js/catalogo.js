/** Lista los productos publicados; agregar productos requiere editar solo el catálogo. */
import { leerJson } from './shared/archivos.js';
import { filtrarProductos } from './filtros-catalogo.js';
import { montarArbolCategorias } from './arbol-categorias.js';
const contenedor = document.querySelector('#catalogo');
const buscador = document.querySelector('#buscar-productos');
const estado = document.querySelector('#estado-catalogo');
const categorias = document.querySelector('#categorias-productos');
const limpiarCategorias = document.querySelector('#limpiar-categorias');

try {
  const productos = await leerJson(new URL('../../productos/catalogo.json', import.meta.url));
  const tarjetas = new Map(productos.map((producto) => {
    const enlace = document.createElement('a');
    const base = new URL(`../../productos/${producto.carpeta}/`, import.meta.url);
    enlace.href = base.href;
    const imagen = document.createElement('img');
    imagen.src = new URL(producto.imagen, base).href;
    imagen.alt = producto.nombre;
    imagen.loading = 'lazy';
    const titulo = document.createElement('h2');
    titulo.textContent = producto.nombre;
    enlace.append(imagen, titulo);
    return [producto, enlace];
  }));

  const arbol = montarArbolCategorias(categorias, productos, limpiarCategorias, actualizarCatalogo);

  function actualizarCatalogo() {
    const visibles = filtrarProductos(productos, {
      nombre: buscador.value, ramas: arbol.obtenerSeleccion(),
    });
    contenedor.replaceChildren(...visibles.map((producto) => tarjetas.get(producto)));
    estado.textContent = visibles.length > 0 ? '' : productos.length === 0
      ? 'Todavía no hay productos disponibles.'
      : 'No se encontraron productos con los filtros seleccionados.';
    estado.hidden = visibles.length > 0;
  }

  buscador.addEventListener('input', actualizarCatalogo);
  buscador.disabled = false;
  actualizarCatalogo();
} catch (error) {
  console.error('No se pudo cargar el catálogo:', error);
  estado.hidden = false;
  estado.textContent = 'No se pudo cargar el catálogo. Recargá la página para intentar otra vez.';
}
