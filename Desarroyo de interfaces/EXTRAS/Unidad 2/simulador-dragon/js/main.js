// =========================================================
// main.js
// Une todas las piezas: el mundo 3D, el dragón, los gestos y
// la libreta. Cada paso del cuaderno es un objeto con:
//   iniciar()            -> prepara la escena para ese paso
//   actualizar(dt, mano) -> devuelve true cuando el paso se ha completado
//   alCompletar()        -> lo que pasa justo al terminarlo
// =========================================================
import * as THREE from 'three';
import { crearMundo, crearAro, crearIslote, ALTURA_ISLOTE } from './escena.js';
import { crearDragon, crearSilla } from './dragon.js';
import { Gestos, NOMBRES, ICONOS } from './gestos.js';
import { Libreta } from './libreta.js';
import { Sonido } from './sonido.js';
import { cargarDragonModelo } from './dragon-modelo.js';
import { CONFIG } from './config.js';

// ---------- Utilidades ----------
const $ = (id) => document.getElementById(id);
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * t;
const suave = (dt, rapidez) => 1 - Math.exp(-dt * rapidez);   // suavizado independiente de los FPS
const difAngulo = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

// ---------- Mundo 3D ----------
const contenedor = $('simulador');
const mundo = crearMundo($('lienzo3d'));
const { escena, camara, renderer, sol } = mundo;

mundo.cargarCielo(CONFIG.cielo);

// Empezamos con el dragón de figuras y, si hay un modelo descargado,
// lo cambiamos en cuanto termine de cargar.
let dragon = crearDragon();
escena.add(dragon.raiz);
cargarDragonModelo(CONFIG.dragon).then((nuevo) => {
  if (!nuevo) return;
  nuevo.raiz.position.copy(dragon.raiz.position);
  nuevo.raiz.rotation.copy(dragon.raiz.rotation);
  escena.remove(dragon.raiz);
  escena.add(nuevo.raiz);
  dragon = nuevo;
  if (sillaPuesta) {
    dragon.cuerpo.add(silla);
    silla.position.copy(dragon.puntoLomo);
  }
});

const silla = crearSilla();
const SILLA_INICIO = new THREE.Vector3(-7, 0.95, 5);
escena.add(silla);

const aro = crearAro();
aro.visible = false;
escena.add(aro);

const islote = crearIslote();
islote.visible = false;
escena.add(islote);

new ResizeObserver(() => mundo.redimensionar(contenedor.clientWidth, contenedor.clientHeight))
  .observe(contenedor);

// ---------- Entrada y libreta ----------
const gestos = new Gestos($('video'), $('lienzoMano'));
const libreta = new Libreta($('pagina'));
const sonido = new Sonido();

// ---------- Estado del simulador ----------
const animDragon = { aleteo: 0, agachado: 0, cabezaAdelante: 0, enfado: 0, mirarX: 0, andar: 0 };
const objDragon = { ...animDragon };   // valores objetivo (se suavizan)
let rumboSuelo = 0;                    // hacia dónde mira el dragón en el suelo
let zSuelo = 0;                        // cuánto se acerca hacia ti

const camPos = new THREE.Vector3(7, 3, 22);
const camMira = new THREE.Vector3(0, 2, 0);
const objCamPos = camPos.clone();
const objCamMira = camMira.clone();
let modoCamara = 'suelo';              // 'suelo' o 'jinete'
camara.position.copy(camPos);

const vuelo = {
  activo: false, modo: 'despegue',     // despegue | libre | aterrizaje | posado
  rumbo: Math.PI, altura: 0, alturaObjetivo: 0, alturaInicial: 0,
  velocidad: 0, alabeo: 0, cabeceo: 0, arranque: 0,
  pos: new THREE.Vector3(),
};

let indice = 0;
let progreso = 0;
let completado = false;
let espera = 0;
let tiempoInicio = 0;
const completados = new Set();

// Variables del paso de la silla
let sillaP = 0;
let sillaAgarrada = false;
let sillaPuesta = false;
let arosPasados = 0;
let ultimoGrunido = 0;
let temporizadorAla = 0;

