"""Convierte las unidades y centra la geometría según la configuración del producto."""
import numpy as np

def preparar_escena(cuerpos, unidad_metros, escala_ejes):
    """Convierte a metros, aplica la escala configurada y apoya el producto en Y=0."""
    todos = np.concatenate([c["posiciones"] for c in cuerpos.values()]) * unidad_metros
    minimo, maximo = todos.min(axis=0), todos.max(axis=0)
    origen = np.array([(minimo[0] + maximo[0]) / 2, minimo[1],
                       (minimo[2] + maximo[2]) / 2])
    escala = np.array(escala_ejes, dtype=float)
    for cuerpo in cuerpos.values():
        cuerpo["posiciones"] = ((cuerpo["posiciones"] * unidad_metros - origen) * escala).astype(np.float32)
        normales = cuerpo["normales"] / escala
        cuerpo["normales"] = (normales / np.linalg.norm(normales, axis=1)[:, None]).astype(np.float32)
    return {"dimensiones_modelo_mm": ((maximo - minimo) * escala * 1000).tolist(),
            "dimensiones_originales_mm": ((maximo - minimo) * 1000).tolist(),
            "origen_original_m": origen.tolist(), "escala_obj_a_metros": unidad_metros,
            "escala_ejes": escala.tolist(),
            "geometria": "Cuerpos conservados; escala por ejes según configuración del producto. Salientes incluidas."}
