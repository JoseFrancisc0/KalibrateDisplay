/* ==========================================================
   shared/dom.js — utilidades de DOM reutilizadas por las vistas.
   ========================================================== */

/**
 * Agrega opciones a un <select> solo la primera vez
 * (mientras tenga únicamente la opción "Todos/Todas").
 * `valores` es una función para no calcular la lista si no hace falta.
 */
export function poblarSelect(id, valores, etiqueta = (v) => v) {
  const sel = document.getElementById(id);
  if (sel && sel.options.length <= 1) {
    valores().forEach(v => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = etiqueta(v);
      sel.appendChild(opt);
    });
  }
  return sel;
}

/** Valor actual de un control por id (o undefined si no existe). */
export function valorDe(id) {
  const el = document.getElementById(id);
  return el ? el.value : undefined;
}

/** Marca como activo el botón `id` si `activo` es verdadero. */
export function activar(id, activo) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('active', activo);
}

/** Abre/cierra un desplegable alternando display none ↔ block. */
export function alternarDesplegable(id) {
  const drop = document.getElementById(id);
  if (drop) {
    drop.style.display = (drop.style.display === 'none' || !drop.style.display) ? 'block' : 'none';
  }
}

/** Cierra el desplegable `dropId` al hacer clic fuera de `wrapId`. */
export function cerrarAlClicFuera(wrapId, dropId) {
  document.addEventListener('click', (e) => {
    const wrap = document.getElementById(wrapId);
    const drop = document.getElementById(dropId);
    if (wrap && drop && !wrap.contains(e.target)) drop.style.display = 'none';
  });
}

/**
 * Repuebla un <select> dinámicamente eliminando opciones anteriores (excepto 'TODOS').
 * Retorna el valor que quedó seleccionado (conserva el anterior si aún existe, sino cae a 'TODOS').
 */
export function repoblarSelect(id, valores, valorSeleccionado = 'TODOS', etiqueta = (v) => v) {
  const sel = document.getElementById(id);
  if (!sel) return 'TODOS';

  const primeraOpcion = sel.options[0]; // Conserva 'TODOS' / 'Todos los...'
  sel.innerHTML = '';
  if (primeraOpcion) sel.appendChild(primeraOpcion);

  const listaValores = typeof valores === 'function' ? valores() : valores;
  let valorSigueExistiendo = false;

  listaValores.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = etiqueta(v);
    if (v === valorSeleccionado) valorSigueExistiendo = true;
    sel.appendChild(opt);
  });

  const nuevoValor = valorSigueExistiendo ? valorSeleccionado : 'TODOS';
  sel.value = nuevoValor;
  return nuevoValor;
}