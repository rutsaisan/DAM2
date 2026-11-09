// =========================================================
// dragon.js
// El dragón "Brasa" está hecho con figuras básicas de three.js
// (esferas, cilindros, conos y formas planas). Así no hace falta
// descargar ningún modelo 3D y se puede animar cada parte.
// Su "delante" es el eje +Z.
// =========================================================
import * as THREE from 'three';

const lerp = (a, b, t) => a + (b - a) * t;

export function crearDragon() {
  // ---------- Materiales ----------
  const piel = new THREE.MeshStandardMaterial({ color: 0x9a3324, roughness: 0.8, flatShading: true });
  const panza = new THREE.MeshStandardMaterial({ color: 0xd8a25e, roughness: 0.9, flatShading: true });
  const membrana = new THREE.MeshStandardMaterial({
    color: 0xb5523a, roughness: 0.9, side: THREE.DoubleSide, flatShading: true,
  });
  const hueso = new THREE.MeshStandardMaterial({ color: 0xeadbc0, roughness: 0.6, flatShading: true });
  const ojo = new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0xffa000, emissiveIntensity: 0.8 });
  const negro = new THREE.MeshStandardMaterial({ color: 0x111111 });

  const raiz = new THREE.Group();     // posición y giro en el mundo
  raiz.rotation.order = 'YXZ';        // primero rumbo, luego cabeceo y alabeo
  const cuerpo = new THREE.Group();   // para agacharse y respirar
  raiz.add(cuerpo);

  // ---------- Tronco ----------
  const torso = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 9), piel);
  torso.scale.set(1, 0.85, 1.7);
  torso.position.y = 2.3;
  cuerpo.add(torso);

  const vientre = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 9), panza);
  vientre.scale.set(0.85, 0.6, 1.5);
  vientre.position.set(0, 1.95, 0.1);
  cuerpo.add(vientre);

  // Pinchos del lomo
  for (let i = 0; i < 6; i++) {
    const pincho = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 5), hueso);
    const z = 1.3 - i * 0.55;
    pincho.position.set(0, 3.25 - Math.abs(z) * 0.12, z);
    pincho.rotation.x = -0.4;
    if (i === 2 || i === 3) pincho.visible = false; // hueco para la silla
    cuerpo.add(pincho);
  }

  // ---------- Patas ----------
  const patas = [];
  for (const [x, z] of [[0.75, 1.1], [-0.75, 1.1], [0.75, -1.1], [-0.75, -1.1]]) {
    const pata = new THREE.Group();
    pata.position.set(x, 1.9, z);
    const muslo = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 1.7, 7), piel);
    muslo.position.y = -0.85;
    const pie = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.75), piel);
    pie.position.set(0, -1.8, 0.15);
    for (const dx of [-0.15, 0, 0.15]) {
      const garra = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 4), hueso);
      garra.rotation.x = Math.PI / 2;
      garra.position.set(dx, -1.82, 0.6);
      pata.add(garra);
    }
    pata.add(muslo, pie);
    cuerpo.add(pata);
    patas.push(pata);
  }

  // ---------- Cuello y cabeza ----------
  const INCLINACION_CUELLO = 0.6;
  const cuello = new THREE.Group();
  cuello.position.set(0, 2.8, 1.6);
  cuello.rotation.x = INCLINACION_CUELLO;
  const cuelloMalla = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.56, 1.9, 8), piel);
  cuelloMalla.position.y = 0.9;
  cuello.add(cuelloMalla);
  cuerpo.add(cuello);

  const cabeza = new THREE.Group();
  cabeza.position.y = 1.8;
  cabeza.rotation.x = -INCLINACION_CUELLO;  // la cabeza mira al frente
  cuello.add(cabeza);

  const craneo = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.7, 1), piel);
  craneo.position.set(0, 0.1, 0.2);
  const hocico = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.42, 0.85), piel);
  hocico.position.set(0, -0.05, 0.9);
  const mandibula = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 0.8), panza);
  mandibula.position.set(0, -0.3, 0.85);
  cabeza.add(craneo, hocico, mandibula);

  for (const lado of [1, -1]) {
    const o = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), ojo);
    o.position.set(0.36 * lado, 0.25, 0.45);
    const pupila = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.15, 0.03), negro);
    pupila.position.set(0.46 * lado, 0.25, 0.47);
    const cuerno = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.8, 6), hueso);
    cuerno.position.set(0.26 * lado, 0.55, -0.2);
    cuerno.rotation.set(-2.1, 0, 0.25 * lado);
    const nariz = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), negro);
    nariz.position.set(0.15 * lado, 0.1, 1.32);
    cabeza.add(o, pupila, cuerno, nariz);
  }

  // ---------- Alas ----------
  // Se dibuja la silueta en 2D y se tumba para que quede horizontal
  const silueta = new THREE.Shape();
  silueta.moveTo(0, -0.4);
  silueta.lineTo(2.0, -0.9);
  silueta.lineTo(4.2, -0.3);
  silueta.lineTo(5.0, 0.6);
  silueta.lineTo(3.6, 1.3);
  silueta.lineTo(2.7, 0.9);
  silueta.lineTo(1.7, 2.0);
  silueta.lineTo(0.7, 1.5);
  silueta.lineTo(0, 1.8);
  silueta.closePath();
  const geoAla = new THREE.ShapeGeometry(silueta);
  geoAla.rotateX(-Math.PI / 2);   // ahora el ala está en el plano XZ

  function hacerAla(lado) {
    const pivote = new THREE.Group();
    pivote.position.set(0.8 * lado, 3.0, 0.4);
    const malla = new THREE.Mesh(geoAla, membrana);
    const brazo = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 4.4, 5), piel);
    brazo.rotation.z = Math.PI / 2;
    brazo.position.set(2.1, 0.02, 0.55);
    const ala = new THREE.Group();
    ala.add(malla, brazo);
    ala.scale.x = lado;   // el ala izquierda es la derecha en espejo
    pivote.add(ala);
    cuerpo.add(pivote);
    return pivote;
  }
  const alaDer = hacerAla(1);
  const alaIzq = hacerAla(-1);

  // ---------- Cola ----------
  const cola = [];
  let padre = cuerpo;
  for (let i = 0; i < 8; i++) {
    const seg = new THREE.Group();
    if (i === 0) seg.position.set(0, 2.25, -1.8);
    else seg.position.z = -0.7;
    const r = 0.5 * (1 - i / 9);
    const bola = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), piel);
    bola.scale.z = 1.7;
    seg.add(bola);
    if (i === 7) {
      const aleta = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 3), membrana);
      aleta.rotation.x = -Math.PI / 2;
      aleta.scale.y = 1;
      aleta.scale.x = 1.6;
      aleta.position.z = -0.5;
      seg.add(aleta);
    }
    padre.add(seg);
    cola.push(seg);
    padre = seg;
  }

  // Todas las piezas proyectan sombra
  raiz.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  // Punto del lomo donde va la silla (en coordenadas de "cuerpo")
  const puntoLomo = new THREE.Vector3(0, 3.18, -0.1);

  // ---------- Animación ----------
  // estado: valores entre 0 y 1 que controla main.js
  //   aleteo         -> 0 alas plegadas, 1 volando
  //   agachado       -> se agacha para que subas
  //   cabezaAdelante -> acerca el hocico a tu mano
  //   enfado         -> echa la cabeza hacia atrás
  //   mirarX         -> gira la cabeza a izquierda/derecha (-1..1)
  function actualizar(t, estado) {
    const { aleteo, agachado, cabezaAdelante, enfado, mirarX } = estado;

    // Respiración y agacharse
    const respira = Math.sin(t * 1.6) * 0.04;
    torso.scale.y = 0.85 + respira;
    cuerpo.position.y = -agachado * 0.7 + Math.sin(t * 6) * 0.15 * aleteo;

    // Alas: plegadas en el suelo, batiendo en el aire
    const batir = Math.sin(t * 5.5) * 0.65 + 0.1;
    const angulo = lerp(1.05, batir, aleteo);
    const barrido = lerp(0.85, 0.05, aleteo);
    alaDer.rotation.set(0, barrido, angulo);
    alaIzq.rotation.set(0, -barrido, -angulo);

    // Cuello y cabeza
    cuello.rotation.x = INCLINACION_CUELLO + cabezaAdelante * 0.55 - enfado * 0.45 - aleteo * 0.25;
    cabeza.rotation.x = -INCLINACION_CUELLO - cabezaAdelante * 0.35 + enfado * 0.3 + aleteo * 0.25;
    cuello.rotation.y = mirarX * 0.5 + Math.sin(t * 0.7) * 0.08 + (enfado > 0.1 ? Math.sin(t * 25) * 0.08 * enfado : 0);
    mandibula.position.y = -0.3 - enfado * 0.15;

    // Cola que se mueve como una serpiente
    cola.forEach((seg, i) => {
      seg.rotation.y = Math.sin(t * 2 - i * 0.6) * 0.12;
      seg.rotation.x = i === 0 ? 0.15 - aleteo * 0.2 : 0.02;
    });

    // Patas recogidas al volar
    patas.forEach((p) => { p.rotation.x = -aleteo * 0.9; });
  }

  return { raiz, cuerpo, puntoLomo, actualizar };
}

// Silla de montar sencilla
export function crearSilla() {
  const cuero = new THREE.MeshStandardMaterial({ color: 0x5b3a1e, roughness: 0.85, flatShading: true });
  const metal = new THREE.MeshStandardMaterial({ color: 0xb08d57, metalness: 0.6, roughness: 0.4 });
  const silla = new THREE.Group();

  const asiento = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.22, 1.3), cuero);
  asiento.position.y = 0.11;
  const respaldo = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.35, 0.18), cuero);
  respaldo.position.set(0, 0.35, -0.6);
  const pomo = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.45, 6), metal);
  pomo.position.set(0, 0.4, 0.55);
  silla.add(asiento, respaldo, pomo);

  for (const lado of [1, -1]) {
    const correa = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.0, 0.18), cuero);
    correa.position.set(0.6 * lado, -0.35, 0);
    const estribo = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 5, 10), metal);
    estribo.position.set(0.62 * lado, -0.9, 0);
    estribo.rotation.y = Math.PI / 2;
    silla.add(correa, estribo);
  }
  silla.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return silla;
}
