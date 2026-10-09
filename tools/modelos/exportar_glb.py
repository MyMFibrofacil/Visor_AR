"""Exporta una escena triangulada a GLB 2.0 con material MDF aproximado."""
import json
import struct
import numpy as np
from materiales import COLOR_MDF


def exportar_glb(cuerpos, destino, movimiento=None, material=None, materiales=None):
    """Guarda los cuerpos, conservando sus normales y separaciones originales."""
    material = material or {}
    materiales = materiales or {}
    nombres_materiales = list(dict.fromkeys(
        nombre for cuerpo in cuerpos.values()
        for nombre in cuerpo.get("material_por_cara", [cuerpo.get("material", "(sin material)")]))
    )
    if material:
        nombres_materiales = [material.get("nombre", "MDF aproximado")]
        materiales = {nombres_materiales[0]: {
            "nombre": nombres_materiales[0], "color": material.get("color", COLOR_MDF),
            "roughness": material.get("roughness", 0.88)}}
    for nombre in nombres_materiales:
        materiales.setdefault(nombre, {"nombre": nombre, "color": COLOR_MDF, "roughness": 0.88})
    materiales.setdefault("bordes", {
        "nombre": "Bordes negros", "color": [0.001, 0.001, 0.001], "roughness": 1.0})
    indices_material = {nombre: indice for indice, nombre in enumerate(materiales)}
    documento = {"asset": {"version": "2.0", "generator": "Visor productos AR"},
                 "scene": 0, "scenes": [{"nodes": []}], "nodes": [], "meshes": [],
                 "accessors": [], "bufferViews": [],
                 "materials": [{"name": datos["nombre"], "doubleSided": True,
                     "pbrMetallicRoughness": {"baseColorFactor": datos["color"] + [1],
                         "metallicFactor": 0, "roughnessFactor": datos["roughness"]}}
                     for datos in materiales.values()]}
    buffer = bytearray()
    nodos_por_cuerpo = {}
    for nombre, cuerpo in cuerpos.items():
        posiciones = cuerpo["posiciones"].reshape(-1, 3, 3)
        normales = cuerpo["normales"].reshape(-1, 3, 3)
        material_por_cara = cuerpo.get("material_por_cara")
        if material_por_cara is None:
            material_por_cara = [cuerpo.get("material", nombres_materiales[0])] * len(posiciones)
        grupos_materiales = {}
        for cara, nombre_material in enumerate(material_por_cara):
            if cuerpo.get("material") == "bordes":
                nombre_material = "bordes"
            elif material:
                nombre_material = material.get("nombre", "MDF aproximado")
            grupos_materiales.setdefault(nombre_material, []).append(cara)
        primitivas = []
        for nombre_material, caras in grupos_materiales.items():
            datos_atributos = {}
            for semantica, arreglo in [("POSITION", posiciones), ("NORMAL", normales)]:
                datos = arreglo[caras].reshape(-1, 3).astype("<f4")
                bloque = datos.tobytes()
                vista = len(documento["bufferViews"])
                documento["bufferViews"].append({"buffer": 0, "byteOffset": len(buffer),
                                                "byteLength": len(bloque), "target": 34962})
                buffer.extend(bloque)
                indice = len(documento["accessors"])
                accessor = {"bufferView": vista, "componentType": 5126,
                            "count": len(datos), "type": "VEC3"}
                if semantica == "POSITION":
                    accessor.update(min=datos.min(axis=0).tolist(), max=datos.max(axis=0).tolist())
                documento["accessors"].append(accessor)
                datos_atributos[semantica] = indice
            primitivas.append({"attributes": datos_atributos,
                               "material": indices_material[nombre_material], "mode": 4})
        indice = len(documento["meshes"])
        documento["meshes"].append({"name": nombre, "primitives": primitivas})
        documento["nodes"].append({"name": nombre, "mesh": indice})
        nodos_por_cuerpo[nombre] = indice
        documento["scenes"][0]["nodes"].append(indice)
    if movimiento:
        grupo = movimiento["grupo"]
        if grupo not in nodos_por_cuerpo:
            raise ValueError(f"El grupo móvil no existe en el OBJ: {grupo}")
        tiempos = [i * movimiento["segundos_por_nivel"]
                   for i in range(len(movimiento["desplazamientos_metros"]))]
        desplazamientos = [[0, alto, 0] for alto in movimiento["desplazamientos_metros"]]
        # Extend the last pose past the final selectable level so seeking to the
        # last position does not wrap to time zero in model-viewer.
        tiempos.append(tiempos[-1] + movimiento["segundos_por_nivel"])
        desplazamientos.append(desplazamientos[-1])
        for datos, tipo, minimo, maximo in [
            (tiempos, "SCALAR", [tiempos[0]], [tiempos[-1]]),
            (desplazamientos, "VEC3", None, None),
        ]:
            arreglo = np.asarray(datos, dtype="<f4")
            bloque = arreglo.tobytes()
            vista = len(documento["bufferViews"])
            documento["bufferViews"].append({"buffer": 0, "byteOffset": len(buffer),
                                             "byteLength": len(bloque)})
            buffer.extend(bloque)
            accessor = {"bufferView": vista, "componentType": 5126,
                        "count": len(arreglo), "type": tipo}
            if minimo is not None:
                accessor.update(min=minimo, max=maximo)
            documento["accessors"].append(accessor)
        animation = {"name": movimiento["nombre_animacion"],
                     "samplers": [{"input": len(documento["accessors"])-2,
                                   "output": len(documento["accessors"])-1,
                                   "interpolation": "STEP"}],
                     "channels": [{"sampler": 0,
                                   "target": {"node": nodos_por_cuerpo[grupo],
                                              "path": "translation"}}]}
        documento["animations"] = [animation]
    documento["buffers"] = [{"byteLength": len(buffer)}]
    cabecera = json.dumps(documento, separators=(",", ":")).encode("utf-8")
    cabecera += b" " * (-len(cabecera) % 4)
    buffer.extend(b"\0" * (-len(buffer) % 4))
    longitud = 12 + 8 + len(cabecera) + 8 + len(buffer)
    destino.write_bytes(struct.pack("<4sII", b"glTF", 2, longitud) +
        struct.pack("<I4s", len(cabecera), b"JSON") + cabecera +
        struct.pack("<I4s", len(buffer), b"BIN\0") + buffer)