// Va sumando mientras se cumple la condición y bajando cuando no
function mantener(condicion, dt, segundos, caida = 0.6) {
  progreso = condicion ? progreso + dt / segundos : progreso - dt * caida;
  progreso = clamp(progreso);
  return progreso >= 1;
}

// ---------- Mensajes ----------
let temporizadorAviso = null;
function aviso(texto, ms = 1800) {
  const el = $('aviso');
  el.innerHTML = texto;
  el.classList.add('visible');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => el.classList.remove('visible'), ms);
}

// =========================================================
// LOS PASOS DEL CUADERNO
// =========================================================
const CAM_LEJOS = new THREE.Vector3(7, 3, 22);
const CAM_CERCA = new THREE.Vector3(1.5, 2.1, 11.5);

const pasos = [
  {
    tipo: 'portada',
    corto: 'Portada',
    titulo: 'El Cuaderno del Jinete',
    notas: [
      'Propiedad de un aprendiz de jinete.',
      'Aquí apunto todo lo que he aprendido para montar a <strong>Brasa</strong>, la dragona de escamas rojas de la isla.',
      'Si alguien encuentra este cuaderno: no intentéis nada sin leer cada página.',
    ],
    gesto: 'Thumb_Up',
    como: 'Mantén el pulgar arriba un segundo para abrir el cuaderno.',
    boton: 'Abrir el cuaderno',
    iniciar() {
      objCamPos.copy(CAM_LEJOS);
      objCamMira.set(0, 2, 0);
    },
    actualizar(dt, mano) { return mantener(mano.gesto === 'Thumb_Up', dt, 1); },
    alCompletar() { tiempoInicio = performance.now(); },
    espera: 0.4,
  },
  {
    tipo: 'paso',
    corto: 'Acercarse sin asustarla',
    titulo: 'Acercarse sin asustarla',
    notas: [
      'Brasa está descansando en el claro.',
      'Nunca hay que correr hacia un dragón: lo toma como un ataque.',
      'Pasos cortos y sin hacer ruido.',
    ],
    gesto: 'Pointing_Up',
    como: 'Levanta el dedo índice para avanzar. Si bajas la mano, te paras.',
    truco: 'Fíjate en sus ojos: si te sigue con la mirada, vas bien.',
    actualizar(dt, mano) {
      if (mano.gesto === 'Pointing_Up') progreso = clamp(progreso + dt / 5);
      objCamPos.lerpVectors(CAM_LEJOS, CAM_CERCA, progreso);
      objDragon.mirarX = clamp(camara.position.x * 0.12, -1, 1);
      return progreso >= 1;
    },
    alCompletar() { aviso('Te ha visto… y no se ha ido.'); },
  },
  {
    tipo: 'paso',
    corto: 'Ganarse su confianza',
    titulo: 'Ganarse su confianza',
    notas: [
      'Ya estoy cerca. Ahora viene lo difícil.',
      'Hay que enseñarle la mano abierta, sin nada en ella, y <em>no moverse</em>.',
      'Ella decide si se acerca. Yo solo espero.',
    ],
    gesto: 'Open_Palm',
    como: 'Muestra la palma abierta a la cámara y mantenla quieta unos segundos.',
    truco: 'Si mueves la mano se asusta y retrocede.',
    actualizar(dt, mano) {
      const palma = mano.gesto === 'Open_Palm';
      if (palma && mano.quieta) {
        progreso += dt / 3;
        objDragon.enfado = 0;
      } else if (palma) {
        progreso -= dt * 0.6;
        objDragon.enfado = 1;
        aviso('¡Quieto! La estás asustando…', 900);
        const ahora = performance.now();
        if (ahora - ultimoGrunido > 1500) { sonido.grunido(); ultimoGrunido = ahora; }
      } else {
        progreso -= dt * 0.2;
        objDragon.enfado = 0;
      }
      progreso = clamp(progreso);
      objDragon.cabezaAdelante = progreso;
      objDragon.mirarX = 0.3;
      zSuelo = progreso * 1.4;
      return progreso >= 1;
    },
    alCompletar() {
      objDragon.enfado = 0;
      sonido.ronroneo();
      aviso('Ha apoyado el hocico en tu mano. ¡Confía en ti!', 2200);
    },
    espera: 2.2,
  },
  {
    tipo: 'paso',
    corto: 'Ponerle la silla',
    titulo: 'Ponerle la silla',
    notas: [
      'Brasa se ha girado para enseñarme el lomo. ¡Buena señal!',
      'La silla está en el suelo, a la izquierda.',
      'Hay que dejarla en el hueco entre los pinchos.',
    ],
    gesto: 'Closed_Fist',
    como: 'Pon la mano a la izquierda y cierra el puño para agarrar la silla. Llévala hasta el lomo y abre la mano para soltarla.',
    truco: 'Si la sueltas antes de tiempo, se cae al suelo.',
    iniciar() {
      objDragon.cabezaAdelante = 0;
      objDragon.mirarX = -0.6;          // mira hacia ti mientras está de lado
      zSuelo = 0;
      rumboSuelo = Math.PI / 2;         // se pone de lado
      objCamPos.set(0, 3.4, 15);
      objCamMira.set(-1, 1.8, 0);
      sillaP = 0;
      sillaAgarrada = false;
    },
    actualizar(dt, mano) {
      const puño = mano.gesto === 'Closed_Fist';
      let objetivo = 0;

      if (puño && !sillaAgarrada) {
        if (mano.x < 0.4) sillaAgarrada = true;
        else aviso('Lleva la mano a la izquierda, donde está la silla', 900);
      }
      if (sillaAgarrada && puño) {
        objetivo = clamp((mano.x - 0.2) / 0.55);
      } else if (sillaAgarrada && !puño) {
        sillaAgarrada = false;
        if (sillaP > 0.85) { sillaPuesta = true; return true; }
        aviso('¡Se te ha caído! Vuelve a cogerla.');
      }

      sillaP = lerp(sillaP, objetivo, suave(dt, sillaAgarrada ? 6 : 3));
      const lomo = dragon.cuerpo.localToWorld(dragon.puntoLomo.clone());
      silla.position.lerpVectors(SILLA_INICIO, lomo, sillaP);
      silla.position.y += Math.sin(sillaP * Math.PI) * 2;
      silla.rotation.set(0, dragon.raiz.rotation.y * sillaP, 0);
      progreso = sillaP;
      return false;
    },
    alCompletar() {
      // La silla pasa a ser parte del dragón y se mueve con él
      dragon.cuerpo.add(silla);
      silla.position.copy(dragon.puntoLomo);
      silla.rotation.set(0, 0, 0);
      aviso('¡Silla bien atada!');
    },
  },
  {
    tipo: 'paso',
    corto: 'Subirse al lomo',
    titulo: 'Subirse al lomo',
    notas: [
      'Con la silla puesta, toca subir.',
      'Le pido permiso con un gesto amable y ella se agacha.',
    ],
    gesto: 'Thumb_Up',
    como: 'Mantén el pulgar arriba hasta que Brasa se agache del todo.',
    truco: 'Agárrate fuerte: cuando subas, se girará hacia el mar.',
    iniciar() {
      objCamPos.set(-3, 3.2, 13);
      objCamMira.set(0, 2, 0);
      objDragon.mirarX = -0.5;
    },
    actualizar(dt, mano) {
      const listo = mantener(mano.gesto === 'Thumb_Up', dt, 2, 0.4);
      objDragon.agachado = progreso;
      return listo;
    },
    alCompletar() {
      modoCamara = 'jinete';
      rumboSuelo = Math.PI;            // se gira mirando lejos de la cámara
      objDragon.mirarX = 0;
      setTimeout(() => { objDragon.agachado = 0; }, 900);
      aviso('¡Arriba!');
    },
    espera: 2.4,
  },
  {
    tipo: 'paso',
    corto: 'Despegar',
    titulo: 'Despegar',
    notas: [
      'Ya estoy arriba. Las alas se abren cuando nota que estoy listo.',
      'Hay que darle la señal de subir.',
    ],
    gesto: 'Open_Palm',
    como: 'Levanta la mano abierta por encima de tu cabeza (arriba del todo en la cámara) y mantenla.',
    truco: 'Cuanto más tiempo la mantengas arriba, más abre las alas.',
    actualizar(dt, mano) {
      const listo = mantener(mano.gesto === 'Open_Palm' && mano.y < 0.4, dt, 1.5, 0.5);
      objDragon.aleteo = progreso * 0.6;
      return listo;
    },
    alCompletar() {
      objDragon.aleteo = 1;
      sonido.rugido();
      aviso('¡A volar!');
    },
    espera: 0.8,
  },
  {
    tipo: 'paso',
    corto: 'Volar por los aros',
    titulo: 'Volar por los aros',
    notas: [
      '¡Estamos volando!',
      'Para practicar hay que pasar por dentro de <strong>3 aros dorados</strong>.',
      'Mano a la derecha o a la izquierda: gira.',
      'Mano arriba o abajo: sube o baja.',
    ],
    gesto: 'Open_Palm',
    como: 'Mueve la mano para guiarla. Cierra el puño ✊ para ir más rápido.',
    truco: 'La flecha de arriba a la izquierda señala el siguiente aro.',
    iniciar() {
      vuelo.activo = true;
      vuelo.modo = 'despegue';
      vuelo.arranque = 0;
      vuelo.pos.copy(dragon.raiz.position);
      vuelo.rumbo = dragon.raiz.rotation.y;
      vuelo.altura = vuelo.pos.y;
      vuelo.velocidad = 0;
      arosPasados = 0;
      objDragon.aleteo = 1;
      $('hudVuelo').classList.remove('oculto');
    },
    actualizar() {
      if (vuelo.modo === 'despegue' && vuelo.arranque > 2.5) {
        vuelo.modo = 'libre';
        colocarAro();
      }
      if (vuelo.modo !== 'libre') return false;

      const centro = dragon.raiz.position.clone().add(new THREE.Vector3(0, 2.3, 0));
      const delante = new THREE.Vector3(Math.sin(vuelo.rumbo), 0, Math.cos(vuelo.rumbo));
      const haciaAro = aro.position.clone().sub(centro);

      if (haciaAro.length() < 6.5) {
        arosPasados++;
        progreso = arosPasados / 3;
        sonido.aro();
        if (arosPasados >= 3) { aro.visible = false; return true; }
        aviso(`¡Aro ${arosPasados} de 3!`, 1200);
        colocarAro();
      } else if (haciaAro.dot(delante) < -15) {
        aviso('Te lo has saltado. ¡Ahí va otro!', 1400);
        colocarAro();
      }
      return false;
    },
    alCompletar() { aviso('¡Tres de tres!'); },
    espera: 1.2,
  },
  {
    tipo: 'paso',
    corto: 'Aterrizar',
    titulo: 'Aterrizar',
    notas: [
      'Último paso: volver a tierra sin rompernos nada.',
      'Brasa irá sola hacia el islote de la bandera roja.',
      'Yo solo le indico cuándo bajar.',
    ],
    gesto: 'Thumb_Down',
    como: 'Mantén el pulgar abajo para bajar. Si lo sueltas, se queda a esa altura.',
    truco: 'Baja poco a poco hasta tocar el círculo rojo.',
    iniciar() {
      const delante = new THREE.Vector3(Math.sin(vuelo.rumbo), 0, Math.cos(vuelo.rumbo));
      islote.position.copy(vuelo.pos).addScaledVector(delante, 80);
      islote.position.y = 0;
      islote.visible = true;
      vuelo.modo = 'aterrizaje';
      vuelo.alturaInicial = Math.max(vuelo.altura, 5);
    },
    actualizar() {
      const dist = Math.hypot(islote.position.x - vuelo.pos.x, islote.position.z - vuelo.pos.z);
      progreso = clamp(1 - (vuelo.altura - ALTURA_ISLOTE) / (vuelo.alturaInicial - ALTURA_ISLOTE));
      return dist < 6 && vuelo.altura < ALTURA_ISLOTE + 0.15;
    },
    alCompletar() {
      vuelo.modo = 'posado';
      objDragon.aleteo = 0;
      aviso('¡Aterrizaje perfecto!', 2000);
    },
    espera: 2,
  },
  {
    tipo: 'final',
    corto: 'Fin',
    titulo: '¡Ya eres jinete!',
    notas: [],
    gesto: 'Victory',
    como: 'Haz el signo de la victoria para volver a empezar.',
    boton: 'Volver a empezar',
    iniciar() {
      const s = Math.round((performance.now() - tiempoInicio) / 1000);
      const tiempo = `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`;
      this.notas = [
        'Brasa y yo hemos volado juntos por primera vez.',
        `Tiempo desde que abrí el cuaderno: <strong>${tiempo}</strong>.`,
        'Mañana: practicar vuelos más largos.',
      ];
      $('hudVuelo').classList.add('oculto');
    },
    actualizar(dt, mano) {
      if (mantener(mano.gesto === 'Victory', dt, 1)) reiniciar();
      return false;
    },
  },
];

