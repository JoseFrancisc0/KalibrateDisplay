/* ==========================================================
   views/matriz/acciones.js — respuesta a los controles de la
   Matriz (rail, filas y cinta inferior).
   ========================================================== */

import { render, actualizarIndicadorModo } from '../../core/router.js';
import { detenerPropagacion } from '../../core/events.js';
import { state } from '../../core/state.js';
import { poblarSelect, valorDe, activar } from '../../shared/dom.js';
import { marcasCompetencia, etiquetaMarca } from '../../shared/marcas.js';
import { matrizState } from './state.js';

/* ---------- Poblado de filtros ---------- */

export function poblarFiltroMarcas() {
  if (!state.rawData?.estaciones) return;
  const sel = poblarSelect('sel-matriz-marca', () => marcasCompetencia(state.rawData.estaciones), etiquetaMarca);
  if (!sel) return;

  if (matrizState.filtroMarca) {
    sel.value = matrizState.filtroMarca;
  }
}

/* ---------- DropUp de agrupación ---------- */

function cerrarDropupAgrupacion() {
  const wrap = document.getElementById('tabbar-group-wrap');
  const drop = document.getElementById('dropup-agrupacion');
  if (drop) drop.style.display = 'none';
  if (wrap) wrap.classList.remove('open');
}

/** Listeners de documento propios de la vista (clic fuera / Escape). */
export function iniciarListenersMatriz() {
  document.addEventListener('click', (e) => {
    const wrap = document.getElementById('tabbar-group-wrap');
    if (wrap && !wrap.contains(e.target)) cerrarDropupAgrupacion();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarDropupAgrupacion();
  });
}

/* ---------- Acciones ---------- */

export const acciones = {
  setModo(el) {
    const modo = el.dataset.arg;
    matrizState.modoActual = modo;
    activar('btn-precios', modo === 'PRECIOS');
    activar('btn-diferencial', modo === 'DIFERENCIAL');
    actualizarIndicadorModo();
    render();
  },

  filtrarEstaciones() {
    matrizState.subPaginaGrupo = 0;
    render();
  },

  cambiarFiltroMarker() {
    const v = valorDe('sel-marker');
    if (v !== undefined) matrizState.filtroMarker = v;
    render();
  },

  cambiarFiltroMarcaMatriz() {
    const v = valorDe('sel-matriz-marca');
    if (v !== undefined) matrizState.filtroMarca = v;
    render();
  },

  toggleGroup(el) {
    const siteId = el.dataset.arg;
    if (matrizState.expandedGroups.has(siteId)) {
      matrizState.expandedGroups.delete(siteId);
    } else {
      matrizState.expandedGroups.add(siteId);
      matrizState.scrollTarget = siteId;
    }
    render();
  },

  toggleDropupAgrupacion(el, ev) {
    detenerPropagacion(ev);
    const wrap = document.getElementById('tabbar-group-wrap');
    const drop = document.getElementById('dropup-agrupacion');
    if (!wrap || !drop) return;
    const abierto = drop.style.display === 'block';
    drop.style.display = abierto ? 'none' : 'block';
    wrap.classList.toggle('open', !abierto);
  },

  cambiarAgrupacion(el) {
    const id = el.dataset.arg;
    cerrarDropupAgrupacion();
    if (matrizState.agrupacionTabs === id) return;
    matrizState.agrupacionTabs = id;
    matrizState.grupoActivo = '';
    matrizState.subPaginaGrupo = 0;

    // Resetear jerarquía si sale de Ubicación
    matrizState.jerarquiaNivel = 'DEPTO';
    matrizState.deptoActivo = null;
    matrizState.provinciaActiva = null;
    matrizState.distritoActivo = null;

    const scroll = document.getElementById('table-scroll');
    if (scroll) scroll.scrollTop = 0;
    render();
  },

  retrocederJerarquiaMatriz() {
    if (matrizState.jerarquiaNivel === 'DISTRITO') {
      matrizState.jerarquiaNivel = 'PROVINCIA';
      matrizState.grupoActivo = matrizState.provinciaActiva || 'TODAS';
    } else if (matrizState.jerarquiaNivel === 'PROVINCIA') {
      matrizState.jerarquiaNivel = 'DEPTO';
      matrizState.grupoActivo = matrizState.deptoActivo;
    }
    matrizState.subPaginaGrupo = 0;
    render();
  },

  desplazarPestanas(el) {
    const tabs = document.getElementById('tabs');
    if (tabs) tabs.scrollLeft += Number(el.dataset.arg);
  },
};
