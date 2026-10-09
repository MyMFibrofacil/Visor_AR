"""Valida y prepara pivotes de animación en el sistema de coordenadas del visor."""
import math


def preparar_movimientos(configuracion, unidad_metros, origen_metros,
                         escala_ejes, nombres_grupos):
    """Convierte articulaciones descritas en OBJ a coordenadas finales en metros."""
    resultado = []
    piezas_usadas = set()
    origen = origen_metros
    escala = escala_ejes
    for movimiento in configuracion or []:
        articulaciones = []
        duracion = float(movimiento.get("duracion_segundos", 1.0))
        if duracion <= 0:
            raise ValueError(f"La duración debe ser positiva: {movimiento['nombre_animacion']}")
        for articulacion in movimiento["articulaciones"]:
            eje = articulacion["eje"].upper()
            if eje not in {"X", "Y", "Z"}:
                raise ValueError(f"Eje de giro no válido: {eje}")
            grados = articulacion["keyframes_grados"]
            if len(grados) < 2:
                raise ValueError("Cada articulación necesita al menos dos posiciones angulares.")
            pivote = [
                (float(articulacion["pivote_obj"][i]) * unidad_metros - origen[i]) * escala[i]
                for i in range(3)
            ]
            for pieza in articulacion["piezas"]:
                if pieza not in nombres_grupos:
                    raise ValueError(f"No existe el grupo OBJ indicado para mover: {pieza}")
                if pieza in piezas_usadas:
                    raise ValueError(f"La pieza aparece en más de un movimiento: {pieza}")
                piezas_usadas.add(pieza)
            articulaciones.append({
                "piezas": articulacion["piezas"], "eje": eje,
                "pivote_metros": pivote,
                "keyframes_grados": [float(angulo) for angulo in grados],
            })
        resultado.append({
            "nombre_animacion": movimiento["nombre_animacion"],
            "descripcion": movimiento.get("descripcion", movimiento["nombre_animacion"]),
            "inicio": movimiento.get("inicio", "Posición inicial"),
            "fin": movimiento.get("fin", "Posición final"),
            "duracion_segundos": duracion,
            "articulaciones": articulaciones,
        })
    return resultado


def cuaternion_eje_angulo(eje, grados):
    """Convierte un giro sobre un eje a cuaternión glTF (X,Y,Z,W)."""
    componentes = {"X": (1.0, 0.0, 0.0), "Y": (0.0, 1.0, 0.0),
                   "Z": (0.0, 0.0, 1.0)}[eje]
    medio = math.radians(grados) / 2
    seno = math.sin(medio)
    return [valor * seno for valor in componentes] + [math.cos(medio)]
