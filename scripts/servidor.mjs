/** Servidor local del sitio generado, sin dependencias adicionales. */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import './publicar.mjs';
const raiz = fileURLToPath(new URL('../dist/', import.meta.url));
const tipos = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.glb':'model/gltf-binary', '.usdz':'model/vnd.usdz+zip' };
createServer(async (req, res) => {
  try {
    let archivo = resolve(raiz, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (archivo !== resolve(raiz) && !archivo.startsWith(resolve(raiz) + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(archivo)).isDirectory()) archivo = resolve(archivo, 'index.html');
    const contenido = await readFile(archivo);
    res.writeHead(200, { 'Content-Type':tipos[extname(archivo)] || 'application/octet-stream' }).end(contenido);
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Error al servir archivo:', error);
    res.writeHead(error.code === 'ENOENT' ? 404 : 500).end('No se pudo abrir el archivo.');
  }
}).listen(8767, '127.0.0.1', () => console.log('Abrir http://127.0.0.1:8767'));
