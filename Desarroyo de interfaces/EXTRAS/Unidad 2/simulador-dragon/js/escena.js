// =========================================================
// escena.js
// Crea el mundo 3D: cielo, mar, la isla, árboles, rocas y nubes.
// También los aros por los que hay que volar y el islote de
// aterrizaje.
// =========================================================
import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// Textura de "olas" para el agua. Se genera aquí con senos para no
// depender de ninguna imagen. Las frecuencias son enteras para que
// la textura se pueda repetir sin que se noten los bordes.
function crearNormalesAgua(tam = 256) {
  const lienzo = document.createElement('canvas');
  lienzo.width = lienzo.height = tam;
  const ctx = lienzo.getContext('2d');
  const img = ctx.createImageData(tam, tam);
  const ondas = [[3, 1, 0.0], [1, 4, 1.3], [5, 2, 2.1], [2, 7, 0.7], [8, 3, 4.0], [11, 9, 2.9]];
  const altura = (x, y) => ondas.reduce((s, [fx, fy, f], i) =>
    s + Math.sin(2 * Math.PI * (fx * x + fy * y) / tam + f) / (i + 1), 0);
  for (let y = 0; y < tam; y++) {
    for (let x = 0; x < tam; x++) {
      const dx = altura(x + 1, y) - altura(x - 1, y);
      const dy = altura(x, y + 1) - altura(x, y - 1);
      const n = new THREE.Vector3(-dx * 2.5, -dy * 2.5, 1).normalize();
      const i = (y * tam + x) * 4;
      img.data[i] = (n.x * 0.5 + 0.5) * 255;
      img.data[i + 1] = (n.y * 0.5 + 0.5) * 255;
      img.data[i + 2] = (n.z * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const textura = new THREE.CanvasTexture(lienzo);
  textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
  return textura;
}

// Números aleatorios "con semilla" para que la isla salga siempre igual
function aleatorio(semilla) {
  return () => {
    semilla |= 0; semilla = (semilla + 0x6d2b79f5) | 0;
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const RADIO_ISLA = 110;

export function crearMundo(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;   // para que el cielo HDR no se vea quemado
  renderer.toneMappingExposure = 0.9;

  const escena = new THREE.Scene();
  const colorCielo = new THREE.Color(0xcfdde6);
  escena.background = colorCielo;          // se cambia por el HDRI cuando termina de cargar
  escena.fog = new THREE.Fog(colorCielo, 90, 520);

  const camara = new THREE.PerspectiveCamera(60, 1, 0.1, 1200);

  // ---------- Luces ----------
  const hemisferio = new THREE.HemisphereLight(0xe6f2ff, 0x6b5a3a, 0.9);
  escena.add(hemisferio);
  const sol = new THREE.DirectionalLight(0xfff0d0, 1.5);
  sol.position.set(40, 80, 30);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 220 });
  sol.shadow.camera.updateProjectionMatrix();
  escena.add(sol, sol.target);

  // ---------- Mar con reflejos y olas (Water de three.js) ----------
  const mar = new Water(new THREE.PlaneGeometry(4000, 4000), {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: crearNormalesAgua(),
    sunDirection: sol.position.clone().normalize(),
    sunColor: 0xfff0d0,
    waterColor: 0x1d4a5e,
    distortionScale: 2.5,
    fog: true,
  });
  mar.material.uniforms.size.value = 4;
  mar.rotation.x = -Math.PI / 2;
  mar.position.y = -1.2;
  escena.add(mar);

  // ---------- Isla ----------
  const playa = new THREE.Mesh(
    new THREE.CylinderGeometry(RADIO_ISLA + 14, RADIO_ISLA + 24, 1.5, 48),
    new THREE.MeshStandardMaterial({ color: 0xcdb98a, roughness: 1, flatShading: true }),
  );
  playa.position.y = -1.6;
  playa.receiveShadow = true;

  const hierba = new THREE.Mesh(
    new THREE.CylinderGeometry(RADIO_ISLA, RADIO_ISLA + 12, 4, 48),
    new THREE.MeshStandardMaterial({ color: 0x7d8f4c, roughness: 1, flatShading: true }),
  );
  hierba.position.y = -2;   // la parte de arriba queda en y = 0
  hierba.receiveShadow = true;
  escena.add(playa, hierba);

  const azar = aleatorio(7);

  // Colinas al fondo
  const matColina = new THREE.MeshStandardMaterial({ color: 0x66783d, roughness: 1, flatShading: true });
  for (let i = 0; i < 9; i++) {
    const ang = azar() * Math.PI * 2;
    const dist = 60 + azar() * 40;
    const colina = new THREE.Mesh(new THREE.SphereGeometry(14 + azar() * 12, 9, 6), matColina);
    colina.scale.y = 0.35 + azar() * 0.3;
    colina.position.set(Math.cos(ang) * dist, -2, Math.sin(ang) * dist);
    colina.receiveShadow = true;
    escena.add(colina);
  }

  // Pinos
  const matHoja = new THREE.MeshStandardMaterial({ color: 0x2f4a2c, roughness: 1, flatShading: true });
  const matTronco = new THREE.MeshStandardMaterial({ color: 0x5a3d22, roughness: 1 });
  for (let i = 0; i < 70; i++) {
    const ang = azar() * Math.PI * 2;
    const dist = 24 + azar() * 80;
    const alto = 4 + azar() * 5;
    const pino = new THREE.Group();
    const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.5, 5), matTronco);
    tronco.position.y = 0.75;
    const copa = new THREE.Mesh(new THREE.ConeGeometry(alto * 0.3, alto, 6), matHoja);
    copa.position.y = 1.5 + alto / 2;
    pino.add(tronco, copa);
    pino.position.set(Math.cos(ang) * dist, 0, Math.sin(ang) * dist);
    pino.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    escena.add(pino);
  }

  // Rocas
  const matRoca = new THREE.MeshStandardMaterial({ color: 0x86817a, roughness: 1, flatShading: true });
  for (let i = 0; i < 30; i++) {
    const ang = azar() * Math.PI * 2;
    const dist = 12 + azar() * 95;
    const roca = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6 + azar() * 1.6, 0), matRoca);
    roca.position.set(Math.cos(ang) * dist, 0.2, Math.sin(ang) * dist);
    roca.rotation.set(azar() * 3, azar() * 3, azar() * 3);
    roca.castShadow = roca.receiveShadow = true;
    escena.add(roca);
  }

  // Nubes
  const matNube = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.92 });
  for (let i = 0; i < 30; i++) {
    const nube = new THREE.Group();
    const piezas = 3 + Math.floor(azar() * 4);
    for (let j = 0; j < piezas; j++) {
      const bola = new THREE.Mesh(new THREE.SphereGeometry(4 + azar() * 4, 8, 6), matNube);
      bola.position.set(j * 5 - piezas * 2.5, azar() * 2, azar() * 4);
      nube.add(bola);
    }
    nube.position.set((azar() - 0.5) * 600, 38 + azar() * 30, (azar() - 0.5) * 600);
    escena.add(nube);
  }

  function redimensionar(ancho, alto) {
    renderer.setSize(ancho, alto, false);
    camara.aspect = ancho / alto;
    camara.updateProjectionMatrix();
  }

  // Carga el cielo de 360° (.hdr). Sirve de fondo y también ilumina
  // los objetos (reflejos y luz ambiente).
  async function cargarCielo(url) {
    if (!url) return;
    try {
      const textura = await new RGBELoader().loadAsync(url);
      textura.mapping = THREE.EquirectangularReflectionMapping;
      escena.background = textura;
      escena.environment = textura;
      hemisferio.intensity = 0.35;      // el HDRI ya aporta luz ambiente
    } catch (err) {
      console.warn(`No se ha podido cargar el cielo "${url}"`, err);
    }
  }

  function actualizar(dt) {
    mar.material.uniforms.time.value += dt * 0.6;
  }

  return { renderer, escena, camara, sol, redimensionar, cargarCielo, actualizar };
}

