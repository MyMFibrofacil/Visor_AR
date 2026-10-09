/** Rellena las plantillas visuales del catálogo con los productos publicados. */
import { normalizarTexto } from './shared/texto.js';

const iconos = new Map([
  ['montessori', 'toys'],
  ['juego simbolico', 'smart_toy'],
  ['infanto juvenil', 'child_care'],
]);

function agruparProductos(productos) {
  const categorias = new Map();
  for (const producto of productos) {
    const nombre = producto.categoria?.trim() || 'Otros';
    const subcategoria = producto.subcategoria?.trim() || 'Otros';
    if (!categorias.has(nombre)) categorias.set(nombre, new Map());
    const ramas = categorias.get(nombre);
    if (!ramas.has(subcategoria)) ramas.set(subcategoria, []);
    ramas.get(subcategoria).push(producto);
  }
  return categorias;
}

/** Conserva las clases de la plantilla y modifica solo contenido y acciones. */
export function prepararCatalogo(raiz, productos) {
  const listaCategorias = raiz.querySelector('[id$="categoryHierarchy"]');
  const grilla = raiz.querySelector('[id$="productsGrid"]');
  const prototipoCategoria = listaCategorias.querySelector('template[data-category-template]').content.querySelector('.category-group').cloneNode(true);
  const prototipoTarjeta = grilla.querySelector('template[data-product-template]').content.querySelector('.product-card').cloneNode(true);
  const categorias = agruparProductos(productos);
  listaCategorias.replaceChildren();
  grilla.replaceChildren();

  for (const [nombre, ramas] of categorias) {
    const grupo = prototipoCategoria.cloneNode(true);
    const boton = grupo.querySelector('.category-header');
    const titulo = boton.querySelector('span.flex');
    const icono = titulo.querySelector('.material-symbols-outlined');
    const contador = boton.querySelector('.font-mono');
    const lista = grupo.querySelector('.subcategory-list');
    const prototipoRama = lista.querySelector('label').cloneNode(true);
    const total = [...ramas.values()].reduce((suma, elementos) => suma + elementos.length, 0);
    grupo.dataset.category = normalizarTexto(nombre);
    icono.textContent = iconos.get(normalizarTexto(nombre)) || 'category';
    titulo.lastChild.textContent = nombre;
    contador.textContent = String(total);
    boton.setAttribute('aria-expanded', String(!lista.classList.contains('hidden')));
    lista.replaceChildren();

    for (const [subcategoria] of ramas) {
      const etiqueta = prototipoRama.cloneNode(true);
      const texto = etiqueta.querySelector('span.text-sm');
      const casilla = etiqueta.querySelector('input');
      texto.lastChild.textContent = ` ${subcategoria}`;
      casilla.value = `${normalizarTexto(nombre)}\u0000${normalizarTexto(subcategoria)}`;
      casilla.checked = true;
      casilla.setAttribute('aria-label', `${nombre}: ${subcategoria}`);
      lista.append(etiqueta);
    }
    listaCategorias.append(grupo);
  }

  for (const producto of productos) {
    const tarjeta = prototipoTarjeta.cloneNode(true);
    const base = new URL(`productos/${encodeURIComponent(producto.carpeta)}/`, document.baseURI);
    const imagen = tarjeta.querySelector('img');
    const titulo = tarjeta.querySelector('h3');
    tarjeta.dataset.category = normalizarTexto(producto.categoria);
    tarjeta.dataset.subcat = normalizarTexto(producto.subcategoria);
    tarjeta.dataset.title = normalizarTexto(producto.nombre);
    tarjeta.style.display = 'flex';
    tarjeta.tabIndex = 0;
    tarjeta.setAttribute('role', 'link');
    tarjeta.setAttribute('aria-label', `Ver ${producto.nombre}`);
    imagen.src = new URL(producto.imagen, base).href;
    imagen.alt = producto.nombre;
    imagen.loading = 'lazy';
    imagen.classList.replace('object-cover', 'object-contain');
    titulo.textContent = producto.nombre;
    tarjeta.addEventListener('click', () => { location.href = base.href; });
    tarjeta.addEventListener('keydown', (evento) => {
      if (evento.key === 'Enter' || evento.key === ' ') {
        evento.preventDefault();
        location.href = base.href;
      }
    });
    grilla.append(tarjeta);
  }
  return { categorias: listaCategorias, grilla };
}
