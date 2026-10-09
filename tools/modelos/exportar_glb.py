"""Exporta una escena triangulada a GLB 2.0 con material MDF aproximado."""
import json
import struct
import numpy as np
from movimientos import cuaternion_eje_angulo
from materiales import COLOR_MDF


def _agregar_accessor_animacion(documento, buffer, valores, tipo):
    """Agrega claves de animación al bloque binario del GLB."""
    while len(buffer) % 4:
        buffer.append(0)
    componentes = {"SCALAR": 1, "VEC4": 4}[tipo]
    arreglo = np.asarray(valores, dtype="<f4").reshape(-1, componentes)
    offset = len(buffer)
    bloque = arreglo.tobytes()
    buffer.extend(bloque)
    vista = len(documento["bufferViews"])
    documento["bufferViews"].append({"buffer": 0, "byteOffset": offset,
                                     "byteLength": len(bloque)})
    accesor = {"bufferView": vista, "componentType": 5126,
               "count": len(arreglo), "type": tipo}
    accesor.update(min=arreglo.min(axis=0).tolist(), max=arreglo.max(axis=0).tolist())
    indice = len(documento["accessors"])
    documento["accessors"].append(accesor)
    return indice


def _agregar_animaciones(documento, buffer, nodos_por_cuerpo, movimientos):
    """Crea un clip y un pivote independiente por cada pieza articulada."""
    raices = documento["scenes"][documento["scene"]]["nodes"]
    animaciones = []
    piezas_usadas = set()
    for indice_movimiento, movimiento in enumerate(movimientos):
        canales, samplers = [], []
        for indice_articulacion, articulacion in enumerate(movimiento["articulaciones"]):
            grados = articulacion["keyframes_grados"]
            duracion = movimiento["duracion_segundos"]
            tiempos = [duracion * i / (len(grados) - 1) for i in range(len(grados))]
            entrada = _agregar_accessor_animacion(documento, buffer, tiempos, "SCALAR")
            cuaterniones = [cuaternion_eje_angulo(articulacion["eje"], valor)
                            for valor in grados]
            salida = _agregar_accessor_animacion(documento, buffer, cuaterniones, "VEC4")
            sampler = len(samplers)
            samplers.append({"input": entrada, "output": salida, "interpolation": "LINEAR"})
            for pieza in articulacion["piezas"]:
                nombres = [pieza]
                nombre_bordes = f"{pieza}_Bordes"
                if nombre_bordes in nodos_por_cuerpo:
                    nombres.append(nombre_bordes)
                for nombre_nodo in nombres:
                    if nombre_nodo in piezas_usadas:
                        raise ValueError(f"La pieza aparece en más de un movimiento: {nombre_nodo}")
                    if nombre_nodo not in nodos_por_cuerpo:
                        raise ValueError(f"El grupo móvil no existe en el OBJ: {nombre_nodo}")
                    piezas_usadas.add(nombre_nodo)
                    nodo_pieza = nodos_por_cuerpo[nombre_nodo]
                    pivote = articulacion["pivote_metros"]
                    documento["nodes"][nodo_pieza]["translation"] = [-valor for valor in pivote]
                    nodo_pivote = len(documento["nodes"])
                    documento["nodes"].append({
                        "name": f"Pivote {movimiento['nombre_animacion']} {nombre_nodo}",
                        "translation": pivote, "children": [nodo_pieza]})
                    raices.remove(nodo_pieza)
                    raices.append(nodo_pivote)
                    canales.append({"sampler": sampler,
                        "target": {"node": nodo_pivote, "path": "rotation"}})
        animaciones.append({"name": movimiento["nombre_animacion"],
                            "samplers": samplers, "channels": canales})
    documento["animations"] = animaciones


def exportar_glb(cuerpos, destino, movimiento=None, material=None, materiales=None,
                 movimientos=None):
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
    if movimientos:
        if movimiento:
            raise ValueError("No se pueden combinar movimiento simple y varios movimientos.")
        _agregar_animaciones(documento, buffer, nodos_por_cuerpo, movimientos)
    elif movimiento:
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
