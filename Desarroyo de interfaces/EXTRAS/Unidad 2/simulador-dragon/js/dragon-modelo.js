// =========================================================
// dragon-modelo.js
// Carga un dragón descargado (.fbx, .glb o .gltf) y lo prepara para
// que funcione igual que el dragón hecho con figuras de dragon.js:
// devuelve { raiz, cuerpo, puntoLomo, actualizar(t, estado) }.
//
// Si el archivo trae animaciones, se reproducen con AnimationMixer.
// Si no (como el dragón de 3DHaupt), se anima moviendo sus huesos
// desde el código: alas, cuello, cabeza, cola y patas.
// =========================================================
import * as THREE from 'three';

// Palabras que se buscan en los nombres de las animaciones
const PALABRAS = {
  parado: ['idle', 'stand', 'breath', 'wait'],
  andar: ['walk', 'run'],
  volar: ['fly', 'flying', 'glide', 'hover'],
  agacharse: ['sit', 'crouch', 'lie', 'sleep', 'rest'],
  enfado: ['roar', 'scream', 'yell', 'attack'],
};

const lerp = (a, b, t) => a + (b - a) * t;

function buscarClip(clips, nombreExacto, palabras) {
  if (nombreExacto) {
    const exacto = clips.find((c) => c.name === nombreExacto);
    if (exacto) return exacto;
    console.warn(`No hay ninguna animación llamada "${nombreExacto}"`);
  }
  for (const p of palabras) {
    const clip = clips.find((c) => c.name.toLowerCase().includes(p));
    if (clip) return clip;
  }
  return null;
}

// ---------- Materiales ----------
// Los FBX traen materiales Phong. Los pasamos a MeshStandardMaterial
// para que el cielo HDRI les dé luz y reflejos.
function mejorarMateriales(objeto) {
  objeto.traverse((o) => {
    if (!o.isMesh) return;
    const convertir = (m) => {
      if (!m || m.isMeshStandardMaterial) return m;
      const nuevo = new THREE.MeshStandardMaterial({
        name: m.name,
        color: m.color ?? 0xffffff,
        map: m.map ?? null,
        normalMap: m.normalMap ?? null,
        roughness: 0.75,
        metalness: 0.05,
        transparent: m.transparent,
        opacity: m.opacity,
        side: m.side,
      });
      if (nuevo.map) nuevo.map.colorSpace = THREE.SRGBColorSpace;
      m.dispose();
      return nuevo;
    };
    o.material = Array.isArray(o.material) ? o.material.map(convertir) : convertir(o.material);
  });
}

// Cambia el color sin perder el detalle de la textura: se usa la
// luminosidad de la textura original y se multiplica por el color nuevo.
// Así un dragón negro puede pasar a ser rojo. Los ojos no se tocan.
function tenir(objeto, { color = '#b3261e', brillo = 2.2, minimo = 0.12 } = {}) {
  const tinte = new THREE.Color(color);
  objeto.traverse((o) => {
    if (!o.isMesh) return;
    const materiales = Array.isArray(o.material) ? o.material : [o.material];
    materiales.forEach((m) => {
      if (!m || /eye|auge|ojo/i.test(m.name)) return;
      m.onBeforeCompile = (shader) => {
        shader.uniforms.uTinte = { value: tinte };
        shader.fragmentShader = shader.fragmentShader
          .replace('void main() {', 'uniform vec3 uTinte;\nvoid main() {')
          .replace('#include <map_fragment>', `#include <map_fragment>
            float luz = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
            diffuseColor.rgb = uTinte * clamp(${minimo.toFixed(3)} + luz * ${brillo.toFixed(3)}, 0.0, 1.5);`);
      };
      m.needsUpdate = true;
    });
  });
}

// ---------- Carga ----------
async function cargarArchivo(cfg) {
  // Las texturas se buscan siempre en la misma carpeta que el modelo,
  // aunque el archivo diga otra ruta (p. ej. "textures\Dragon.jpg").
  const carpeta = cfg.archivo.slice(0, cfg.archivo.lastIndexOf('/') + 1);
  const gestor = new THREE.LoadingManager();
  gestor.setURLModifier((url) => {
    if (/\.(jpe?g|png|tga|bmp|webp)$/i.test(url) && !url.startsWith('blob:') && !url.startsWith('data:')) {
      const nombre = decodeURIComponent(url).split(/[\\/]/).pop();
      return carpeta + encodeURIComponent(nombre);
    }
    return url;
  });

  if (cfg.archivo.toLowerCase().endsWith('.fbx')) {
    const { FBXLoader } = await import('three/addons/loaders/FBXLoader.js');
    const obj = await new FBXLoader(gestor).loadAsync(encodeURI(cfg.archivo));
    return { cargado: obj, clips: obj.animations ?? [] };
  }
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const gltf = await new GLTFLoader(gestor).loadAsync(encodeURI(cfg.archivo));
  return { cargado: gltf.scene, clips: gltf.animations ?? [] };
}

