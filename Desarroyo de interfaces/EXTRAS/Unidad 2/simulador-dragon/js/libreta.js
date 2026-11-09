// =========================================================
// libreta.js
// Dibuja las páginas del cuaderno, pasa la hoja con animación,
// actualiza la barra de progreso y pone el sello de "conseguido".
// También puede leer cada página en voz alta (speechSynthesis).
// =========================================================
import { ICONOS, NOMBRES } from './gestos.js';

export class Libreta {
  constructor(pagina) {
    this.pagina = pagina;
    this.leerEnVoz = false;
  }

  // paso: objeto de main.js; numero: índice; titulos: lista de todos los pasos
  mostrar(paso, numero, titulos, completados, animar = true) {
    if (animar) this._girarHoja();

    const total = titulos.length - 2;          // sin contar portada ni final
    const etiqueta = paso.tipo === 'portada' ? 'Portada'
      : paso.tipo === 'final' ? 'Última página'
      : `Paso ${numero} de ${total}`;

    const notas = paso.notas.map((n) => `<p>${n}</p>`).join('');
    const gesto = paso.gesto
      ? `<div class="boceto">
           <span class="icono" aria-hidden="true">${ICONOS[paso.gesto]}</span>
           <div class="como"><strong>${NOMBRES[paso.gesto]}</strong><br>${paso.como}</div>
         </div>`
      : '';
    const truco = paso.truco ? `<p class="truco">${paso.truco}</p>` : '';
    const boton = paso.boton ? `<p><button class="boton-tinta" id="btnPagina">${paso.boton}</button></p>` : '';

    // Lista con todos los pasos (portada y final no salen)
    const lista = titulos.slice(1, -1).map((t, i) => {
      const n = i + 1;
      const clase = completados.has(n) ? 'hecho' : n === numero ? 'actual' : '';
      return `<li class="${clase}">${t}</li>`;
    }).join('');

    this.pagina.innerHTML = `
      <div class="cabecera-pagina"><span>${etiqueta}</span><span>Brasa ⟡</span></div>
      <h2>${paso.titulo}</h2>
      <div class="notas">${notas}</div>
      ${gesto}
      ${truco}
      ${paso.tipo === 'paso' ? '<div class="progreso" aria-label="Progreso del paso"><div id="barraProgreso"></div></div>' : ''}
      ${boton}
      <div class="lista-jinete">
        <h3>Lista del jinete</h3>
        <ol>${lista}</ol>
      </div>
      <div class="sello" id="sello">¡Conseguido!</div>
    `;
    this.pagina.scrollTop = 0;
    this.barra = this.pagina.querySelector('#barraProgreso');

    if (this.leerEnVoz) this.leer(`${paso.titulo}. ${paso.como ?? paso.notas.join(' ')}`);
  }

  progreso(valor) {
    if (this.barra) this.barra.style.width = `${Math.round(Math.max(0, Math.min(1, valor)) * 100)}%`;
  }

  sellar() {
    this.pagina.querySelector('#sello')?.classList.add('visible');
  }

  // Se hace una copia de la hoja actual y se gira encima de la nueva
  _girarHoja() {
    if (!this.pagina.innerHTML.trim()) return;
    const copia = this.pagina.cloneNode(true);
    copia.removeAttribute('id');
    copia.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    copia.classList.add('hoja-girando');
    this.pagina.parentElement.appendChild(copia);
    copia.addEventListener('animationend', () => copia.remove());
  }

  leer(texto) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const limpio = texto.replace(/<[^>]+>/g, '');
    const frase = new SpeechSynthesisUtterance(limpio);
    frase.lang = 'es-ES';
    frase.rate = 1;
    speechSynthesis.speak(frase);
  }
}
