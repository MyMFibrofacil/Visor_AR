/** Entrada del catálogo: carga productos e inicia las dos vistas responsivas. */
import { leerJson } from './shared/archivos.js';
import { prepararCatalogo } from './vista-catalogo.js';
import { iniciarInteraccionesCatalogo } from './interacciones-catalogo.js';

try {
  const productos = await leerJson(new URL('../../productos/catalogo.json', import.meta.url));
  for (const raiz of document.querySelectorAll('.catalog-variant')) {
    prepararCatalogo(raiz, productos);
    iniciarInteraccionesCatalogo(raiz, productos);
  }
} catch (error) {
  console.error('No se pudo cargar el catálogo:', error);
  for (const raiz of document.querySelectorAll('.catalog-variant')) {
    raiz.querySelector('[id$="productsGrid"]').replaceChildren();
    const mensaje = raiz.querySelector('[id$="noResults"]');
    mensaje.querySelector('h4').textContent = 'No se pudo cargar el catálogo';
    mensaje.querySelector('p').textContent = 'Recargá la página para intentar otra vez.';
    mensaje.classList.remove('hidden');
    raiz.querySelector('[id$="productCount"]').textContent = '0 PRODUCTOS';
  }
}
