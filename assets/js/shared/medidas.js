/** Muestra las medidas del modelo en centímetros en la ficha de producto. */
export function mostrarMedidas(medidasMm) {
  for (const [clave, valor] of Object.entries(medidasMm)) {
    const centimetros = valor / 10;
    const medida = Number.isInteger(centimetros) ? centimetros : centimetros.toFixed(1).replace('.', ',');
    for (const elemento of document.querySelectorAll(`[data-medida="${clave}"]`)) {
      elemento.textContent = `${medida} cm`;
    }
  }
}
