/** Conecta los controles de la ficha al modelo 3D y a la sesión AR. */
export function iniciarControles(modelo, camara, apariencia) {
  const nota = document.querySelector('#nota-producto');
  const ar = document.querySelector('#ar-launch-btn');
  const volver = document.querySelector('#back-to-catalog');
  const inicio = new URL('../../', location.href);
  const orbitaInicial = modelo.getAttribute('camera-orbit');
  const mostrarNota = (mensaje) => { nota.textContent = `${apariencia} ${mensaje}`; };

  volver.addEventListener('click', () => { location.href = inicio.href; });
  document.querySelector('#reset-cam-btn').addEventListener('click', () => {
    modelo.cameraOrbit = orbitaInicial;
    modelo.cameraTarget = camara.objetivo;
    modelo.fieldOfView = camara.campo;
    modelo.resetTurntableRotation();
  });

  modelo.addEventListener('error', () => {
    mostrarNota('No se pudo cargar el modelo. Recargá la página para intentar otra vez.');
  });
  modelo.addEventListener('ar-status', ({ detail }) => {
    if (detail.status === 'failed') {
      mostrarNota('No se pudo iniciar la cámara. Revisá los permisos y abrí la página en Chrome o Safari.');
    } else if (detail.status === 'session-started') {
      mostrarNota('Mové el celular lentamente y apuntá al piso para colocar el producto.');
    }
  });
  ar.addEventListener('click', async () => {
    if (!modelo.canActivateAR) {
      mostrarNota('La realidad aumentada requiere un celular compatible y una conexión segura. Podés explorar el modelo 3D acá.');
      return;
    }
    try {
      await modelo.activateAR();
    } catch (error) {
      console.error('No se pudo iniciar AR:', error);
      mostrarNota('No se pudo iniciar la cámara. Revisá los permisos y volvé a intentarlo.');
    }
  });
}
