/** Genera el sitio publicable copiando Ãºnicamente archivos utilizados en la web. */
import { cp, mkdir, rm } from 'node:fs/promises';
const destino = new URL('../dist/', import.meta.url);
await rm(destino, { recursive: true, force: true });
await mkdir(destino, { recursive: true });
for (const ruta of ['index.html', 'assets', 'productos']) {
  await cp(new URL(`../${ruta}`, import.meta.url), new URL(ruta, destino), { recursive: true });
}
console.log('Sitio generado en dist.');
