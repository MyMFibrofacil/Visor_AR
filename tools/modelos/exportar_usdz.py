"""Genera el paquete USDZ para Quick Look utilizando OpenUSD."""
from pxr import Usd, UsdGeom, UsdShade, Sdf, Gf, UsdUtils, Vt
from exportar_glb import COLOR_MDF
import shutil
import tempfile
from pathlib import Path


def exportar_usdz(cuerpos, destino, movimiento=None, material_config=None):
    """Escribe cuerpos en metros, eje Y vertical y material mate."""
    material_config = material_config or {}
    nombre_material = material_config.get("nombre", "MDF aproximado")
    color_material = material_config.get("color", COLOR_MDF)
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
    material = UsdShade.Material.Define(stage, f"/Producto/Looks/{nombre_material.replace(' ', '_')}")
    shader = UsdShade.Shader.Define(stage, f"/Producto/Looks/{nombre_material.replace(' ', '_')}/Shader")
    shader.CreateIdAttr("UsdPreviewSurface")
    shader.CreateInput("diffuseColor", Sdf.ValueTypeNames.Color3f).Set(Gf.Vec3f(*color_material))
    shader.CreateInput("roughness", Sdf.ValueTypeNames.Float).Set(material_config.get("roughness", 0.88))
    shader.CreateInput("metallic", Sdf.ValueTypeNames.Float).Set(0.0)
    material.CreateSurfaceOutput().ConnectToSource(shader.ConnectableAPI(), "surface")
    material_bordes = UsdShade.Material.Define(stage, '/Producto/Looks/Bordes')
    shader_bordes = UsdShade.Shader.Define(stage, '/Producto/Looks/Bordes/Shader')
    shader_bordes.CreateIdAttr('UsdPreviewSurface')
    shader_bordes.CreateInput('diffuseColor', Sdf.ValueTypeNames.Color3f).Set(Gf.Vec3f(0.001))
    shader_bordes.CreateInput('roughness', Sdf.ValueTypeNames.Float).Set(1.0)
    material_bordes.CreateSurfaceOutput().ConnectToSource(shader_bordes.ConnectableAPI(), 'surface')
    for nombre, cuerpo in cuerpos.items():
        malla = UsdGeom.Mesh.Define(stage, "/Producto/" + nombre)
        puntos = [Gf.Vec3f(*map(float, p)) for p in cuerpo["posiciones"]]
        malla.CreatePointsAttr(puntos)
        malla.CreateFaceVertexCountsAttr([3] * (len(puntos) // 3))
        malla.CreateFaceVertexIndicesAttr(list(range(len(puntos))))
        malla.CreateNormalsAttr([Gf.Vec3f(*map(float, n)) for n in cuerpo["normales"]])
        malla.SetNormalsInterpolation(UsdGeom.Tokens.vertex)
        malla.CreateSubdivisionSchemeAttr(UsdGeom.Tokens.none)
        malla.CreateDoubleSidedAttr(True)
        malla.CreateExtentAttr(UsdGeom.PointBased.ComputeExtent(Vt.Vec3fArray(puntos)))
        UsdShade.MaterialBindingAPI.Apply(malla.GetPrim()).Bind(
            material_bordes if cuerpo.get('material') == 'bordes' else material)
        if movimiento and nombre == movimiento["grupo"]:
            translate = malla.AddTranslateOp(UsdGeom.XformOp.PrecisionDouble)
            for nivel, alto in enumerate(movimiento["desplazamientos_metros"]):
                frame = nivel * movimiento["segundos_por_nivel"] * 24
                translate.Set(Gf.Vec3d(0, alto, 0), Usd.TimeCode(frame))
            frame_final = len(movimiento["desplazamientos_metros"]) * movimiento["segundos_por_nivel"] * 24
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
