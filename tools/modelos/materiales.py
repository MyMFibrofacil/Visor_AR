"""Lee materiales MTL de Fusion y resuelve sus acabados para GLB y USDZ."""
from pathlib import Path

COLOR_MDF = [0.52, 0.34, 0.18]
COLOR_PINO = [0.40, 0.23, 0.12]
PRESETS = {
    "tablero_mdf": COLOR_MDF,
    "pino": COLOR_PINO,
    "abs_(blanco)": [0.964706, 0.964706, 0.952941],
    "superficie_-_mate": [0.701961, 0.701961, 0.701961],
}


def leer_materiales_mtl(obj_path):
    """Lee nombre, color difuso y rugosidad de los MTL referenciados por un OBJ."""
    obj_path = Path(obj_path)
    materiales = {}
    for linea in obj_path.read_text(encoding="utf-8", errors="replace").splitlines():
        campos = linea.split()
        if campos and campos[0] == "mtllib":
            archivo_mtl = obj_path.parent / " ".join(campos[1:])
            if not archivo_mtl.is_file():
                raise FileNotFoundError(f"No se encontró el material OBJ: {archivo_mtl}")
            materiales.update(_leer_archivo_mtl(archivo_mtl))
    return materiales


def _leer_archivo_mtl(path):
    materiales, actual = {}, None
    for linea in Path(path).read_text(encoding="utf-8", errors="replace").splitlines():
        campos = linea.split()
        if not campos or campos[0].startswith("#"):
            continue
        if campos[0] == "newmtl":
            nombre = " ".join(campos[1:])
            actual = {"nombre": nombre, "color": None, "roughness": 0.88}
            materiales[nombre] = actual
        elif actual and campos[0] == "Kd" and len(campos) >= 4:
            actual["color"] = [float(valor) for valor in campos[1:4]]
        elif actual and campos[0] == "Ns" and len(campos) >= 2:
            brillo = max(0.0, min(float(campos[1]), 1000.0))
            actual["roughness"] = max(0.08, min(1.0, 1.0 - brillo / 1000.0))
    return materiales


def resolver_materiales(nombres, materiales_mtl, overrides=None, global_material=None):
    """Combina MTL con reemplazos por producto, sin cambiar las asignaciones OBJ."""
    overrides = overrides or {}
    materiales = {}
    for nombre in nombres:
        if global_material:
            datos = dict(global_material)
            salida = datos.get("nombre", nombre)
        else:
            datos = dict(materiales_mtl.get(nombre, {}))
            salida = nombre
            datos.update(overrides.get(nombre, {}))
            if datos.get("nombre"):
                salida = datos["nombre"]
        color = datos.get("color")
        if not color or all(float(c) == 0 for c in color):
            color = PRESETS.get(nombre.casefold(), COLOR_MDF)
        materiales[nombre] = {
            "nombre": salida,
            "color": [float(c) for c in color],
            "roughness": float(datos.get("roughness", 0.88)),
        }
    materiales["bordes"] = {
        "nombre": "Bordes negros", "color": [0.001, 0.001, 0.001], "roughness": 1.0}
    return materiales