const TITULOS = pasos.map((p) => p.corto);

// =========================================================
// CONTROL DE LOS PASOS
// =========================================================
function irAPaso(i, animar = true) {
  indice = i;
  progreso = 0;
  completado = false;
  const paso = pasos[i];
  paso.iniciar?.();
  libreta.mostrar(paso, i, TITULOS, completados, animar);
  if (animar) sonido.pagina();
  $('hudPaso').textContent = paso.tipo === 'paso' ? `Paso ${i}: ${paso.corto}` : paso.corto;

  // Botón dentro de la página (portada y final)
  $('btnPagina')?.addEventListener('click', () => {
    sonido.iniciar();
    if (paso.tipo === 'portada' && !completado) completarPaso();
    if (paso.tipo === 'final') reiniciar();
  });
}

function completarPaso() {
  const paso = pasos[indice];
  completado = true;
  if (paso.tipo === 'paso') completados.add(indice);
  libreta.progreso(1);
  if (paso.tipo === 'paso') { libreta.sellar(); sonido.exito(); }
  paso.alCompletar?.();
  espera = paso.espera ?? 1.5;
}

function colocarAro() {
  const delante = new THREE.Vector3(Math.sin(vuelo.rumbo), 0, Math.cos(vuelo.rumbo));
  const derecha = new THREE.Vector3(-delante.z, 0, delante.x);
  aro.position.copy(vuelo.pos)
    .addScaledVector(delante, 60)
    .addScaledVector(derecha, (Math.random() - 0.5) * 30);
  aro.position.y = 10 + Math.random() * 14;
  aro.rotation.set(0, vuelo.rumbo, 0);
  aro.visible = true;
}

