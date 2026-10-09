# Visor de productos 3D y realidad aumentada

Sitio estático independiente, publicado en GitHub Pages. No requiere ChatGPT.

## Organización

```text
assets/
  img/logo.png         Marca compartida
  js/                  Vistas, controles, catálogo y utilidades compartidas
  vendor/              model-viewer 4.1.0 y su licencia
productos/
  catalogo.json        Lista de productos publicados
  torre-mesa/
    index.html         Entrada de la página
    producto.json      Nombre, medidas, cámara, archivos y conversión
    modelo.glb         Modelo web y Android
    modelo.usdz        Modelo iPhone/iPad
    modelo.png         Vista previa
    modelo-metadata.json  Procedencia y dimensiones
scripts/               Preparación del sitio y servidor local
tools/modelos/        Conversores compartidos OBJ → GLB/USDZ
docs/                 Guías de mantenimiento
```

El catálogo usa las plantillas de escritorio y móvil; la ficha de producto usa
la plantilla de pantalla de producto. Sus vistas y acciones están separadas en
`assets/js/`. La ficha oculta el botón de AR en escritorio y lo muestra en
celulares compatibles. El código del visor se comparte entre todos los productos. Los datos y modelos
individuales viven exclusivamente en `productos/<carpeta>/`.
Este repositorio contiene exclusivamente productos para el visor 3D y AR.
Los visores de armado se mantienen en su repositorio separado `Visor-3d`.

## Uso local

Requiere Node.js 22. No hay paquetes que instalar.

```sh
npm run dev
npm run build
```

El servidor local abre en http://127.0.0.1:8767. La publicación incluye solamente
`index.html`, `assets/` y `productos/`.
El flujo de GitHub Pages se ejecuta al enviar cambios a `main`.

Torre Mesa muestra el código `FC0003110001`, obtenido de `Productos Chatbot`
(Hoja 1, fila 69). El archivo `producto.json` y la planilla se actualizan por
separado; el sitio no consulta la planilla en tiempo real.

- Catálogo: https://mymfibrofacil.github.io/Visor_AR/
- Torre Mesa: https://mymfibrofacil.github.io/Visor_AR/productos/torre-mesa/

Ver [cómo agregar productos](docs/PRODUCTOS.md).

Procedimiento completo y formatos de exportación: [PROCEDIMIENTO_PRODUCTOS_AR.md](docs/PROCEDIMIENTO_PRODUCTOS_AR.md).

Ficha reutilizable para cada alta: [PLANTILLA_ENTREGA_PRODUCTO.md](docs/PLANTILLA_ENTREGA_PRODUCTO.md).
