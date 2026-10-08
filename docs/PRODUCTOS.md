# Agregar y mantener productos

Guía rápida. Para la recopilación del proceso, formatos de entrega y verificaciones,
ver [el procedimiento completo](PROCEDIMIENTO_PRODUCTOS_AR.md) y
[la ficha de entrega](PLANTILLA_ENTREGA_PRODUCTO.md).

1. Crear `productos/<codigo-o-nombre>/`. Usar minúsculas y guiones, sin espacios.
2. Copiar el pequeño `index.html` de Torre Mesa: contiene la entrada al visor común.
   Actualizar título y descripción iniciales para el producto nuevo.
3. Crear `producto.json` usando Torre Mesa como referencia. Configurar nombre,
   descripción, medidas reales en mm, apariencia, archivos y cámara inicial.
4. Colocar GLB, USDZ y vista previa en esa misma carpeta. Mantener escala real
   en metros, eje Y vertical y apoyo en Y=0.
5. Agregar una entrada en `productos/catalogo.json` con carpeta, nombre e imagen.
6. Ejecutar `npm run dev`, revisar catálogo, carga, medidas y botón de vista inicial.
   Probar AR con cámara en Android e iPhone compatibles antes de darlo por validado.
7. Enviar los cambios a `main` y verificar la publicación de GitHub Pages.

No copiar JavaScript, CSS, biblioteca ni logo a cada producto. Se comparten desde
`assets/`. Los nombres de archivos se resuelven relativos a la página de cada producto.
Las medidas visibles se redondean, conservando los valores precisos en configuración.

## Conversión opcional desde OBJ

Los conversores están en `tools/modelos/`; la configuración particular de cada
producto está en su `producto.json`, dentro de `conversion`.
Instalar `tools/modelos/requirements.txt` en un entorno Python y ejecutar:

```sh
python tools/modelos/generar_modelos.py --producto torre-mesa --obj "RUTA/Torre Mesa.obj"
```

El OBJ debe incluir normales y caras triangulares. Revisar `unidad_obj_metros`
y `escala_ejes` para cada modelo; no aplicar automáticamente los ajustes de Torre Mesa
al resto. Los bordes usan `radio_borde_metros` y `angulo_borde_grados`.
No se modifican los archivos originales. La conversión actual genera apariencia MDF.
Los metadatos y modelos de salida quedan en la carpeta del producto.

## Torre Mesa

Conserva 12 cuerpos y contornos negros. Ancho nominal 398 mm, altura real
905,972 mm (906 en pantalla), profundidad nominal 470 mm. La envolvente completa
incluye salientes, según `modelo-metadata.json`. El ajuste X es 0,995 respecto al OBJ.
Se mantiene el diseño elegido, sin aro de órbita. La prueba AR con cámara real funcionó, según confirmación del usuario recibida
el 8 de octubre de 2026. No se informó dispositivo, sistema operativo ni navegador;
esta confirmación no acredita pruebas separadas en Android e iPhone.

Los modelos del sitio público son descargables. No se incluyen F3D, DXF ni credenciales.
