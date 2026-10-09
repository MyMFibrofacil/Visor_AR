"""Lee los cuerpos y normales de una exportación OBJ de Fusion."""
from pathlib import Path
import numpy as np


def leer_cuerpos(path: Path):
    """Devuelve un diccionario de cuerpos con posiciones y normales por triángulo."""
    vertices, normales, grupos = [], [], {}
    grupo = "Producto"
    material = "(sin material)"
    for linea in path.read_text(encoding="utf-8").splitlines():
        campos = linea.split()
        if not campos:
            continue
        if campos[0] == "v":
            vertices.append([float(x) for x in campos[1:4]])
        elif campos[0] == "vn":
            normales.append([float(x) for x in campos[1:4]])
        elif campos[0] == "g":
            grupo = " ".join(campos[1:]) or "Producto"
        elif campos[0] == "usemtl":
            material = " ".join(campos[1:]) or "(sin material)"
        elif campos[0] == "f":
            if len(campos) != 4:
                raise ValueError("El OBJ debe contener caras triangulares.")
            destino = grupos.setdefault(grupo, {
                "posiciones": [], "normales": [], "material_por_cara": []})
            for punto in campos[1:]:
                indices = punto.split("/")
                destino["posiciones"].append(vertices[int(indices[0]) - 1])
                destino["normales"].append(normales[int(indices[2]) - 1])
            destino["material_por_cara"].append(material)
    if not grupos:
        raise ValueError("El OBJ no contiene cuerpos.")
    for cuerpo in grupos.values():
        cuerpo["posiciones"] = np.asarray(cuerpo["posiciones"], dtype=np.float64)
        cuerpo["normales"] = np.asarray(cuerpo["normales"], dtype=np.float32)
    return grupos
