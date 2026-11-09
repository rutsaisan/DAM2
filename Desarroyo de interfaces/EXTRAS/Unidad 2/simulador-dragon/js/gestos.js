// =========================================================
// gestos.js
// Lee la mano con la cámara (MediaPipe Gesture Recognizer)
// o, si no hay cámara, la simula con el teclado y el ratón.
// Siempre devuelve el mismo objeto "mano", así el resto del
// programa no tiene que saber de dónde vienen los datos.
// =========================================================

const VERSION_MP = '0.10.14';
const URL_MP = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION_MP}`;
const URL_MODELO =
  'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';

// Gestos que reconoce el modelo de MediaPipe sin entrenar nada
export const NOMBRES = {
  None: 'Sin gesto',
  Open_Palm: 'Mano abierta',
  Closed_Fist: 'Puño cerrado',
  Pointing_Up: 'Índice arriba',
  Thumb_Up: 'Pulgar arriba',
  Thumb_Down: 'Pulgar abajo',
  Victory: 'Victoria',
  ILoveYou: 'Cuernos',
};

export const ICONOS = {
  None: '·',
  Open_Palm: '✋',
  Closed_Fist: '✊',
  Pointing_Up: '☝️',
  Thumb_Up: '👍',
  Thumb_Down: '👎',
  Victory: '✌️',
  ILoveYou: '🤟',
};

// Teclas que imitan cada gesto en el modo teclado
const TECLAS = {
  '1': 'Open_Palm',
  '2': 'Closed_Fist',
  '3': 'Pointing_Up',
  '4': 'Thumb_Up',
  '5': 'Thumb_Down',
  '6': 'Victory',
};

export class Gestos {
  constructor(video, lienzoMano) {
    this.video = video;
    this.lienzo = lienzoMano;
    this.ctx = lienzoMano.getContext('2d');
    this.modo = null;               // 'camara' o 'teclado'

    // Lo que ve el resto del programa
    this.mano = {
      hayMano: false,
      gesto: 'None',
      confianza: 0,
      x: 0.5,                       // 0 = izquierda, 1 = derecha (ya en espejo)
      y: 0.5,                       // 0 = arriba,    1 = abajo
      quieta: false,
    };

    this._candidato = 'None';
    this._repeticiones = 0;
    this._historial = [];
    this._ultimoTiempoVideo = -1;
    this._ultimoCrudo = { hayMano: false, gesto: 'None', confianza: 0, x: 0.5, y: 0.5 };

    // Modo teclado
    this._teclaGesto = null;
    this._raton = { x: 0.5, y: 0.5, dentro: false };
  }

  // ---------- Cámara + MediaPipe ----------
  async iniciarCamara(informar = () => {}) {
    informar('Cargando el reconocedor de gestos…');
    const mp = await import(`${URL_MP}`);
    this._mp = mp;
    const archivos = await mp.FilesetResolver.forVisionTasks(`${URL_MP}/wasm`);

    const opciones = (delegate) => ({
      baseOptions: { modelAssetPath: URL_MODELO, delegate },
      runningMode: 'VIDEO',
      numHands: 1,
    });
    try {
      this.reconocedor = await mp.GestureRecognizer.createFromOptions(archivos, opciones('GPU'));
    } catch {
      // Algunos ordenadores no tienen GPU disponible para el navegador
      this.reconocedor = await mp.GestureRecognizer.createFromOptions(archivos, opciones('CPU'));
    }

    informar('Pidiendo permiso para usar la cámara…');
    const flujo = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: 'user' },
      audio: false,
    });
    this.video.srcObject = flujo;
    await this.video.play();
    this.lienzo.width = this.video.videoWidth || 640;
    this.lienzo.height = this.video.videoHeight || 480;
    this.dibujo = new mp.DrawingUtils(this.ctx);
    this.modo = 'camara';
  }

  // ---------- Teclado + ratón ----------
  activarTeclado(zonaRaton) {
    this.modo = 'teclado';
    window.addEventListener('keydown', (e) => {
      if (TECLAS[e.key]) this._teclaGesto = TECLAS[e.key];
    });
    window.addEventListener('keyup', (e) => {
      if (TECLAS[e.key] === this._teclaGesto) this._teclaGesto = null;
    });
    zonaRaton.addEventListener('pointermove', (e) => {
      const r = zonaRaton.getBoundingClientRect();
      this._raton.x = (e.clientX - r.left) / r.width;
      this._raton.y = (e.clientY - r.top) / r.height;
      this._raton.dentro = true;
    });
    zonaRaton.addEventListener('pointerleave', () => { this._raton.dentro = false; });
  }

  // Se llama una vez por fotograma. Devuelve el objeto "mano".
  actualizar() {
    let crudo;
    if (this.modo === 'camara') {
      crudo = this._leerCamara();
    } else if (this.modo === 'teclado') {
      crudo = {
        hayMano: this._raton.dentro || this._teclaGesto !== null,
        gesto: this._teclaGesto ?? 'None',
        confianza: this._teclaGesto ? 1 : 0,
        x: this._raton.x,
        y: this._raton.y,
      };
    } else {
      return this.mano;
    }
    this._procesar(crudo);
    return this.mano;
  }

  _leerCamara() {
    // Solo analizamos cuando hay un fotograma nuevo del vídeo
    if (this.video.readyState < 2 || this.video.currentTime === this._ultimoTiempoVideo) {
      return this._ultimoCrudo;
    }
    this._ultimoTiempoVideo = this.video.currentTime;

    const res = this.reconocedor.recognizeForVideo(this.video, performance.now());
    this.ctx.clearRect(0, 0, this.lienzo.width, this.lienzo.height);

    let crudo = { hayMano: false, gesto: 'None', confianza: 0, x: this.mano.x, y: this.mano.y };

    if (res.landmarks && res.landmarks.length > 0) {
      const puntos = res.landmarks[0];
      // Dibujamos el esqueleto de la mano sobre el vídeo
      this.dibujo.drawConnectors(puntos, this._mp.GestureRecognizer.HAND_CONNECTIONS,
        { color: '#e8c98a', lineWidth: 3 });
      this.dibujo.drawLandmarks(puntos, { color: '#8c2a1c', lineWidth: 1, radius: 3 });

      // Centro de la palma: media entre la muñeca (0) y la base del dedo corazón (9)
      const cx = (puntos[0].x + puntos[9].x) / 2;
      const cy = (puntos[0].y + puntos[9].y) / 2;

      const mejor = res.gestures?.[0]?.[0];
      crudo = {
        hayMano: true,
        gesto: mejor && mejor.score > 0.5 ? mejor.categoryName : 'None',
        confianza: mejor ? mejor.score : 0,
        x: 1 - cx,            // espejo: si mueves la mano a tu derecha, va a la derecha
        y: cy,
      };
    }
    this._ultimoCrudo = crudo;
    return crudo;
  }

  _procesar(crudo) {
    // 1) Estabilizar el gesto: tiene que repetirse varios fotogramas seguidos
    if (crudo.gesto === this._candidato) this._repeticiones++;
    else { this._candidato = crudo.gesto; this._repeticiones = 1; }
    const necesarias = this.modo === 'camara' ? 4 : 1;
    if (this._repeticiones >= necesarias) this.mano.gesto = this._candidato;
    if (!crudo.hayMano) this.mano.gesto = 'None';

    // 2) Suavizar la posición para que no tiemble
    this.mano.x += (crudo.x - this.mano.x) * 0.35;
    this.mano.y += (crudo.y - this.mano.y) * 0.35;
    this.mano.hayMano = crudo.hayMano;
    this.mano.confianza = crudo.confianza;

    // 3) ¿Está la mano quieta? Miramos cuánto se ha movido últimamente
    this._historial.push({ x: crudo.x, y: crudo.y });
    if (this._historial.length > 15) this._historial.shift();
    const mx = this._historial.reduce((s, p) => s + p.x, 0) / this._historial.length;
    const my = this._historial.reduce((s, p) => s + p.y, 0) / this._historial.length;
    const maxDist = Math.max(...this._historial.map((p) => Math.hypot(p.x - mx, p.y - my)));
    this.mano.quieta = crudo.hayMano && maxDist < 0.03;
  }
}
