# Procedimiento para incorporar productos al visor 3D y AR

Versión 1 — 8 de octubre de 2026.
Repositorio: https://github.com/MyMFibrofacil/Visor_AR
Catálogo: https://mymfibrofacil.github.io/Visor_AR/

Este documento reúne lo realizado con Torre Mesa y el procedimiento para repetirlo.
El flujo existente prepara productos ensamblados con apariencia MDF aproximada.
Las variantes con texturas, otros materiales o geometrías de entrada diferentes
requieren preparación adicional; no se convierten automáticamente con el conversor actual.

## 1. Qué hicimos con Torre Mesa

1. Revisamos F3D, OBJ, MTL, STL y luego DXF para identificar geometría, unidades,
   cuerpos, materiales y medidas. Usamos el OBJ como fuente de la conversión.
2. Confirmamos las medidas nominales: ancho 398 mm, alto 905,972 mm y profundidad
   470 mm. El usuario aclaró que 470 × 444 mm correspondía a la parte inferior
   del lateral: no era el ancho del producto.
3. Detectamos que el OBJ tenía coordenadas en centímetros y 12 cuerpos.
   Convertimos centímetros a metros, centramos X y Z y apoyamos la base en Y=0.
4. Aplicamos al modelo AR el ajuste X de 0,995 acordado para llevar el cuerpo
   nominal de 400 a 398 mm, conservando todas las piezas. Este ajuste es particular
   de Torre Mesa y NO debe copiarse automáticamente a otros productos.
5. Conservamos las salientes. La envolvente geométrica registrada es aproximadamente
   467,660 × 905,972 × 474,578 mm en X/Y/Z; no coincide con las medidas nominales
   mostradas. Los metadatos existentes describen la geometría antes de agregar
   contornos, que pueden ampliar levemente esa envolvente.
6. Creamos apariencia MDF mate y bordes negros como geometría, para que se vean
   tanto en el visor web como en los modelos AR. Se omitieron diagonales coplanares.
   El modelo original tiene 7.472 triángulos; los bordes agregan 40.944.
7. Generamos GLB para la web/Android y USDZ para Quick Look en dispositivos Apple.
   Se verificaron los archivos con herramientas de validación glTF y OpenUSD.
8. Construimos una página adaptable con logo, modelo, medidas redondeadas
   (398/906/470), nota de apariencia aproximada y botón para abrir AR.
   Probamos un aro de órbita y luego volvimos al diseño anterior por preferencia del usuario.
9. Primero publicamos mediante Sites y luego trasladamos el proyecto a GitHub.
   El repositorio final es Visor_AR. Visor-3d conserva sus visores de armado;
   la limpieza propuesta para ese repositorio no se publicó.
10. Separamos código compartido y productos, publicamos mediante GitHub Pages
    y comprobamos el enlace público, descarga de modelos y controles del visor.

**Estado de verificación:** el visor web y la publicación están comprobados.
La prueba física de AR con cámara en Android e iPhone sigue pendiente.
No considerar esa prueba realizada por haber visto el modelo en la computadora.

## 2. Qué archivos entregar para otro producto

| Formato | Para qué sirve | Prioridad y condición |
| --- | --- | --- |
| OBJ | Geometría de entrada al conversor actual | Preferido: producto armado, triangulado, normales y grupos por pieza; informar unidades |
| MTL e imágenes de textura | Referencia de materiales junto al OBJ | Adjuntar si existen; el conversor actual no interpreta MTL, UV ni texturas |
| F3D / F3Z | Respaldo editable de Fusion y revisión del ensamblaje | Muy útil junto al OBJ; no se convierte directamente en este flujo |
| STEP / STP | Geometría CAD para preparar una malla en otro programa | Alternativa de respaldo; necesita conversión previa a OBJ o GLB |
| GLB | Modelo listo para el visor | Ideal si ya está preparado, con escala real, orientación y materiales correctos; validar antes de incorporar |
| USDZ | Modelo preparado para Apple | Adjuntar si existe; comprobar que corresponda al mismo producto y escala del GLB |
| STL | Geometría de malla alternativa | Útil si no hay OBJ; suele requerir reconstruir separación de piezas/materiales y confirmar unidades; no es entrada directa del conversor |
| DXF | Contornos y medidas de piezas | Complementario; no reemplaza el ensamblaje 3D ni define por sí solo cómo se arma |
| PNG / JPG | Foto de referencia y vista previa | Recomendado: frente, lateral y perspectiva; indicar cuál usar como imagen del catálogo |

