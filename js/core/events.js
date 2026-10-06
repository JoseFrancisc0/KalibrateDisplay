/* ==========================================================
   core/events.js — delegación de eventos.

   En el HTML generado no hay onclick/onchange: los elementos
   declaran la acción con atributos de datos y un único listener
   por tipo de evento la despacha.

     <button data-click="setModo" data-arg="PRECIOS">
     <select data-change="cambiarFiltroMarker">
     <input  data-input="filtrarEstaciones">

   Cada acción recibe (elemento, evento). Las vistas registran
   sus acciones con registrarAcciones() (ver views/<vista>/acciones.js).
   ========================================================== */

const acciones = {};
const TIPOS = ['click', 'change', 'input'];

export function registrarAcciones(mapa) {
  Object.entries(mapa).forEach(([nombre, fn]) => {
    if (acciones[nombre]) console.warn(`Acción duplicada: ${nombre}`);
    acciones[nombre] = fn;
  });
}

/* Equivale al event.stopPropagation() de un handler inline:
   este delegador es el primer listener del documento, así que
   corta también a los listeners de "clic fuera" registrados después. */
export function detenerPropagacion(e) {
  if (e) e.stopImmediatePropagation();
}

/* Debe llamarse ANTES de que cualquier vista registre listeners
   en document, para conservar el orden handler → "clic fuera". */
export function iniciarEventos() {
  TIPOS.forEach(tipo => {
    document.addEventListener(tipo, (e) => {
      const el = (e.target instanceof Element) ? e.target.closest(`[data-${tipo}]`) : null;
      if (!el) return;
      const fn = acciones[el.dataset[tipo]];
      if (fn) fn(el, e);
    });
  });
}
