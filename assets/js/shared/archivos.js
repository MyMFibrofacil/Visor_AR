/** Lectura compartida de configuraciones del sitio con errores explícitos. */
export async function leerJson(url) {
  const respuesta = await fetch(url);
  if (!respuesta.ok) throw new Error(`No se pudo leer ${url}: HTTP ${respuesta.status}`);
  return respuesta.json();
}
