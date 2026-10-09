"""Genera la presentación del combo con una silla retirada de la mesa."""

import argparse
import hashlib
import json
from pathlib import Path

import numpy as np

from exportar_glb import exportar_glb
from exportar_usdz import exportar_usdz
from generar_bordes import agregar_bordes
from leer_obj import leer_cuerpos
from preparar_escena import preparar_escena


GRUPOS_SILLA_DERECHA = {f"Cuerpo{numero}" for numero in range(38, 42)}
DESPLAZAMIENTO_X_CM = 42.0


def separar_silla(cuerpos):
    """Mueve la silla derecha 42 cm al costado sin alterar mesa ni segunda silla."""
    if not GRUPOS_SILLA_DERECHA.issubset(cuerpos):
        faltantes = sorted(GRUPOS_SILLA_DERECHA - cuerpos.keys())
        raise ValueError(f"Faltan cuerpos de la silla derecha: {', '.join(faltantes)}")
    for nombre in GRUPOS_SILLA_DERECHA:
        cuerpos[nombre]["posiciones"] += np.array([DESPLAZAMIENTO_X_CM, 0, 0])


def generar(origen: Path, destino: Path):
    """Exporta GLB, USDZ y metadatos de la segunda presentación."""
    config = json.loads((destino / "producto.json").read_text(encoding="utf-8"))
    presentacion = config["presentaciones"][1]
    conversion = config["conversion"]
    cuerpos = leer_cuerpos(origen)
    separar_silla(cuerpos)
    resumen = preparar_escena(cuerpos, conversion["unidad_obj_metros"], conversion["escala_ejes"])
    escena, bordes = agregar_bordes(cuerpos, conversion["radio_borde_metros"], conversion["angulo_borde_grados"])
    exportar_glb(escena, destino / presentacion["archivos"]["glb"])
    exportar_usdz(escena, destino / presentacion["archivos"]["usdz"])
    resumen.update(
        cuerpos=len(cuerpos),
        triangulos=sum(len(c["posiciones"]) // 3 for c in cuerpos.values()),
        segmentos_bordes=bordes,
        fuente_sha256=hashlib.sha256(origen.read_bytes()).hexdigest(),
        transformacion={"grupos": sorted(GRUPOS_SILLA_DERECHA), "desplazamiento_x_cm": DESPLAZAMIENTO_X_CM},
        referencia_visual="Mesa y Sillas 2.png",
        validacion_celular="Pendiente",
    )
    (destino / "modelo-una-afuera-metadata.json").write_text(
        json.dumps(resumen, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return resumen


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--obj", required=True, type=Path)
    parser.add_argument("--producto", required=True, type=Path)
    args = parser.parse_args()
    print(json.dumps(generar(args.obj.resolve(), args.producto.resolve()), ensure_ascii=False))