function reiniciar() {
  completados.clear();
  Object.assign(objDragon, { aleteo: 0, agachado: 0, cabezaAdelante: 0, enfado: 0, mirarX: 0, andar: 0 });
  rumboSuelo = 0;
  zSuelo = 0;
  modoCamara = 'suelo';
  vuelo.activo = false;
  vuelo.modo = 'despegue';
  dragon.raiz.position.set(0, 0, 0);
  dragon.raiz.rotation.set(0, 0, 0);
  escena.add(silla);                         // la quitamos del dragón
  silla.position.copy(SILLA_INICIO);
  silla.rotation.set(0, 0, 0);
  sillaPuesta = false;
  aro.visible = false;
  islote.visible = false;
  $('hudVuelo').classList.add('oculto');
  irAPaso(0);
}

// =========================================================
// VUELO
// =========================================================
function actualizarVuelo(dt, mano) {
  let giro = 0;
  let velObjetivo = 14;

  if (mano.hayMano && (vuelo.modo === 'libre' || vuelo.modo === 'aterrizaje')) {
    giro = clamp((mano.x - 0.5) * 2.2, -1, 1);
  }

  switch (vuelo.modo) {
    case 'despegue':
      vuelo.arranque += dt;
      vuelo.alturaObjetivo = 14;
      velObjetivo = vuelo.arranque > 0.6 ? 14 : 2;
      break;

    case 'libre':
      if (mano.hayMano) vuelo.alturaObjetivo = 6 + (1 - clamp((mano.y - 0.2) / 0.6)) * 26;
      if (mano.gesto === 'Closed_Fist') velObjetivo = 24;   // turbo
      break;

    case 'aterrizaje': {
      const dx = islote.position.x - vuelo.pos.x;
      const dz = islote.position.z - vuelo.pos.z;
      const dist = Math.hypot(dx, dz);
      // Brasa se dirige sola al islote; la mano solo corrige un poco
      const dif = difAngulo(Math.atan2(dx, dz), vuelo.rumbo);
      giro = clamp(-dif * 1.8 + giro * 0.3, -1, 1);
      velObjetivo = 14 * clamp((dist - 1) / 25);
      if (mano.gesto === 'Thumb_Down') {
        vuelo.alturaObjetivo = Math.max(ALTURA_ISLOTE, vuelo.alturaObjetivo - 5 * dt);
      }
      if (dist > 6) vuelo.alturaObjetivo = Math.max(vuelo.alturaObjetivo, 4);
      break;
    }

    case 'posado':
      velObjetivo = 0;
      giro = 0;
      vuelo.alturaObjetivo = ALTURA_ISLOTE;
      break;
  }

  vuelo.velocidad = lerp(vuelo.velocidad, velObjetivo, suave(dt, 1.5));
  vuelo.rumbo -= giro * 1.1 * dt * clamp(vuelo.velocidad / 8, 0.3, 1);

  const alturaAntes = vuelo.altura;
  vuelo.altura = vuelo.modo === 'posado'
    ? lerp(vuelo.altura, ALTURA_ISLOTE, suave(dt, 4))
    : lerp(vuelo.altura, vuelo.alturaObjetivo, suave(dt, 1.2));
  const velVertical = (vuelo.altura - alturaAntes) / Math.max(dt, 1e-3);

  vuelo.pos.x += Math.sin(vuelo.rumbo) * vuelo.velocidad * dt;
  vuelo.pos.z += Math.cos(vuelo.rumbo) * vuelo.velocidad * dt;
  vuelo.pos.y = vuelo.altura;

  // Se inclina en las curvas y levanta el morro al subir
  vuelo.alabeo = lerp(vuelo.alabeo, giro * 0.55, suave(dt, 4));
  vuelo.cabeceo = lerp(vuelo.cabeceo, clamp(-velVertical * 0.06, -0.45, 0.45), suave(dt, 4));

  dragon.raiz.position.copy(vuelo.pos);
  dragon.raiz.rotation.set(vuelo.cabeceo, vuelo.rumbo, vuelo.alabeo);

  // Datos en pantalla
  $('datoAltura').textContent = Math.max(0, vuelo.altura - ALTURA_ISLOTE).toFixed(0);
  const objetivo = vuelo.modo === 'aterrizaje' || vuelo.modo === 'posado' ? islote : aro;
  $('datoObjetivo').textContent = objetivo === islote ? 'Destino: islote' : `Aros: ${arosPasados} / 3`;
  const rumboObjetivo = Math.atan2(objetivo.position.x - vuelo.pos.x, objetivo.position.z - vuelo.pos.z);
  const dif = difAngulo(rumboObjetivo, vuelo.rumbo);
  $('flecha').style.transform = `rotate(${-90 - dif * 180 / Math.PI}deg)`;
}

