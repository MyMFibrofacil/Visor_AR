/** Conecta búsqueda, filtros y paneles de ambas versiones de la plantilla. */
import { normalizarTexto } from './shared/texto.js';

export function iniciarInteraccionesCatalogo(raiz, productos) {
  const buscar = raiz.querySelector('[id$="searchInput"]');
  const borrar = raiz.querySelector('[id$="clearSearchBtn"]');
  const restablecer = raiz.querySelector('[id$="resetFilters"]');
  const casillas = [...raiz.querySelectorAll('.subcat-filter')];
  const tarjetas = [...raiz.querySelectorAll('.product-card')];
  const contador = raiz.querySelector('[id$="productCount"]');
  const sinResultados = raiz.querySelector('[id$="noResults"]');

  function actualizar() {
    const consulta = normalizarTexto(buscar.value);
    const seleccionadas = new Set(casillas.filter((casilla) => casilla.checked).map((casilla) => casilla.value));
    let visibles = 0;
    for (const tarjeta of tarjetas) {
      const rama = `${tarjeta.dataset.category}\u0000${tarjeta.dataset.subcat}`;
      const visible = seleccionadas.has(rama) && tarjeta.dataset.title.includes(consulta);
      tarjeta.style.display = visible ? 'flex' : 'none';
      if (visible) visibles++;
    }
    contador.textContent = `${visibles} ${visibles === 1 ? 'PRODUCTO' : 'PRODUCTOS'}`;
    sinResultados.classList.toggle('hidden', visibles !== 0);
    const mensaje = sinResultados.querySelector('p');
    if (productos.length === 0) mensaje.textContent = 'Todavía no hay productos disponibles.';
    else mensaje.textContent = 'Probá con otro término o seleccioná más subcategorías.';
    borrar.classList.toggle('hidden', buscar.value.length === 0);
  }

  buscar.addEventListener('input', actualizar);
  borrar.addEventListener('click', () => {
    buscar.value = '';
    buscar.focus();
    actualizar();
  });
  restablecer.addEventListener('click', (evento) => {
    evento.stopPropagation();
    buscar.value = '';
    casillas.forEach((casilla) => { casilla.checked = true; });
    actualizar();
  });
  casillas.forEach((casilla) => casilla.addEventListener('change', actualizar));

  for (const boton of raiz.querySelectorAll('.category-header')) {
    const lista = boton.closest('.category-group').querySelector('.subcategory-list');
    const flecha = boton.querySelector('.category-chevron');
    boton.addEventListener('click', () => {
      const cerrado = lista.classList.toggle('hidden');
      boton.setAttribute('aria-expanded', String(!cerrado));
      flecha.style.transform = cerrado ? 'rotate(-90deg)' : 'rotate(0deg)';
    });
  }

  const alternar = raiz.querySelector('[id$="categoriesToggleBtn"]');
  if (alternar) {
    const lista = raiz.querySelector('[id$="categoryHierarchy"]');
    const flecha = raiz.querySelector('[id$="mainCategoryChevron"]');
    alternar.tabIndex = 0;
    alternar.setAttribute('role', 'button');
    alternar.setAttribute('aria-expanded', String(!lista.classList.contains('hidden')));
    const cambiar = () => {
      const cerrado = lista.classList.toggle('hidden');
      alternar.setAttribute('aria-expanded', String(!cerrado));
      flecha.style.transform = cerrado ? 'rotate(0deg)' : 'rotate(180deg)';
    };
    alternar.addEventListener('click', (evento) => {
      if (!restablecer.contains(evento.target)) cambiar();
    });
    alternar.addEventListener('keydown', (evento) => {
      if ((evento.key === 'Enter' || evento.key === ' ') && evento.target === alternar) {
        evento.preventDefault();
        cambiar();
      }
    });
  }
  actualizar();
}