export async function cargarDragonModelo(cfg) {
  if (!cfg?.archivo) return null;

  let cargado, clips;
  try {
    ({ cargado, clips } = await cargarArchivo(cfg));
  } catch (err) {
    console.info(`No se ha cargado "${cfg.archivo}", se usa el dragón de figuras.`, err?.message ?? err);
    return null;
  }

  // Fuera luces y cámaras que vengan dentro del archivo
  const sobran = [];
  cargado.traverse((o) => { if (o.isLight || o.isCamera) sobran.push(o); });
  sobran.forEach((o) => o.parent.remove(o));

  mejorarMateriales(cargado);
  if (cfg.tinte) tenir(cargado, cfg.tinte);

  // Contenedor para girarlo y escalarlo sin tocar el objeto original
  const modelo = new THREE.Group();
  modelo.add(cargado);
  modelo.rotation.y = cfg.rotacionY ?? 0;

  // Escalar para que mida "largo" metros de la cabeza a la cola y apoyarlo en el suelo.
  // Con esqueleto, hay que calcular los huesos antes de medir la caja.
  modelo.updateMatrixWorld(true);
  modelo.traverse((o) => {
    if (o.isSkinnedMesh) { o.skeleton.update(); o.computeBoundingBox?.(); }
  });
  let caja = new THREE.Box3().setFromObject(modelo);
  const tam = caja.getSize(new THREE.Vector3());
  const largoActual = Math.abs(Math.sin(modelo.rotation.y)) > 0.7 ? tam.x : tam.z;
  modelo.scale.multiplyScalar((cfg.largo ?? 7) / Math.max(largoActual, 0.001));
  modelo.updateMatrixWorld(true);
  caja = new THREE.Box3().setFromObject(modelo);
  const centro = caja.getCenter(new THREE.Vector3());
  modelo.position.x -= centro.x;
  modelo.position.z -= centro.z;
  modelo.position.y -= caja.min.y;
  modelo.updateMatrixWorld(true);
  const alto = caja.max.y - caja.min.y;

  // Punto del lomo (donde va la silla), pasado a las coordenadas finales
  let puntoLomo;
  if (cfg.lomoOriginal) {
    const p = new THREE.Vector3(cfg.lomoOriginal.x, cfg.lomoOriginal.y, cfg.lomoOriginal.z);
    puntoLomo = cargado.localToWorld(p);   // "modelo" aún no tiene padre: esto es el espacio de "cuerpo"
  } else {
    puntoLomo = new THREE.Vector3(0, alto * 0.62, 0);
  }

  modelo.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
      o.frustumCulled = false;   // los modelos con esqueleto a veces "desaparecen" sin esto
    }
  });

  const raiz = new THREE.Group();
  raiz.rotation.order = 'YXZ';
  const cuerpo = new THREE.Group();
  raiz.add(cuerpo);
  cuerpo.add(modelo);

  // ---------- Animaciones del archivo (si las hay) ----------
  const mezclador = new THREE.AnimationMixer(cargado);
  console.info('Animaciones del modelo:', clips.map((c) => c.name));
  const acciones = {};
  for (const clave of Object.keys(PALABRAS)) {
    const clip = buscarClip(clips, cfg.animaciones?.[clave], PALABRAS[clave]);
    if (clip) acciones[clave] = mezclador.clipAction(clip);
  }
  if (!acciones.parado && clips[0]) acciones.parado = mezclador.clipAction(clips[0]);

  let actual = null;
  function cambiarA(clave) {
    const accion = acciones[clave] ?? acciones.parado;
    if (!accion || accion === actual) return;
    accion.reset().fadeIn(0.4).play();
    actual?.fadeOut(0.4);
    actual = accion;
  }
  cambiarA('parado');

  // ---------- Animación por huesos ----------
  const h = cfg.huesos ?? {};
  const hueso = (n) => (n ? cargado.getObjectByName(n) : null);
  const lista = (ns) => (ns ?? []).map(hueso).filter(Boolean);
  const alaIzq = hueso(h.alaIzq);     // ala del lado +X
  const alaDer = hueso(h.alaDer);     // ala del lado -X
  const cuello = lista(h.cuello);
  const cola = lista(h.cola);
  const patas = lista(h.patas);
  const mandibula = hueso(h.mandibula);
  const todos = [alaIzq, alaDer, mandibula, ...cuello, ...cola, ...patas].filter(Boolean);
  if (todos.length) console.info('Huesos animados por código:', todos.map((b) => b.name));
  const reposo = new Map(todos.map((b) => [b, b.quaternion.clone()]));

  const X = new THREE.Vector3(1, 0, 0);
  const Y = new THREE.Vector3(0, 1, 0);
  const Z = new THREE.Vector3(0, 0, 1);
  const qPadre = new THREE.Quaternion();
  const qRaiz = new THREE.Quaternion();
  const qRot = new THREE.Quaternion();

  // Gira un hueso alrededor de un eje del MODELO (no del propio hueso),
  // así da igual cómo esté orientado cada hueso por dentro.
  function girar(b, eje, angulo) {
    if (!b || Math.abs(angulo) < 1e-4) return;
    b.parent.getWorldQuaternion(qPadre);
    cargado.getWorldQuaternion(qRaiz);
    const rel = qRaiz.invert().multiply(qPadre);              // orientación del padre dentro del modelo
    qRot.setFromAxisAngle(eje, angulo);
    const local = rel.clone().invert().multiply(qRot).multiply(rel);
    b.quaternion.premultiply(local);
    b.updateMatrixWorld(true);
  }

  const al = cfg.alas ?? {};
  const pliegue = { subir: al.plegadaSubir ?? 0.35, barrer: al.plegadaBarrer ?? 1.25 };
  let fase = 0;

  function animarHuesos(t, dt, estado) {
    const { aleteo, cabezaAdelante, enfado, mirarX, andar } = estado;

    // Alas: plegadas hacia atrás en el suelo, batiendo en el aire
    fase += dt * lerp(1.6, 5.5, aleteo);
    const batir = Math.sin(fase) * 0.55 + 0.05;
    const subir = lerp(pliegue.subir + Math.sin(t * 1.6) * 0.03, batir, aleteo);
    const barrer = lerp(pliegue.barrer, 0.12, aleteo);
    girar(alaIzq, Z, subir);
    girar(alaIzq, Y, barrer);
    girar(alaDer, Z, -subir);
    girar(alaDer, Y, -barrer);

    // Cuello y cabeza: mirar a los lados, bajar el hocico o echarse atrás
    const n = Math.max(cuello.length, 1);
    const temblor = enfado > 0.1 ? Math.sin(t * 25) * 0.05 * enfado : 0;
    cuello.forEach((b) => {
      girar(b, Y, (mirarX * 0.6 + Math.sin(t * 0.7) * 0.08 + temblor) / n);
      girar(b, X, (cabezaAdelante * 0.55 - enfado * 0.4 - aleteo * 0.15) / n);
    });

    // Abre la boca cuando se enfada (y un poco al ronronear)
    girar(mandibula, X, enfado * 0.35 + cabezaAdelante * 0.05);

    // Cola que se mueve como una serpiente
    cola.forEach((b, i) => girar(b, Y, Math.sin(t * 2 - i * 0.6) * 0.1));

    // Patas: recogidas al volar y un pequeño paso al andar
    patas.forEach((b, i) => {
      const paso = andar * Math.sin(t * 6 + (i % 2) * Math.PI) * 0.35;
      girar(b, X, aleteo * 0.9 + paso);
    });
  }

  let tAnterior = null;
  function actualizar(t, estado) {
    const dt = tAnterior === null ? 0 : Math.min(t - tAnterior, 0.1);
    tAnterior = t;

    // Cada fotograma se parte de la postura original
    reposo.forEach((q, b) => b.quaternion.copy(q));

    if (estado.aleteo > 0.5) cambiarA('volar');
    else if (estado.enfado > 0.5 && acciones.enfado) cambiarA('enfado');
    else if (estado.agachado > 0.5 && acciones.agacharse) cambiarA('agacharse');
    else if (estado.andar > 0.5 && acciones.andar) cambiarA('andar');
    else cambiarA('parado');
    mezclador.update(dt);

    cargado.updateMatrixWorld(true);
    if (todos.length) animarHuesos(t, dt, estado);

    // Respirar, agacharse e inclinarse moviendo el modelo entero
    cuerpo.position.y = (acciones.agacharse ? 0 : -estado.agachado * 0.45) + Math.sin(t * 1.6) * 0.02;
    cuerpo.position.z = estado.cabezaAdelante * 0.4 - estado.enfado * 0.3;
    cuerpo.rotation.x = estado.agachado * 0.05;
  }

  return { raiz, cuerpo, puntoLomo, actualizar, esModelo: true };
}