// =========================================================
// CÁMARA Y DRAGÓN
// =========================================================
function actualizarCamara(dt) {
  if (modoCamara === 'jinete') {
    const r = dragon.raiz.rotation.y;
    const delante = new THREE.Vector3(Math.sin(r), 0, Math.cos(r));
    const base = dragon.raiz.position;
    objCamPos.copy(base).addScaledVector(delante, -12).add(new THREE.Vector3(0, 6, 0));
    objCamMira.copy(base).addScaledVector(delante, 8).add(new THREE.Vector3(0, 3, 0));
  }
  const rapidez = modoCamara === 'jinete' ? 4 : 2.5;
  camPos.lerp(objCamPos, suave(dt, rapidez));
  camMira.lerp(objCamMira, suave(dt, rapidez));
  camara.position.copy(camPos);
  camara.lookAt(camMira);

  // El sol sigue al dragón para que siempre tenga sombra
  sol.position.copy(dragon.raiz.position).add(new THREE.Vector3(40, 80, 30));
  sol.target.position.copy(dragon.raiz.position);
}

function actualizarDragonSuelo(dt) {
  const r = dragon.raiz.rotation.y;
  dragon.raiz.rotation.y = r + difAngulo(rumboSuelo, r) * suave(dt, 1.8);
  dragon.raiz.position.z = lerp(dragon.raiz.position.z, zSuelo, suave(dt, 2));
}

