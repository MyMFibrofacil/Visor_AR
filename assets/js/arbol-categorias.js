/** Presenta categorías AR con casillas, cantidades y subcategorías desplegables. */
import { obtenerOpciones } from './filtros-catalogo.js';

function crearCasilla(opcion) {
  const etiqueta = document.createElement('label');
  etiqueta.className = 'opcion-categoria';
  const casilla = document.createElement('input');
  casilla.type = 'checkbox';
  casilla.setAttribute('aria-controls', 'catalogo');
  const texto = document.createElement('span');
  texto.textContent = `${opcion.etiqueta} (${opcion.cantidad})`;
  etiqueta.append(casilla, texto);
  return { etiqueta, casilla };
}

/** Monta el árbol y expone sus ramas seleccionadas al coordinador del catálogo. */
export function montarArbolCategorias(contenedor, productos, botonLimpiar, alCambiar) {
  const grupos = [];
  contenedor.replaceChildren();
  const notificar = () => {
    botonLimpiar.disabled = !grupos.some((grupo) => grupo.padre.checked || grupo.padre.indeterminate);
    alCambiar();
  };
  for (const categoria of obtenerOpciones(productos, 'categoria')) {
    const grupo = document.createElement('div');
    grupo.className = 'grupo-categoria';
    const fila = document.createElement('div');
    fila.className = 'fila-categoria';
    const padre = crearCasilla(categoria);
    fila.append(padre.etiqueta);
    const hijos = [];
    const opciones = obtenerOpciones(productos, 'subcategoria', categoria.valor);
    if (opciones.length) {
      const lista = document.createElement('div');
      lista.className = 'subcategorias';
      lista.id = `subcategorias-${grupos.length}`;
      const desplegar = document.createElement('button');
      desplegar.type = 'button';
      desplegar.className = 'desplegar-categoria';
      desplegar.textContent = '−';
      desplegar.setAttribute('aria-label', `Subcategorías de ${categoria.etiqueta}`);
      desplegar.setAttribute('aria-expanded', 'true');
      desplegar.setAttribute('aria-controls', lista.id);
      desplegar.addEventListener('click', () => {
        lista.hidden = !lista.hidden;
        desplegar.textContent = lista.hidden ? '+' : '−';
        desplegar.setAttribute('aria-expanded', String(!lista.hidden));
      });
      fila.append(desplegar);
      for (const opcion of opciones) {
        const hijo = crearCasilla(opcion);
        hijos.push({ ...opcion, casilla: hijo.casilla });
        lista.append(hijo.etiqueta);
        hijo.casilla.addEventListener('change', () => {
          const seleccionados = hijos.filter((item) => item.casilla.checked);
          padre.casilla.checked = seleccionados.reduce((total, item) => total + item.cantidad, 0) === categoria.cantidad;
          padre.casilla.indeterminate = seleccionados.length > 0 && !padre.casilla.checked;
          notificar();
        });
      }
      grupo.append(fila, lista);
    } else grupo.append(fila);
    padre.casilla.addEventListener('change', () => {
      padre.casilla.indeterminate = false;
      hijos.forEach((hijo) => { hijo.casilla.checked = padre.casilla.checked; });
      notificar();
    });
    grupos.push({ valor: categoria.valor, padre: padre.casilla, hijos });
    contenedor.append(grupo);
  }
  botonLimpiar.addEventListener('click', () => {
    grupos.forEach(({ padre, hijos }) => {
      padre.checked = false;
      padre.indeterminate = false;
      hijos.forEach((hijo) => { hijo.casilla.checked = false; });
    });
    notificar();
  });
  return {
    obtenerSeleccion: () => grupos.flatMap(({ valor, padre, hijos }) => padre.checked
      ? [{ categoria: valor }]
      : hijos.filter((hijo) => hijo.casilla.checked).map((hijo) => ({ categoria: valor, subcategoria: hijo.valor }))),
  };
}
