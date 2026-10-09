"""Valida y prepara pivotes de animación en el sistema de coordenadas del visor."""
import math


def preparar_movimientos(configuracion, unidad_metros, origen_metros,
                         escala_ejes, nombres_grupos, rotacion_y_grados=0):
    """Convierte articulaciones descritas en OBJ a coordenadas finales en metros."""
    resultado = []
    piezas_usadas = set()
    origen = origen_metros
    escala = escala_ejes
    angulo = math.radians(rotacion_y_grados)
    coseno, seno = math.cos(angulo), math.sin(angulo)

    def transformar_punto(punto):
        x, y, z = (float(valor) * unidad_metros for valor in punto)
        rotado = [coseno * x + seno * z, y, -seno * x + coseno * z]
        return [(rotado[i] - origen[i]) * escala[i] for i in range(3)]

    for movimiento in configuracion or []:
        articulaciones = []
        duracion = float(movimiento.get("duracion_segundos", 1.0))
        if duracion <= 0:
            raise ValueError(f"La duración debe ser positiva: {movimiento['nombre_animacion']}")
        for articulacion in movimiento["articulaciones"]:
            tiene_giro = "keyframes_grados" in articulacion
            tiene_desplazamiento = "desplazamientos_obj" in articulacion
            if tiene_giro == tiene_desplazamiento:
                raise ValueError("Cada articulación debe definir giro o desplazamiento.")
            datos_articulacion = {"piezas": articulacion["piezas"]}
            if tiene_giro:
                eje = articulacion["eje"].upper()
                if eje not in {"X", "Y", "Z"}:
                    raise ValueError(f"Eje de giro no válido: {eje}")
                grados = articulacion["keyframes_grados"]
                if len(grados) < 2:
                    raise ValueError("Cada articulación necesita al menos dos posiciones angulares.")
                datos_articulacion.update(
                    eje=eje, pivote_metros=transformar_punto(articulacion["pivote_obj"]),
                    keyframes_grados=[float(angulo) for angulo in grados])
            else:
                desplazamientos = articulacion["desplazamientos_obj"]
                if len(desplazamientos) < 2:
                    raise ValueError("Cada articulación necesita al menos dos posiciones.")
                def transformar_vector(vector):
                    x, y, z = (float(valor) * unidad_metros for valor in vector)
                    rotado = [coseno * x + seno * z, y, -seno * x + coseno * z]
                    return [rotado[i] * escala[i] for i in range(3)]
                datos_articulacion["desplazamientos_metros"] = [
                    transformar_vector(vector) for vector in desplazamientos]
            for pieza in articulacion["piezas"]:
                if pieza not in nombres_grupos:
                    raise ValueError(f"No existe el grupo OBJ indicado para mover: {pieza}")
                if pieza in piezas_usadas:
                    raise ValueError(f"La pieza aparece en más de un movimiento: {pieza}")
                piezas_usadas.add(pieza)
            articulaciones.append(datos_articulacion)
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