**Paquete recomendado desde Fusion:** OBJ + F3D/F3Z + MTL/texturas si existen +
medidas confirmadas + una foto o captura del producto armado. DXF opcional si
hay dudas sobre piezas, espesores o dimensiones. No hace falta generar GLB/USDZ:
los preparamos como salida del proceso.

**Si ya se dispone de archivos preparados para AR:** GLB + USDZ + imagen + datos
pueden incorporarse sin reconvertir desde OBJ. Los contornos negros deben estar
incluidos en esos modelos o prepararse por separado; el visor no los agrega solo.

## 3. Cómo preparar la exportación de Fusion

1. Abrir la versión final y colocar el producto en su posición de uso, armado.
2. Incluir todas las piezas visibles, herrajes relevantes y apoyos. Excluir planos,
   bocetos, guías, plantillas de mecanizado, cuerpos de prueba y productos ajenos.
3. Conservar cada pieza como cuerpo/grupo identificable. No entregar solamente
   una única superficie fusionada si se necesita destacar cada pieza.
4. Exportar una malla OBJ con caras triangulares y normales. En el archivo deben
   existir grupos `g`, vértices `v`, normales `vn` y caras `f` con índices de normal.
   El lector actual usa `g` para separar piezas; nombres de objeto `o` por sí solos
   no sirven para esa separación. Si la exportación no cumple esto, se prepara antes.
5. Elegir e informar la unidad. Para futuros productos recomendamos milímetros
   para simplificar la comparación con fabricación. Como OBJ no fija una unidad
   universal, verificar dimensiones de la malla aunque se haya elegido mm.
6. Elegir una calidad suficiente para curvas y perforaciones sin exportar detalle
   microscópico que no aporta a la visualización. Revisar el resultado, no solo el
   nombre de la opción de calidad. No hay una cantidad universal de triángulos.
7. Entregar todos los archivos asociados, manteniendo sus nombres y referencias.
8. Añadir una captura que permita reconocer frente, parte superior y apoyos.

Fusion dispone de “Save As Mesh / Guardar como malla” para exportar OBJ/STL/3MF.
Las opciones concretas varían según el objeto seleccionado y la versión.
Consultar la documentación oficial al preparar una exportación nueva:
https://help.autodesk.com/view/fusion360/ENU/?contextId=MESH-SAVE-AS-MESH

## 4. Datos necesarios antes de empezar

- Código o SKU estable y nombre comercial del producto.
- Versión del diseño y fecha; distinguir prototipo de producto final.
- Ancho, alto y profundidad reales en mm, sin redondear la fuente.
- Qué incluye cada medida: cuerpo nominal, herrajes, salientes, patas o accesorios.
- Espesor y material por pieza si hay variantes.
- Color/acabado esperado; confirmar si basta la apariencia aproximada.
- Estado que se mostrará: abierto/cerrado, armado, con/sin accesorios, etc.
- Identificación de frente, eje vertical y superficie de apoyo: piso, pared o mesa.
- Unidad de exportación y programa de origen.
- Una o más imágenes del producto real o del modelo final.
- Variantes que deben ser productos separados y qué cambia entre ellas.
- Nombre de carpeta deseado, preferentemente derivado del código estable.

El logo ya está centralizado. Solo hace falta entregarlo otra vez si cambia la marca.
Para comenzar alcanza con un OBJ utilizable, medidas y referencia de orientación;
los otros archivos ayudan a resolver inconsistencias sin repetir el trabajo.

## 5. Preparación técnica del modelo

1. Inspeccionar cuerpos, normales, triángulos y dimensiones de la fuente.
   Si faltan normales o hay caras no triangulares, preparar el OBJ primero.
2. Confirmar unidades por medición, sin deducirlas solamente por la extensión:
   mm → metros: 0,001; cm → metros: 0,01; metros → metros: 1.
3. Alinear el modelo con Y vertical. El conversor actual centra X/Z y apoya en Y=0,
   pero NO reorienta automáticamente modelos con otro eje vertical.
