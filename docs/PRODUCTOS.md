# Agregar y mantener productos

Guía rápida. Para la recopilación del proceso, formatos de entrega y verificaciones,
ver [el procedimiento completo](PROCEDIMIENTO_PRODUCTOS_AR.md) y
[la ficha de entrega](PLANTILLA_ENTREGA_PRODUCTO.md).

1. Crear `productos/<codigo-o-nombre>/`. Usar minúsculas y guiones, sin espacios.
2. Usar la pantalla común `pantallas/producto.html`; el proceso de publicación
   la incorpora automáticamente a la carpeta del producto en el sitio generado.
3. Crear `producto.json` usando Torre Mesa como referencia. Configurar nombre,
   código de producto, descripción, medidas reales en mm, apariencia, archivos
   y cámara inicial.
4. Colocar GLB, USDZ y vista previa en esa misma carpeta. Mantener escala real
   en metros, eje Y vertical y apoyo en Y=0.
5. Agregar una entrada en `datos/catalogo.json` con carpeta, nombre, imagen,
   categoría (`categoria`) y subcategoría (`subcategoria`) tomadas de la planilla
   de productos. Incluir solamente productos con modelos AR disponibles.
   El catálogo genera sus filtros a partir de estas entradas; los campos de
   clasificación vacíos no generan opciones. La planilla no se sincroniza automáticamente.
6. Ejecutar `npm run dev`, revisar catálogo, carga, medidas y botón de vista inicial.
   Probar AR con cámara en Android e iPhone compatibles antes de darlo por validado.
7. Enviar los cambios a `main` y verificar la publicación de GitHub Pages.

No copiar la pantalla, JavaScript, biblioteca ni logo a cada producto. Se comparten
desde `pantallas/` y `assets/`. Los nombres de modelos e imágenes se resuelven
relativos a la página de cada producto.
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
No se modifican los archivos originales. La conversión conserva `usemtl` por cara
y los colores `Kd` del MTL; para materiales sin color definido usa una paleta
aproximada por nombre. Las texturas externas/UV no se convierten todavía.
Los metadatos y modelos de salida quedan en la carpeta del producto.

## Torre Mesa

Conserva 12 cuerpos y contornos negros. Ancho nominal 398 mm, altura real
905,972 mm (906 en pantalla), profundidad nominal 470 mm. La envolvente completa
incluye salientes, según `modelo-metadata.json`. El ajuste X es 0,995 respecto al OBJ.
Se mantiene el diseño elegido, sin aro de órbita. La prueba AR con cámara real funcionó, según confirmación del usuario recibida
el 8 de octubre de 2026. No se informó dispositivo, sistema operativo ni navegador;
esta confirmación no acredita pruebas separadas en Android e iPhone.

## Escalera Niño

Incorporada el 9 de octubre de 2026 en `productos/escalera-nino/`, código
`FC00050105`. Identidad y clasificación leídas de Productos Chatbot, Hoja 1,
fila 16: Infanto Juvenil / Infantil; fibrofacil de 18 mm.

Medidas nominales confirmadas por el usuario: 318 × 300 × 330 mm
(ancho × alto × profundidad). Se priorizan sobre los 320 × 300 × 350 mm
registrados en la planilla, que no se modificó.
El OBJ tiene cinco cuerpos y 1.682 triángulos, coordenadas en centímetros y
envolvente de 318 × 301,60096 × 330 mm. Se conserva la geometría original,
sin deformación por ejes, centrada y apoyada en Y=0. Los contornos tienen
radio de 0,4 mm. GLB y USDZ representan la misma geometría.

Verificación: GLB sin errores ni advertencias del validador Khronos; USDZ sin
errores con 28 validadores de OpenUSD. Carga, medidas, catálogo y vista inicial
comprobados en navegador de escritorio y vista móvil, con revisión de Torre Mesa.
AR con cámara física en Android e iPhone pendiente.

Enlace: https://mymfibrofacil.github.io/Visor_AR/productos/escalera-nino/

## Biblioteca Montessori

Incorporada el 9 de octubre de 2026 en `productos/biblioteca-montessori/`,
código `FC00010901`. Identidad y clasificación leídas de Productos Chatbot,
Hoja 1, fila 26: Montessori / Habitacion; fibrofacil de 18 y 9 mm.

