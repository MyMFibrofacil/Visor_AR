/** Obtiene opciones y filtra exclusivamente los productos del catálogo AR publicado. */
function normalizarTexto(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
}

/** Devuelve opciones únicas y sus cantidades dentro del catálogo AR. */
export function obtenerOpciones(productos, campo, categoria = '') {
  const opciones = new Map();
  for (const producto of productos) {
    if (categoria && normalizarTexto(producto.categoria) !== categoria) continue;
    const etiqueta = String(producto[campo] ?? '').trim();
    const valor = normalizarTexto(etiqueta);
    if (!valor) continue;
    if (!opciones.has(valor)) opciones.set(valor, { valor, etiqueta, cantidad: 0 });
    opciones.get(valor).cantidad += 1;
  }
  return [...opciones.values()]
    .sort((a, b) => a.etiqueta.localeCompare(b.etiqueta, 'es'));
}

/** Combina el nombre con varias ramas; sin ramas seleccionadas muestra todos. */
export function filtrarProductos(productos, { nombre = '', ramas = [] } = {}) {
  const consulta = normalizarTexto(nombre);
  return productos.filter((producto) => normalizarTexto(producto.nombre).includes(consulta)
    && (ramas.length === 0 || ramas.some(({ categoria, subcategoria }) =>
      normalizarTexto(producto.categoria) === categoria
      && (!subcategoria || normalizarTexto(producto.subcategoria) === subcategoria))));
}