// Aro dorado para atravesar volando
export function crearAro() {
  const aro = new THREE.Mesh(
    new THREE.TorusGeometry(6, 0.45, 8, 32),
    new THREE.MeshStandardMaterial({ color: 0xe0b44c, emissive: 0x8a5a00, emissiveIntensity: 0.6, metalness: 0.5, roughness: 0.4 }),
  );
  return aro;
}

// Islote de roca para aterrizar, con una bandera
export const ALTURA_ISLOTE = 0.6;
export function crearIslote() {
  const islote = new THREE.Group();
  const roca = new THREE.Mesh(
    new THREE.CylinderGeometry(8, 10, 3, 12),
    new THREE.MeshStandardMaterial({ color: 0x7b766d, roughness: 1, flatShading: true }),
  );
  roca.position.y = ALTURA_ISLOTE - 1.5;
  const cesped = new THREE.Mesh(
    new THREE.CylinderGeometry(7.6, 7.6, 0.1, 12),
    new THREE.MeshStandardMaterial({ color: 0x7d8f4c, roughness: 1, flatShading: true }),
  );
  cesped.position.y = ALTURA_ISLOTE;
  const marca = new THREE.Mesh(
    new THREE.RingGeometry(3, 3.6, 24),
    new THREE.MeshBasicMaterial({ color: 0x8c2a1c, side: THREE.DoubleSide }),
  );
  marca.rotation.x = -Math.PI / 2;
  marca.position.y = ALTURA_ISLOTE + 0.08;
  const mastil = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 5, 5),
    new THREE.MeshStandardMaterial({ color: 0x5a3d22 }));
  mastil.position.set(6, ALTURA_ISLOTE + 2.5, 0);
  const bandera = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1),
    new THREE.MeshStandardMaterial({ color: 0x8c2a1c, side: THREE.DoubleSide }));
  bandera.position.set(6.8, ALTURA_ISLOTE + 4.4, 0);
  islote.add(roca, cesped, marca, mastil, bandera);
  islote.traverse((o) => { if (o.isMesh) o.receiveShadow = true; });
  return islote;
}
