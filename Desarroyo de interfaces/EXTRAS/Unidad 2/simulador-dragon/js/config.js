// =========================================================
// config.js
// Aquí se cambian los archivos 3D sin tocar el resto del código.
// =========================================================
export const CONFIG = {
  // Cielo de 360° (HDRI de Poly Haven). Si falla, se usa un color liso.
  cielo: 'models/citrus_orchard_puresky_2k.hdr',

  dragon: {
    // Modelo del dragón (.fbx, .glb o .gltf). Las texturas tienen que estar
    // en la misma carpeta. Si el archivo no existe, se usa el dragón de figuras.
    // Dragón de 3DHaupt (CGTrader), licencia de uso no comercial.
    archivo: 'models/dragon/Dragon 2.5_fbx.fbx',

    largo: 11,         // metros que medirá de la cabeza a la cola
    rotacionY: 0,      // radianes, por si el modelo no mira hacia +Z (prueba Math.PI o Math.PI / 2)

    // Punto del lomo donde va la silla, en las unidades ORIGINALES del archivo.
    // Medido en la malla: el lomo está a 19,5 de alto, 4 por detrás del pecho.
    lomoOriginal: { x: 0, y: 19.6, z: -4 },

    // Pintar el modelo de otro color conservando el detalle de la textura.
    // Pon null para dejar sus colores originales (negro).
    tinte: { color: '#b3261e', brillo: 2.2, minimo: 0.12 },

    // Este modelo no trae animaciones, así que se mueven sus huesos.
    huesos: {
      alaIzq: 'w_C_L',
      alaDer: 'w_C_R',
      cuello: ['ACT_neck_3', 'ACT_neck_2', 'ACT_neck_1', 'head'],
      mandibula: 'Bone',
      cola: ['tail_1', 'tail_2', 'tail_3', 'ik_ACT_tail_5'],
      patas: [],       // los pies van sueltos en el esqueleto: mejor no tocarlos
    },

    // Postura de las alas en el suelo (en radianes):
    // subir = cuánto se levantan, barrer = cuánto se echan hacia atrás.
    alas: { plegadaSubir: 0.35, plegadaBarrer: 1.25 },

    // Nombres exactos de las animaciones, por si el modelo trae alguna.
    animaciones: { parado: '', andar: '', volar: '', agacharse: '', enfado: '' },
  },
};
