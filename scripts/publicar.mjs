/** Genera el sitio y agrega la pantalla común a cada producto publicado. */
import { cp, mkdir, readFile, rm } from 'node:fs/promises';
const destino = new URL('../dist/', import.meta.url);
await rm(destino, { recursive: true, force: true });
await mkdir(destino, { recursive: true });
for (const ruta of ['index.html', 'assets', 'datos']) {
  await cp(new URL(`../${ruta}`, import.meta.url), new URL(ruta, destino), { recursive: true });
}
const catalogo = JSON.parse(await readFile(new URL('../datos/catalogo.json', import.meta.url), 'utf8'));
for (const producto of catalogo) {
  const carpeta = producto.carpeta;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(carpeta)) {
    throw new Error(`Carpeta de producto inválida: ${carpeta}`);
  }
  const origenProducto = new URL(`../productos/${carpeta}/`, import.meta.url);
  const destinoProducto = new URL(`productos/${carpeta}/`, destino);
  await cp(origenProducto, destinoProducto, { recursive: true });
  await cp(new URL('../pantallas/producto.html', import.meta.url), new URL('index.html', destinoProducto));
}
console.log('Sitio generado en dist.');
