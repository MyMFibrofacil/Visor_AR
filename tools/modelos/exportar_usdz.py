"""Genera USDZ y asigna cada cara al material nombrado en el OBJ de Fusion."""
from pathlib import Path
import shutil
import tempfile

from pxr import Usd, UsdGeom, UsdShade, Sdf, Gf, UsdUtils, Vt, Tf


def exportar_usdz(cuerpos, destino, movimiento=None, material=None, materiales=None):
    """Escribe la geometría y sus materiales por pieza en un paquete USDZ."""
    material = material or {}
    materiales = materiales or {}
    carpeta_temporal = Path(tempfile.mkdtemp(prefix="producto-usd-"))
    temporal = carpeta_temporal / "producto.usdc"
    stage = Usd.Stage.CreateNew(str(temporal))
    UsdGeom.SetStageUpAxis(stage, UsdGeom.Tokens.y)
    UsdGeom.SetStageMetersPerUnit(stage, 1.0)
    if movimiento:
        fps = 24
        stage.SetStartTimeCode(0)
        stage.SetEndTimeCode(len(movimiento["desplazamientos_metros"]) *
                             movimiento["segundos_por_nivel"] * fps)
        stage.SetTimeCodesPerSecond(fps)
        stage.SetInterpolationType(Usd.InterpolationTypeHeld)

    raiz = UsdGeom.Xform.Define(stage, "/Producto")
    stage.SetDefaultPrim(raiz.GetPrim())
    rutas_materiales = {}
    definiciones_materiales = materiales
    if material:
        nombre_global = material.get("nombre", "MDF aproximado")
        definiciones_materiales = {
            nombre_global: {"color": material.get("color", [0.52, 0.34, 0.18]),
                            "roughness": material.get("roughness", 0.88)},
            "bordes": materiales.get("bordes", {
                "color": [0.001, 0.001, 0.001], "roughness": 1.0}),
        }
    for indice, (nombre, datos) in enumerate(definiciones_materiales.items()):
        identificador = f"Material_{indice}_{Tf.MakeValidIdentifier(nombre)}"
        material_usd = UsdShade.Material.Define(stage, f"/Producto/Looks/{identificador}")
        shader = UsdShade.Shader.Define(stage, f"/Producto/Looks/{identificador}/Shader")
        shader.CreateIdAttr("UsdPreviewSurface")
        shader.CreateInput("diffuseColor", Sdf.ValueTypeNames.Color3f).Set(
            Gf.Vec3f(*datos["color"]))
        shader.CreateInput("roughness", Sdf.ValueTypeNames.Float).Set(datos["roughness"])
        shader.CreateInput("metallic", Sdf.ValueTypeNames.Float).Set(0.0)
        material_usd.CreateSurfaceOutput().ConnectToSource(shader.ConnectableAPI(), "surface")
        rutas_materiales[nombre] = material_usd
    if material:
        for nombre in materiales:
            if nombre != "bordes":
                rutas_materiales[nombre] = rutas_materiales[material.get("nombre", "MDF aproximado")]

    for indice_cuerpo, (nombre, cuerpo) in enumerate(cuerpos.items()):
        ruta_grupo = f"/Producto/Pieza_{indice_cuerpo}_{Tf.MakeValidIdentifier(nombre)}"
        grupo = UsdGeom.Xform.Define(stage, ruta_grupo)
        posiciones = cuerpo["posiciones"].reshape(-1, 3, 3)
        normales = cuerpo["normales"].reshape(-1, 3, 3)
        material_por_cara = cuerpo.get("material_por_cara")
        if material_por_cara is None:
            material_por_cara = [cuerpo.get("material", "(sin material)")] * len(posiciones)
        grupos_materiales = {}
        for cara, nombre_material in enumerate(material_por_cara):
            if cuerpo.get("material") == "bordes":
                nombre_material = "bordes"
            elif material:
                nombre_material = material.get("nombre", "MDF aproximado")
            grupos_materiales.setdefault(nombre_material, []).append(cara)

        for indice_material, (nombre_material, caras) in enumerate(grupos_materiales.items()):
            ruta_malla = f"{ruta_grupo}/Superficie_{indice_material}"
            malla = UsdGeom.Mesh.Define(stage, ruta_malla)
            puntos = [Gf.Vec3f(*map(float, punto)) for punto in posiciones[caras].reshape(-1, 3)]
            normales_malla = [Gf.Vec3f(*map(float, normal))
                              for normal in normales[caras].reshape(-1, 3)]
            malla.CreatePointsAttr(puntos)
            malla.CreateFaceVertexCountsAttr([3] * (len(puntos) // 3))
            malla.CreateFaceVertexIndicesAttr(list(range(len(puntos))))
            malla.CreateNormalsAttr(normales_malla)
            malla.SetNormalsInterpolation(UsdGeom.Tokens.vertex)
            malla.CreateSubdivisionSchemeAttr(UsdGeom.Tokens.none)
            malla.CreateDoubleSidedAttr(True)
            malla.CreateExtentAttr(UsdGeom.PointBased.ComputeExtent(Vt.Vec3fArray(puntos)))
            UsdShade.MaterialBindingAPI.Apply(malla.GetPrim()).Bind(
                rutas_materiales[nombre_material])

        if movimiento and nombre == movimiento["grupo"]:
            translate = grupo.AddTranslateOp(UsdGeom.XformOp.PrecisionDouble)
            for nivel, alto in enumerate(movimiento["desplazamientos_metros"]):
                frame = nivel * movimiento["segundos_por_nivel"] * 24
                translate.Set(Gf.Vec3d(0, alto, 0), Usd.TimeCode(frame))
            frame_final = len(movimiento["desplazamientos_metros"]) * \
                movimiento["segundos_por_nivel"] * 24
            translate.Set(Gf.Vec3d(0, movimiento["desplazamientos_metros"][-1], 0),
                          Usd.TimeCode(frame_final))

    if movimiento and movimiento["grupo"] not in cuerpos:
        raise ValueError(f"El grupo móvil no existe en el OBJ: {movimiento['grupo']}")
    stage.GetRootLayer().Save()
    paquete = carpeta_temporal / "producto.usdz"
    if not UsdUtils.CreateNewUsdzPackage(Sdf.AssetPath(str(temporal)), str(paquete)):
        raise RuntimeError("No se pudo crear el paquete USDZ.")
    shutil.copyfile(paquete, destino)
    del stage
    shutil.rmtree(carpeta_temporal)
