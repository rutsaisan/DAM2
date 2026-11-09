# El Cuaderno del Jinete

Simulador para aprender a montar un dragón paso a paso. Tiene dos partes:

- **Interfaz gráfica:** un cuaderno viejo de notas con los pasos. Cada página tiene notas escritas a mano, un dibujo del gesto que hay que hacer, una barra de progreso y un sello de «¡Conseguido!». La hoja se pasa con una animación.
- **Interfaz natural:** el simulador en 3D se maneja con gestos de la mano delante de la cámara.

## Cómo abrirlo

1. Abre la carpeta en Visual Studio Code.
2. Clic derecho en `index.html` y luego **Open with Live Server** (o ejecuta `python -m http.server` en la carpeta y entra en `http://localhost:8000`).
3. Usa **Chrome o Edge** y deja que la página use la cámara.

Necesita internet, porque three.js y MediaPipe se cargan desde un CDN.

Si no hay cámara, se puede jugar con **teclado y ratón**: el ratón hace de mano y las teclas imitan los gestos (1 ✋, 2 ✊, 3 ☝️, 4 👍, 5 👎, 6 ✌️).

## Los pasos

| Paso | Qué pasa | Gesto |
|---|---|---|
| Portada | Abrir el cuaderno | 👍 pulgar arriba 1 s |
| 1. Acercarse sin asustarla | La cámara avanza hacia la dragona | ☝️ índice arriba (mientras lo mantienes) |
| 2. Ganarse su confianza | Acerca el hocico a tu mano. Si mueves la mano, se asusta | ✋ palma abierta **y quieta** 3 s |
| 3. Ponerle la silla | Arrastras la silla del suelo hasta el lomo | ✊ puño para agarrar, mover a la derecha, abrir para soltar |
| 4. Subirse al lomo | La dragona se agacha y se gira | 👍 pulgar arriba 2 s |
| 5. Despegar | Abre las alas | ✋ palma abierta en la parte de arriba de la cámara |
| 6. Volar por los aros | Pasar por 3 aros dorados | Posición de la mano: izquierda/derecha para girar, arriba/abajo para la altura. ✊ = turbo |
| 7. Aterrizar | Bajar hasta el islote de la bandera | 👎 pulgar abajo para descender |
| Final | Tiempo total y volver a empezar | ✌️ victoria |

## Tecnologías

| Parte | Herramienta | Tipo |
|---|---|---|
| Gestos con la mano | `getUserMedia` + **MediaPipe Gesture Recognizer** | Cámara: navegador. MediaPipe: librería gratuita |
| Mundo 3D | **three.js** | Librería gratuita |
| Modelo del dragón y sus animaciones | `GLTFLoader` + `AnimationMixer` (three.js) | Librería gratuita |
| Cielo de 360° que también ilumina | `RGBELoader` (three.js) + HDRI de **Poly Haven** (CC0) | Librería y recurso gratuitos |
| Mar con olas y reflejos | `Water` (three.js), con la textura de olas generada en código | Librería gratuita |
| Sonidos (viento, alas, rugido, ronroneo, pasar hoja…) | **Web Audio API**: se generan con osciladores y ruido, sin archivos | Viene en el navegador |
| Leer los pasos en voz alta | Web Speech API (`speechSynthesis`) | Viene en el navegador |
| Modo sin cámara | Pointer Events + eventos de teclado | Viene en el navegador |
| Cuaderno | HTML y CSS (degradados para el papel, animación 3D para pasar la hoja) | — |

## Modelos 3D

Van en la carpeta `models/` y se configuran en `js/config.js`:

- `cielo`: el archivo .hdr del cielo.
- `dragon.archivo`: el modelo del dragón (.glb o .gltf). **Si no existe, se usa el dragón hecho con figuras** de `dragon.js`, así el simulador funciona siempre.
- `largo`, `rotacionY` y `lomo`: tamaño, hacia dónde mira y dónde va la silla.
- `animaciones`: qué animación del modelo usar en cada momento (parado, andar, volar, agacharse, enfado). Si se dejan vacías, se buscan por palabras como *idle*, *walk* o *fly*. Los nombres de las animaciones del modelo salen en la consola (F12) al cargar la página.

## Archivos

```
index.html            Estructura de la página
css/estilos.css       Aspecto del cuaderno y de los paneles
js/config.js          Qué modelos y qué cielo se usan
js/main.js            Pasos del cuaderno, vuelo, cámara y bucle principal
js/gestos.js          Cámara + MediaPipe, o teclado + ratón
js/dragon.js          Dragón de figuras (respaldo) y la silla
js/dragon-modelo.js   Carga el dragón descargado y sus animaciones
js/escena.js          Cielo, mar, isla, nubes, aros e islote
js/libreta.js         Páginas del cuaderno, progreso, sello y voz
js/sonido.js          Sonidos generados con Web Audio
models/               Modelos 3D y cielo
```

## Cómo se detectan los gestos

- MediaPipe da el **nombre del gesto** (Open_Palm, Closed_Fist, Thumb_Up…) y **21 puntos de la mano**.
- El centro de la palma (media entre la muñeca y la base del dedo corazón) se usa como posición de la mano. Se invierte en horizontal para que funcione como un espejo.
- Para que no haya falsos positivos, un gesto solo cuenta si se repite 4 fotogramas seguidos.
- La posición se suaviza para que no tiemble.
- «Mano quieta» significa que en los últimos 15 fotogramas la mano se ha movido menos de un 3 % de la imagen.

## Créditos

- **Dragón:** «Dragon Rigged and Game Ready» de **3DHaupt** (CGTrader). Licencia de uso no comercial: se usa solo en este trabajo de clase. En el simulador se pinta de rojo y se anima desde el código.
- **Cielo:** «Citrus Orchard (Pure Sky)» de **Poly Haven**, licencia CC0.
