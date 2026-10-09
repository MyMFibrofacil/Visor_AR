/** Conecta los controles de la ficha al modelo 3D y a la sesión AR. */
export function iniciarControles(modelo, camara, apariencia, archivosAR) {
  const nota = document.querySelector('#nota-producto');
  const ar = document.querySelector('#ar-launch-btn');
  const volver = document.querySelector('#back-to-catalog');
  const inicio = new URL('../../', location.href);
  const mostrarNota = (mensaje) => { nota.textContent = `${apariencia} ${mensaje}`; };

  volver.addEventListener('click', () => { location.href = inicio.href; });
  document.querySelector('#reset-cam-btn').addEventListener('click', () => {
    modelo.cameraOrbit = modelo.getAttribute('camera-orbit');
    modelo.cameraTarget = camara.objetivo;
    modelo.fieldOfView = camara.campo;
    modelo.resetTurntableRotation();
  });

  modelo.addEventListener('error', () => {
    mostrarNota('No se pudo cargar el modelo. Recargá la página para intentar otra vez.');
    if (arPreparando) restaurarVista();
  });
  const fuentesVista = {
    glb: new URL(modelo.getAttribute('src'), location.href).href,
    usdz: new URL(modelo.getAttribute('ios-src'), location.href).href,
  };
  let arPreparando = false;
  let arIniciado = false;
  let restauracionPendiente = false;

  function restaurarVista() {
    if (!restauracionPendiente && !arPreparando) return;
    restauracionPendiente = false;
    arPreparando = false;
    arIniciado = false;
    modelo.setAttribute('ios-src', fuentesVista.usdz);
    modelo.setAttribute('src', fuentesVista.glb);
  }

  modelo.addEventListener('load', () => {
    if (!arPreparando) return;
    arPreparando = false;
    arIniciado = true;
    restauracionPendiente = true;
    modelo.activateAR().catch(error => {
      console.error('No se pudo iniciar AR:', error);
      mostrarNota('No se pudo iniciar la cámara. Revisá los permisos y volvé a intentarlo.');
      restaurarVista();
    });
  });
  modelo.addEventListener('ar-status', ({ detail }) => {
    if (detail.status === 'failed') {
      mostrarNota('No se pudo iniciar la cámara. Revisá los permisos y abrí la página en Chrome o Safari.');
      if (arPreparando || arIniciado) restaurarVista();
    } else if (detail.status === 'session-started') {
      mostrarNota('Mové el celular lentamente y apuntá al piso para colocar el producto.');
      arIniciado = true;
    } else if (detail.status === 'not-presenting' && arIniciado) {
      restaurarVista();
    }
  });
  window.addEventListener('pageshow', restaurarVista);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && arIniciado) restaurarVista();
  });
  ar.addEventListener('click', async () => {
    if (!modelo.canActivateAR) {
      mostrarNota('La realidad aumentada requiere un celular compatible y una conexión segura. Podés explorar el modelo 3D acá.');
      return;
    }
    try {
      if (archivosAR) {
        arPreparando = true;
        modelo.setAttribute('ios-src', archivosAR.usdz);
        modelo.setAttribute('src', archivosAR.glb);
        return;
      }
      await modelo.activateAR();
    } catch (error) {
      console.error('No se pudo iniciar AR:', error);
      mostrarNota('No se pudo iniciar la cámara. Revisá los permisos y volvé a intentarlo.');
      restaurarVista();
    }
  });
}