4. Comparar dimensiones nominales y envolvente. Documentar salientes. Si hay un
   error real de diseño, corregir el CAD y reexportar preferentemente. No deformar
   el modelo para que una cifra coincida sin comprobar la causa.
5. Mantener `escala_ejes: [1, 1, 1]` salvo corrección justificada y confirmada.
6. Preparar materiales. El conversor actual genera MDF mate uniforme y contornos
   negros; conserva posiciones y normales, pero no UV, texturas, materiales por
   pieza, animaciones ni restricciones del ensamblaje de Fusion.
7. Ajustar contornos cuando corresponda. Torre Mesa usa radio 0,00055 m
   (diámetro 1,1 mm) y ángulo de 35°. No es un espesor de fabricación.
   Revisar si ese grosor resulta adecuado para el nuevo producto.
8. Generar GLB y USDZ con geometría equivalente. Revisar peso y tiempo de carga
   en un celular real. Como referencia, Torre Mesa ocupa unos 3,5 MB por modelo;
   es una referencia de este caso, no un límite ni una garantía de rendimiento.
9. Validar GLB con el validador oficial glTF y USDZ con herramientas OpenUSD;
   inspeccionar también visualmente, porque un archivo válido puede tener escala incorrecta.
10. Registrar procedencia, hash de fuente, dimensiones, ajustes y estado de pruebas
    en `modelo-metadata.json`. Mantener los originales de fabricación fuera del sitio público.

El botón AR tiene escala fija. Esto conserva la escala del archivo, pero no corrige
un modelo exportado con unidades equivocadas ni garantiza la precisión de seguimiento
de cada dispositivo.

## 6. Incorporación al repositorio

```text
Visor_AR/
├── index.html                  Catálogo
├── assets/                     Código, estilos, logo y biblioteca comunes
├── productos/
│   ├── catalogo.json            Lista de productos
│   ├── torre-mesa/
│   └── <codigo-del-producto>/
│       ├── index.html           Entrada al visor compartido
│       ├── producto.json        Datos y configuración
│       ├── modelo.glb
│       ├── modelo.usdz
│       ├── modelo.png
│       └── modelo-metadata.json
├── tools/modelos/              Conversores compartidos
├── scripts/                    Generación y servidor local
└── docs/                       Procedimientos
```

1. Actualizar la copia local desde GitHub y comprobar que no haya trabajo pendiente.
2. Crear `productos/<codigo-del-producto>/` usando minúsculas y guiones sin espacios.
   Usar un código estable facilita renombrar el producto comercial sin cambiar el enlace.
   Cada variante con geometría propia necesita su carpeta; todavía no hay selector de variantes.
3. Copiar únicamente la entrada `index.html` de Torre Mesa y ajustar título y descripción.
4. Crear `producto.json` con nombre, descripción accesible, medidas, nota de apariencia,
   nombres de archivos, cámara y parámetros de conversión cuando se use OBJ.
   No copiar la cámara ni la escala de Torre Mesa sin revisarlas.
5. Incorporar los modelos y el poster. El poster es una imagen estática que se ve
   mientras carga el modelo; debe representar la misma versión del producto.
6. Agregar una entrada en `productos/catalogo.json` con carpeta, nombre e imagen.
7. Revisar el nuevo producto y al menos Torre Mesa para detectar regresiones.
8. Publicar y comprobar la URL final.

Una incorporación normal modifica la carpeta del producto y el catálogo.
No requiere duplicar ni editar JavaScript/CSS compartido. Si cambia una función
común, revisar los productos existentes antes de publicar.

La cámara debe apuntar al centro visible del producto y tener una distancia adecuada
para su tamaño. Los límites de cámara también son particulares de cada producto.

### Comandos del flujo actual

Desde la raíz del repositorio, con Node.js 22 disponible:

```sh
npm run dev
npm run build
```

No hay dependencias npm que instalar. El servidor local usa http://127.0.0.1:8767.
`npm run build` genera `dist/` con los archivos del sitio.

Para convertir desde OBJ, con un entorno Python preparado:

