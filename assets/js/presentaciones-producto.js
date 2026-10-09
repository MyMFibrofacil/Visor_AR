/** Permite elegir una presentación del producto antes de abrir AR. */
import { mostrarMedidas } from './shared/medidas.js';

export function iniciarPresentacionesProducto(modelo, presentaciones) {
  if (!Array.isArray(presentaciones) || presentaciones.length < 2) return false;
  const seccion = document.querySelector('#control-presentaciones');
  const opciones = document.querySelector('#opciones-presentaciones');
  const botones = presentaciones.map((presentacion, indice) => {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'min-h-11 rounded-lg px-3 py-2 font-button-text text-button-text border border-outline-variant text-on-surface hover:bg-surface-container-high';
    boton.textContent = presentacion.nombre;
    boton.addEventListener('click', () => seleccionar(indice));
    opciones.append(boton);
    return boton;
  });

  function seleccionar(indice) {
    const presentacion = presentaciones[indice];
    const archivos = presentacion.archivos;
    for (const [posicion, boton] of botones.entries()) {
      const activa = posicion === indice;
      boton.setAttribute('aria-pressed', String(activa));
      boton.classList.toggle('bg-primary', activa);
      boton.classList.toggle('text-on-primary', activa);
      boton.classList.toggle('text-on-surface', !activa);
      boton.classList.toggle('hover:bg-surface-container-high', !activa);
    }
    mostrarMedidas(presentacion.medidas_mm);
    modelo.setAttribute('alt', `${presentacion.nombre}: mesa y dos sillas Montessori`);
    modelo.setAttribute('poster', new URL(archivos.poster, location.href).href);
    modelo.setAttribute('ios-src', new URL(archivos.usdz, location.href).href);
    if (presentacion.orbita) modelo.setAttribute('camera-orbit', presentacion.orbita);
    modelo.src = new URL(archivos.glb, location.href).href;
  }

  seccion.classList.remove('hidden');
  seleccionar(0);
  return true;
}
