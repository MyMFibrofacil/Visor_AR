/** Controla posiciones discretas de una pieza animada en GLB/USDZ. */
export function iniciarMovimientoProducto(modelo, movimiento) {
  const selector = document.querySelector('#nivel-movimiento');
  const salida = document.querySelector('#posicion-movimiento');
  const cantidadNiveles = movimiento.desplazamientos_metros.length;
  const nombreAnimacion = movimiento.nombre_animacion;

  const actualizarNivel = () => {
    if (!modelo.availableAnimations.includes(nombreAnimacion)) {
      selector.disabled = true;
      salida.textContent = 'Movimiento no disponible';
      return;
    }
    modelo.animationName = nombreAnimacion;
    modelo.pause();
    modelo.currentTime = Number(selector.value) * movimiento.segundos_por_nivel;
    salida.textContent = `Nivel ${Number(selector.value) + 1} de ${cantidadNiveles}`;
  };

  modelo.addEventListener('load', actualizarNivel);
  selector.addEventListener('input', actualizarNivel);
  if (modelo.loaded) actualizarNivel();
}
