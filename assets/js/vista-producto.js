/** Construye la presentación compartida de un producto a partir de sus datos. */
const logo = new URL('../img/logo.png', import.meta.url).href;

export function crearVistaProducto(contenedor, config) {
  contenedor.innerHTML = `
    <header><div class="marca"><img class="marca-logo" alt="Logo de la marca"><span id="marca-nombre"></span></div></header>
    <section class="escena">
      <model-viewer id="modelo" ar ar-modes="webxr scene-viewer quick-look" ar-scale="fixed" ar-placement="floor"
        camera-controls touch-action="pan-y" shadow-intensity="0.8" shadow-softness="0.8"
        exposure="1.1" interaction-prompt="auto" environment-image="neutral">
        <button slot="ar-button" class="boton-ar" id="boton-ar" type="button">Ver en mi espacio</button>
        <div slot="progress-bar" class="progreso" id="progreso" role="progressbar" aria-label="Carga del modelo" aria-valuemin="0" aria-valuemax="100"><span></span></div>
      </model-viewer>
      <div class="escena-controles"><span id="estado" role="status">Cargando modelo…</span><button id="restablecer" class="boton-secundario" type="button">Vista inicial</button></div>
    </section>
    <section class="informacion" aria-labelledby="titulo">
      <div><h1 id="titulo"></h1><p class="instruccion">Giralo para explorar sus detalles. Desde un celular compatible, colocalo en tu espacio a tamaño real.</p></div>
      <dl class="medidas"></dl>
      <p class="nota"></p>
      <p id="ayuda-ar" class="ayuda">En el celular, tocá “Ver en mi espacio” y apuntá la cámara al piso.</p>
    </section>`;
  contenedor.querySelector('.marca-logo').src = logo;
  contenedor.querySelector('#marca-nombre').textContent = config.nombre.toUpperCase();
  contenedor.querySelector('#titulo').textContent = config.nombre;
  contenedor.querySelector('.nota').textContent = config.apariencia;
  contenedor.querySelector('.escena').setAttribute('aria-label', `Modelo tridimensional de ${config.nombre}`);
  for (const [clave, etiqueta] of [['ancho','Ancho'], ['alto','Alto'], ['profundidad','Profundidad']]) {
    const grupo = document.createElement('div');
    const termino = document.createElement('dt');
    termino.textContent = etiqueta;
    const valor = document.createElement('dd');
    valor.append(`${Math.round(config.medidas_mm[clave])} `);
    const unidad = document.createElement('span');
    unidad.textContent = 'mm';
    valor.append(unidad);
    grupo.append(termino, valor);
    contenedor.querySelector('.medidas').append(grupo);
  }
  const modelo = contenedor.querySelector('#modelo');
  modelo.setAttribute('alt', config.descripcion);
  modelo.setAttribute('poster', new URL(config.archivos.poster, location.href).href);
  modelo.setAttribute('ios-src', new URL(config.archivos.usdz, location.href).href);
  for (const [atributo, clave] of [['camera-orbit','orbita'], ['camera-target','objetivo'], ['field-of-view','campo'], ['min-camera-orbit','minimo'], ['max-camera-orbit','maximo']]) {
    modelo.setAttribute(atributo, config.camara[clave]);
  }
  document.title = `${config.nombre} · Ver en tu espacio`;
  return modelo;
}
