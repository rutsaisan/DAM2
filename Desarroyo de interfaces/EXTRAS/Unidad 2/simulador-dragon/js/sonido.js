// =========================================================
// sonido.js
// Todos los sonidos se generan con la Web Audio API, sin archivos:
// ruido filtrado para el viento y las alas, osciladores para el
// rugido, el ronroneo y las notas de "¡conseguido!".
// El navegador solo deja empezar el audio después de un clic,
// por eso hay que llamar a iniciar() desde un botón.
// =========================================================

export class Sonido {
  constructor() {
    this.ctx = null;
    this.activo = true;
  }

  iniciar() {
    if (this.ctx) { this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.maestro = this.ctx.createGain();
    this.maestro.gain.value = 0.8;
    this.maestro.connect(this.ctx.destination);

    // Ruido blanco que se reutiliza en varios sonidos
    const n = this.ctx.sampleRate * 2;
    this.ruido = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const datos = this.ruido.getChannelData(0);
    for (let i = 0; i < n; i++) datos[i] = Math.random() * 2 - 1;

    // Viento continuo: ruido -> filtro paso banda -> volumen
    const fuente = this.ctx.createBufferSource();
    fuente.buffer = this.ruido;
    fuente.loop = true;
    this.filtroViento = this.ctx.createBiquadFilter();
    this.filtroViento.type = 'bandpass';
    this.filtroViento.frequency.value = 500;
    this.filtroViento.Q.value = 0.7;
    this.volViento = this.ctx.createGain();
    this.volViento.gain.value = 0;
    fuente.connect(this.filtroViento).connect(this.volViento).connect(this.maestro);
    fuente.start();
  }

  silenciar(silencio) {
    this.activo = !silencio;
    if (this.maestro) this.maestro.gain.setTargetAtTime(silencio ? 0 : 0.8, this.ctx.currentTime, 0.05);
  }

  get listo() { return this.ctx && this.ctx.state === 'running'; }

  // nivel: 0 (calma) a 1 (volando a toda velocidad)
  viento(nivel) {
    if (!this.listo) return;
    const ahora = this.ctx.currentTime;
    this.volViento.gain.setTargetAtTime(0.02 + nivel * 0.22, ahora, 0.3);
    this.filtroViento.frequency.setTargetAtTime(350 + nivel * 900, ahora, 0.3);
  }

  // ---------- Piezas básicas ----------
  _ruidoCorto({ duracion, tipo, frecuencia, frecuenciaFinal, volumen, q = 1 }) {
    if (!this.listo) return;
    const ahora = this.ctx.currentTime;
    const fuente = this.ctx.createBufferSource();
    fuente.buffer = this.ruido;
    const filtro = this.ctx.createBiquadFilter();
    filtro.type = tipo;
    filtro.Q.value = q;
    filtro.frequency.setValueAtTime(frecuencia, ahora);
    if (frecuenciaFinal) filtro.frequency.exponentialRampToValueAtTime(frecuenciaFinal, ahora + duracion);
    const vol = this.ctx.createGain();
    vol.gain.setValueAtTime(0.0001, ahora);
    vol.gain.exponentialRampToValueAtTime(volumen, ahora + duracion * 0.15);
    vol.gain.exponentialRampToValueAtTime(0.0001, ahora + duracion);
    fuente.connect(filtro).connect(vol).connect(this.maestro);
    fuente.start(ahora, Math.random());
    fuente.stop(ahora + duracion + 0.05);
  }

  _nota(frecuencia, inicio, duracion, tipo = 'triangle', volumen = 0.15) {
    if (!this.listo) return;
    const t0 = this.ctx.currentTime + inicio;
    const osc = this.ctx.createOscillator();
    osc.type = tipo;
    osc.frequency.value = frecuencia;
    const vol = this.ctx.createGain();
    vol.gain.setValueAtTime(0.0001, t0);
    vol.gain.exponentialRampToValueAtTime(volumen, t0 + 0.02);
    vol.gain.exponentialRampToValueAtTime(0.0001, t0 + duracion);
    osc.connect(vol).connect(this.maestro);
    osc.start(t0);
    osc.stop(t0 + duracion + 0.05);
  }

  // Voz grave del dragón: oscilador de sierra que baja de tono + ruido
  _voz({ duracion, desde, hasta, volumen, corte }) {
    if (!this.listo) return;
    const ahora = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(desde, ahora);
    osc.frequency.exponentialRampToValueAtTime(hasta, ahora + duracion);

    // Vibrato para que suene más vivo
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 18;
    const lfoVol = this.ctx.createGain();
    lfoVol.gain.value = desde * 0.08;
    lfo.connect(lfoVol).connect(osc.frequency);

    const filtro = this.ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = corte;
    const vol = this.ctx.createGain();
    vol.gain.setValueAtTime(0.0001, ahora);
    vol.gain.exponentialRampToValueAtTime(volumen, ahora + 0.12);
    vol.gain.exponentialRampToValueAtTime(0.0001, ahora + duracion);
    osc.connect(filtro).connect(vol).connect(this.maestro);
    osc.start(ahora); lfo.start(ahora);
    osc.stop(ahora + duracion + 0.05); lfo.stop(ahora + duracion + 0.05);
    this._ruidoCorto({ duracion, tipo: 'lowpass', frecuencia: corte * 1.5, volumen: volumen * 0.6 });
  }

  // ---------- Sonidos del simulador ----------
  pagina()   { this._ruidoCorto({ duracion: 0.35, tipo: 'highpass', frecuencia: 1200, frecuenciaFinal: 4000, volumen: 0.25 }); }
  aleteo()   { this._ruidoCorto({ duracion: 0.35, tipo: 'lowpass', frecuencia: 420, frecuenciaFinal: 120, volumen: 0.5 }); }
  exito()    { [523, 659, 784].forEach((f, i) => this._nota(f, i * 0.09, 0.4)); }
  aro()      { [784, 988, 1319].forEach((f, i) => this._nota(f, i * 0.06, 0.35, 'sine', 0.18)); }
  grunido()  { this._voz({ duracion: 0.6, desde: 110, hasta: 80, volumen: 0.35, corte: 600 }); }
  rugido()   { this._voz({ duracion: 1.6, desde: 160, hasta: 55, volumen: 0.5, corte: 1100 }); }

  // Ronroneo: tono muy grave que sube y baja de volumen rápido
  ronroneo() {
    if (!this.listo) return;
    const ahora = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.frequency.value = 55;
    const trem = this.ctx.createOscillator();
    trem.frequency.value = 22;
    const tremVol = this.ctx.createGain();
    tremVol.gain.value = 0.15;
    const vol = this.ctx.createGain();
    vol.gain.setValueAtTime(0.0001, ahora);
    vol.gain.exponentialRampToValueAtTime(0.2, ahora + 0.3);
    vol.gain.exponentialRampToValueAtTime(0.0001, ahora + 1.8);
    trem.connect(tremVol).connect(vol.gain);
    osc.connect(vol).connect(this.maestro);
    osc.start(ahora); trem.start(ahora);
    osc.stop(ahora + 1.9); trem.stop(ahora + 1.9);
  }
}
