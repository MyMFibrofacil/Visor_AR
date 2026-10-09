/** Permite seleccionar una animación independiente y recorrerla con una barra. */
export function iniciarMovimientosProducto(modelo, movimientos) {
  const selector = document.querySelector('#selector-movimiento');
  const barra = document.querySelector('#avance-movimiento');
  const salida = document.querySelector('#valor-movimiento');
  const descripcion = document.querySelector('#descripcion-movimiento');
  const inicio = document.querySelector('#inicio-movimiento');
  const fin = document.querySelector('#fin-movimiento');
  let movimientoActivo = null;

  for (const movimiento of movimientos) {
    const opcion = document.createElement('option');
    opcion.value = movimiento.nombre_animacion;
    opcion.textContent = movimiento.nombre_animacion;
    selector.append(opcion);
  }

  function mostrarRecorrido(valor) {
    const proporcion = Number(valor) / 100;
    modelo.pause();
    modelo.currentTime = proporcion * movimientoActivo.duracion_segundos;
    salida.textContent = `${Math.round(proporcion * 100)}%`;
  }

  function seleccionarMovimiento() {
    movimientoActivo = movimientos.find(item => item.nombre_animacion === selector.value);
    if (!movimientoActivo || !modelo.loaded) return;
    if (!modelo.availableAnimations.includes(movimientoActivo.nombre_animacion)) {
      selector.disabled = true;
      barra.disabled = true;
      descripcion.textContent = 'Movimiento no disponible en este modelo.';
      return;
    }
    modelo.pause();
    modelo.animationName = movimientoActivo.nombre_animacion;
    descripcion.textContent = movimientoActivo.descripcion;
    inicio.textContent = movimientoActivo.inicio;
    fin.textContent = movimientoActivo.fin;
    barra.value = '0';
    mostrarRecorrido(0);
  }

  selector.addEventListener('change', seleccionarMovimiento);
  barra.addEventListener('input', () => {
    if (movimientoActivo) mostrarRecorrido(barra.value);
  });
  function iniciarAlCargar() {
    const seleccionado = movimientos.find(item => item.nombre_animacion === selector.value &&
      modelo.availableAnimations.includes(item.nombre_animacion));
    const primerMovimiento = seleccionado || movimientos.find(item =>
      modelo.availableAnimations.includes(item.nombre_animacion));
    if (primerMovimiento) {
      selector.disabled = false;
      barra.disabled = false;
      selector.value = primerMovimiento.nombre_animacion;
      seleccionarMovimiento();
    } else {
      selector.disabled = true;
      barra.disabled = true;
      descripcion.textContent = 'El modelo no contiene movimientos disponibles.';
    }
  }
  modelo.addEventListener('load', iniciarAlCargar);
  if (modelo.loaded) iniciarAlCargar();
}
