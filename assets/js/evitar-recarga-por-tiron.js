/** Evita que el gesto de tirar hacia abajo recargue una ficha móvil con movimiento. */
export function evitarRecargaPorTiron() {
  let ultimaPosicionY = null;

  document.addEventListener('touchstart', evento => {
    if (evento.touches.length !== 1) {
      ultimaPosicionY = null;
      return;
    }
    ultimaPosicionY = evento.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchmove', evento => {
    if (ultimaPosicionY === null || evento.touches.length !== 1 ||
        !document.documentElement.classList.contains('pagina-con-movimiento') ||
        !window.matchMedia('(max-width: 767px)').matches) return;

    const objetivo = evento.target instanceof Element ? evento.target : null;
    if (objetivo?.closest('input, select, textarea, button, a, [role="slider"]')) return;

    const posicionY = evento.touches[0].clientY;
    const gestoHaciaAbajo = posicionY > ultimaPosicionY;
    ultimaPosicionY = posicionY;
    const desplazamiento = Math.max(
      window.scrollY,
      document.documentElement.scrollTop,
      document.body.scrollTop,
    );

    if (gestoHaciaAbajo && desplazamiento <= 1) evento.preventDefault();
  }, { passive: false });

  document.addEventListener('touchend', () => { ultimaPosicionY = null; }, { passive: true });
  document.addEventListener('touchcancel', () => { ultimaPosicionY = null; }, { passive: true });
}
