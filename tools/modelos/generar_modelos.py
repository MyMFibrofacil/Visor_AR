"""Punto de entrada para preparar los archivos de realidad aumentada."""
import hashlib
import json
import argparse
from collections import Counter
from pathlib import Path
from leer_obj import leer_cuerpos
from materiales import leer_materiales_mtl, resolver_materiales
from preparar_escena import preparar_escena
from exportar_glb import exportar_glb
from exportar_usdz import exportar_usdz
from generar_bordes import agregar_bordes


def main():
    parametros = argparse.ArgumentParser(description="Regenera los modelos AR de un producto configurado.")
    parametros.add_argument('--obj', type=Path, required=True, help='Archivo OBJ original exportado de Fusion')
    parametros.add_argument('--producto', required=True, help='Carpeta del producto dentro de productos/')
    opciones = parametros.parse_args()
    proyecto = Path(__file__).resolve().parents[2]
    origen = opciones.obj.resolve()
    if not origen.is_file():
        parametros.error(f'No existe el archivo OBJ: {origen}')
    raiz_productos = (proyecto / "productos").resolve()
    destino = (raiz_productos / opciones.producto).resolve()
    if destino.parent != raiz_productos:
        parametros.error('La carpeta debe ser un producto directo dentro de productos/.')
    configuracion = destino / 'producto.json'
    if not configuracion.is_file():
        parametros.error(f'No existe la configuración: {configuracion}')
    config = json.loads(configuracion.read_text(encoding='utf-8'))
    conversion = config['conversion']
    destino.mkdir(parents=True, exist_ok=True)
    cuerpos = leer_cuerpos(origen)
    nombres_materiales = list(dict.fromkeys(
        material for cuerpo in cuerpos.values() for material in cuerpo["material_por_cara"]))
    definiciones_mtl = leer_materiales_mtl(origen)
    materiales = resolver_materiales(nombres_materiales, definiciones_mtl,
        config.get("materiales"), config.get("material"))
    resumen = preparar_escena(cuerpos, conversion["unidad_obj_metros"], conversion["escala_ejes"])
    escena, cantidad_bordes = agregar_bordes(cuerpos, conversion["radio_borde_metros"], conversion["angulo_borde_grados"])
    movimiento = config.get("movimiento")
    material_global = config.get("material")
    exportar_glb(escena, destino / config["archivos"]["glb"], movimiento,
                 material_global, materiales)
    exportar_usdz(escena, destino / config["archivos"]["usdz"], movimiento,
                  material_global, materiales)
    asignaciones = {}
    asignaciones_por_pieza = {}
    for nombre_material in nombres_materiales:
        asignaciones[nombre_material] = {
            "nombre_exportado": materiales[nombre_material]["nombre"],
            "caras": sum(cuerpo["material_por_cara"].count(nombre_material)
                         for cuerpo in cuerpos.values()),
        }
    for nombre_pieza, cuerpo in cuerpos.items():
        asignaciones_por_pieza[nombre_pieza] = dict(Counter(cuerpo["material_por_cara"]))
    resumen.update(dimensions_confirmadas_mm=config["medidas_mm"],
        cuerpos=len(cuerpos), triangulos=sum(len(c["posiciones"]) // 3 for c in cuerpos.values()),
        material=config["apariencia"],
        materiales_obj=asignaciones,
        materiales_por_pieza=asignaciones_por_pieza,
        segmentos_bordes=cantidad_bordes,
        triangulos_bordes=sum(len(c['posiciones']) // 3 for c in escena.values() if c.get('material') == 'bordes'),
        fuente_sha256=hashlib.sha256(origen.read_bytes()).hexdigest(),
        grupo_movil=movimiento.get("grupo") if movimiento else None,
        niveles_movimiento=len(movimiento["desplazamientos_metros"]) if movimiento else 0,
        validacion_celular="Pendiente")
    (destino / "modelo-metadata.json").write_text(json.dumps(resumen, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(resumen, ensure_ascii=False))


if __name__ == "__main__":
    main()