OBJ original con nueve cuerpos y 2.688 triángulos, coordenadas en centímetros.
Medidas geométricas y visibles: 598 × 500 × 360 mm (ancho × alto × profundidad).
La planilla registra 600 mm de ancho comercial. Se conserva la geometría sin
deformación, con eje Y vertical y apoyo en Y=0. Contornos de radio 0,55 mm.
La imagen de catálogo se genera desde el mismo modelo; la captura original
sirve como referencia visual y permanece junto a los archivos de diseño.

GLB sin errores ni advertencias de Khronos; USDZ sin errores con 28 validadores
OpenUSD. Carga, medidas, catálogo, vista inicial y disposición móvil comprobados.
Prueba de AR con cámara física pendiente en Android e iPhone.

Enlace: https://mymfibrofacil.github.io/Visor_AR/productos/biblioteca-montessori/

## Torre Aprendizaje Montessori Regulable

Incorporada el 9 de octubre de 2026 en `productos/torre-regulable/`, código
`FC0003110002`. Identidad y clasificación leídas de Productos Chatbot,
Hoja 1, fila 70: Montessori / Torres; el material real es pino, según
confirmación del usuario. La planilla registra
42 × 91 × 40 cm; se usan las dimensiones verificadas del modelo: 39,8 × 88 ×
43,421 cm (ancho × alto × profundidad).

El OBJ conserva seis grupos y 14.388 triángulos. `Cuerpo28`, el tablero de
38 × 33 cm y 18 mm de espesor, es la plataforma móvil. El visor ofrece cinco
posiciones mediante un control con pasos. GLB contiene una animación de
traslación vertical que mueve únicamente ese grupo; USDZ contiene la animación
para Quick Look. En Android se habilita WebXR para conservar el control durante
la sesión AR; en iPhone Quick Look ofrece su control nativo de animación.
Escala original, sin deformación. Material configurado como pino natural con
tono aproximado, y contornos negros de radio 0,55 mm.

Verificación: GLB sin errores ni advertencias de Khronos; USDZ sin errores con
validadores OpenUSD. Movimiento, cinco niveles, visor móvil y productos previos
comprobados localmente. La interacción AR debe comprobarse con cámara en los
dispositivos objetivo antes de darla por validada.

Enlace: https://mymfibrofacil.github.io/Visor_AR/productos/torre-regulable/

## Cocina Pocket

Se incorpora el 9 de octubre de 2026 en `productos/cocina-pocket/`, código
`F9JS_COCINA_POCKET`, clasificada en Productos Chatbot, Hoja 1, fila 96 como
Juego Simbolico / Linea Pocket. La envolvente del OBJ mide 600,02 ×
881,02 × 353,684 mm (ancho × alto × profundidad).

El modelo incluye 31 cuerpos y 58.670 triángulos. Conserva las asignaciones de
materiales exportadas desde Fusion 360; los tonos de Tablero MDF y Pino se
aproximaron visualmente desde el render de Fusion porque el MTL los exportó en
negro. El visor publica GLB y USDZ, y la imagen de Fusion como portada.

Enlace: https://mymfibrofacil.github.io/Visor_AR/productos/cocina-pocket/

## Mesa, silla y combo Montessori

Se incorporan como tres fichas independientes: Mesa Montessori
(`FC0003080001`), Silla Montessori (`FC0003080004`) y Mesa y 2 sillas
Montessori (`CC0099990005`). Los OBJ originales están en la carpeta de diseño
`Mesa y Sillas Montessori`, fuera del repositorio público.

Las medidas provienen de la envolvente de cada modelo OBJ en centímetros:
mesa 620,491 × 421,15 × 408 mm; silla 300 × 380 × 328 mm; combo guardado
700 × 421,15 × 408 mm. El combo con una silla afuera ocupa
1120 × 421,15 × 408 mm. Son medidas de la geometría, no cotas comerciales.

El combo permite elegir ambas sillas guardadas o una afuera antes de abrir AR.
Cada posición usa su propio GLB y USDZ para que la elección se conserve en
Android y iPhone. La segunda posición se preparó a partir del OBJ del conjunto:
los grupos `Cuerpo38` a `Cuerpo41` de la silla derecha se trasladaron 42 cm
en X, sin modificar las otras ocho piezas. Se puede regenerar con
`tools/modelos/generar_combo_montessori.py`. La posición se cotejó con
`Mesa y Sillas 2.png`; no existe un OBJ original exportado en esa posición.

La comprobación con cámara física en Android y iPhone queda pendiente.

Los modelos del sitio público son descargables. No se incluyen F3D, DXF ni credenciales.