// =========================================================
// INTERFAZ
// =========================================================
function actualizarHudGesto(mano) {
  const sinMano = !mano.hayMano;
  $('gestoIcono').textContent = sinMano ? '·' : ICONOS[mano.gesto] ?? '·';
  $('gestoNombre').textContent = sinMano ? 'Sin mano' : NOMBRES[mano.gesto] ?? mano.gesto;
  $('barraConfianza').style.width = `${Math.round((sinMano ? 0 : mano.confianza) * 100)}%`;
}

$('btnCamara').addEventListener('click', async () => {
  const estado = $('estadoCarga');
  $('btnCamara').disabled = $('btnTeclado').disabled = true;
  try {
    sonido.iniciar();
    await gestos.iniciarCamara((t) => { estado.textContent = t; });
    $('cajaCamara').classList.remove('oculto');
    $('inicio').classList.add('oculto');
  } catch (err) {
    console.error(err);
    estado.textContent = 'No se ha podido usar la cámara. ¿Has abierto la página con Live Server? Puedes jugar con teclado y ratón.';
    $('btnTeclado').disabled = false;
  }
});

$('btnTeclado').addEventListener('click', () => {
  sonido.iniciar();
  gestos.activarTeclado(contenedor);
  $('hudTeclado').classList.remove('oculto');
  $('inicio').classList.add('oculto');
});