```sh
python -m pip install -r tools/modelos/requirements.txt
python tools/modelos/generar_modelos.py --producto <codigo-del-producto> --obj "RUTA/Producto.obj"
```

Crear primero la carpeta y `producto.json`. El conversor escribe los modelos y
metadatos en esa carpeta. Las dependencias de conversión son NumPy y usd-core;
no se necesitan en el navegador ni para publicar archivos ya preparados.

## 7. Verificación antes y después de publicar

| Verificación | Qué debe comprobarse |
| --- | --- |
| Identidad | Producto, versión, código e imagen correctos |
| Geometría | Piezas completas, orientación correcta, sin piezas flotando o faltantes |
| Escala | Dimensiones del archivo comparadas con medidas confirmadas; salientes documentadas |
| Apariencia | Materiales aceptables y bordes visibles sin tapar detalles |
| Visor web | Carga, giro, acercamiento, vista inicial, medidas, logo y mensajes |
| Celular | Página legible, modelo completo y tiempo de carga razonable |
| Android real | Abrir en navegador compatible, iniciar AR, colocar, girar, mover y comprobar tamaño |
| iPhone real | Abrir en navegador compatible, iniciar Quick Look y repetir la prueba |
| Reubicación | Comprobar los gestos disponibles en cada visor; no asumir controles idénticos |
| Publicación | Flujo de GitHub Pages exitoso y enlace público accesible sin sesión |
| Archivos | GLB, USDZ, poster y configuración descargan sin errores |
| Regresión | El catálogo y productos anteriores siguen funcionando |

No todos los celulares admiten AR. Si no la admiten, deben poder ver el producto
3D. Los gestos de giro y movimiento dependen del visor AR del dispositivo.
El sistema actual no incluye un manipulador tipo Fusion ni un botón universal
para reubicar el producto durante una sesión AR.

Guardar el resultado de la prueba con fecha, dispositivo, navegador y observaciones.
Si una plataforma no se probó, dejarla explícitamente pendiente.

## 8. Publicación y mantenimiento

Al enviar los cambios a `main`, `.github/workflows/deploy-pages.yml` genera el sitio
con `scripts/publicar.mjs` y publica `dist/` en GitHub Pages.

URL por producto:
`https://mymfibrofacil.github.io/Visor_AR/productos/<codigo-del-producto>/`

Para un dominio propio se conserva la estructura de rutas relativas y se configura
el dominio/hosting por separado. GLB y USDZ deben estar accesibles mediante HTTPS.
Los archivos del sitio y del repositorio público son descargables: mantener CAD,
planos de fabricación y documentación interna fuera del repositorio público.

Si se actualiza un producto, conservar su código/carpeta; sustituir los archivos de
la misma versión en conjunto, revisar el cacheado del navegador y repetir las pruebas.
Git permite recuperar versiones anteriores. No editar manualmente `dist/` como fuente.

Para muchos productos, evaluar tiempos de carga y crecimiento del repositorio.
No existe actualmente un panel de carga ni alta automática: el procedimiento usa
carpetas y configuración. Una herramienta de alta que genere esas entradas puede
incorporarse posteriormente; no es necesaria para el funcionamiento actual.

## 9. Ficha de entrega reutilizable

Completar `docs/PLANTILLA_ENTREGA_PRODUCTO.md` y acompañarla con los archivos fuente.
Esto permite iniciar cada incorporación con los mismos datos y reducir consultas.

## 10. Referencias técnicas

- Autodesk, guardar cuerpos como OBJ/STL/3MF y seleccionar unidades:
  https://help.autodesk.com/view/fusion360/ENU/?contextId=MESH-SAVE-AS-MESH
- Autodesk, OBJ sin unidad universal y parámetros de malla:
  https://help.autodesk.com/view/fusion360/ENU/?contextId=MAKE-3D-PRINT-CMD
- model-viewer, formatos, AR, `ios-src` y `ar-scale`:
  https://modelviewer.dev/docs/index.html
- Ejemplos oficiales AR:
  https://modelviewer.dev/examples/augmentedreality/index.html
- Validador oficial glTF:
  https://github.com/KhronosGroup/glTF-Validator

Las limitaciones del conversor se comprobaron leyendo el código actual del repositorio;
no son limitaciones generales de los formatos OBJ, GLB o USDZ.