$('btnVoz').addEventListener('click', (e) => {
  libreta.leerEnVoz = !libreta.leerEnVoz;
  e.currentTarget.setAttribute('aria-pressed', String(libreta.leerEnVoz));
  e.currentTarget.textContent = libreta.leerEnVoz ? '🔊 Voz' : '🔈 Voz';
  if (libreta.leerEnVoz) {
    const p = pasos[indice];
    libreta.leer(`${p.titulo}. ${p.como ?? ''}`);
  } else if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
});

$('btnReiniciar').addEventListener('click', reiniciar);

$('btnSonido').addEventListener('click', (e) => {
  sonido.iniciar();
  const encendido = e.currentTarget.getAttribute('aria-pressed') !== 'true';
  sonido.silenciar(!encendido);
  e.currentTarget.setAttribute('aria-pressed', String(encendido));
  e.currentTarget.textContent = encendido ? '🔔 Sonido' : '🔕 Sonido';
});

// =========================================================
// BUCLE PRINCIPAL
// =========================================================
const reloj = new THREE.Clock();

function bucle() {
  requestAnimationFrame(bucle);
  const dt = Math.min(reloj.getDelta(), 0.05);
  const t = reloj.elapsedTime;

  const mano = gestos.actualizar();
  actualizarHudGesto(mano);

  // Lógica del paso actual
  const paso = pasos[indice];
  if (!completado) {
    if (paso.actualizar(dt, mano)) completarPaso();
    else if (paso.tipo === 'paso') libreta.progreso(progreso);
  } else {
    espera -= dt;
    if (espera <= 0 && indice < pasos.length - 1) irAPaso(indice + 1);
  }

  // Movimiento
  if (vuelo.activo) actualizarVuelo(dt, mano);
  else actualizarDragonSuelo(dt);

  // Brasa "anda" mientras se acerca a ti en el paso 2
  objDragon.andar = Math.abs(zSuelo - dragon.raiz.position.z) > 0.05 && !vuelo.activo ? 1 : 0;
  for (const k in animDragon) animDragon[k] = lerp(animDragon[k], objDragon[k], suave(dt, 3));

  // Sonidos continuos: viento según la velocidad y un golpe de ala en cada batida
  sonido.viento(vuelo.activo ? clamp(vuelo.velocidad / 24) : 0.05);
  if (animDragon.aleteo > 0.5) {
    temporizadorAla -= dt;
    if (temporizadorAla <= 0) { sonido.aleteo(); temporizadorAla = (2 * Math.PI) / 5.5; }
  }
  mundo.actualizar(dt);
  dragon.actualizar(t, animDragon);
  aro.rotation.z += dt * 0.8;   // el aro gira un poco para llamar la atención

  actualizarCamara(dt);
  renderer.render(escena, camara);
}

silla.position.copy(SILLA_INICIO);
irAPaso(0, false);
bucle();
