/* ==========================================================
   core/router.js — navegación entre vistas y ciclo de render.

   No conoce ninguna vista en concreto: main.js le entrega el
   registro (views/index.js) con configurarRouter().

   Contrato de una vista general (ver views/matriz/index.js):
     id, label, tabId        → pestaña en la barra de vistas
     shellSelector, display  → contenedor principal y cómo se muestra
     railId                  → panel de filtros en el rail
     usaTabbar               → si muestra la cinta inferior
     railHTML(), mainHTML(), tabbarHTML?()
     alEntrar?()             → al activar la vista (puede ser async)
     render()                → dibuja la vista
     etiquetaModo()          → texto del indicador derecho
     alRedimensionar?()      → al cambiar el tamaño de ventana
   ========================================================== */

import { state } from './state.js';
import { viewBarGeneralHTML } from '../layout/view-bar.js';

let vistas = [];
let estacion = null;          // nivel "detalle de estación"
let alRenderGeneral = null;   // hook previo al render de una vista general

export function configurarRouter(config) {
  vistas = config.vistas;
  estacion = config.estacion;
  alRenderGeneral = config.alRenderGeneral || null;
}

export function getVista(id) {
  return vistas.find(v => v.id === id) || null;
}

export function vistaActual() {
  return getVista(state.vistaActiva);
}

function mostrar(el, display) {
  if (el) el.style.display = display;
}

function shellDe(vista) {
  return document.querySelector(vista.shellSelector);
}

/* ---------- Barra de vistas ---------- */

export function viewBarHTML() {
  return (state.modoNivel === 'ESTACION')
    ? estacion.barraHTML()
    : viewBarGeneralHTML(vistas, state.vistaActiva || 'MATRIZ');
}

export function refrescarViewBar() {
  const barWrapper = document.querySelector('.view-bar');
  if (barWrapper) {
    barWrapper.outerHTML = viewBarHTML();
  }
}

export function actualizarIndicadorModo() {
  const modeLabel = document.getElementById('view-mode');
  if (!modeLabel) return;

  if (state.modoNivel === 'ESTACION') {
    modeLabel.innerText = estacion.etiquetaModo();
    return;
  }

  const vista = vistaActual();
  if (vista) modeLabel.innerText = vista.etiquetaModo();
}

/* ---------- Cambio de vista general ---------- */

/* ---------- Cambio de vista general ---------- */
export async function setVista(id) {
  state.vistaActiva = id;
  vistas.forEach(v => {
    const btn = document.getElementById(v.tabId);
    if (btn) btn.classList.toggle('active', v.id === id);
  });

  vistas.forEach(v => mostrar(shellDe(v), 'none'));
  mostrar(document.querySelector(estacion.shellSelector), 'none');
  mostrar(document.getElementById('cmp-tabbar'), 'none');
  
  vistas.forEach(v => mostrar(document.getElementById(v.railId), 'none'));
  mostrar(document.getElementById(estacion.railId), 'none');

  const vista = getVista(id);
  if (vista) {
    mostrar(shellDe(vista), vista.display);
    if (vista.usaTabbar) mostrar(document.getElementById('cmp-tabbar'), 'flex');
    mostrar(document.getElementById(vista.railId), 'flex');
    if (vista.alEntrar) await vista.alEntrar();
  }

  actualizarIndicadorModo();
  render();
}

/* ---------- Render ---------- */
export function render() {
  if (!state.rawData || !state.rawData.estaciones) return;

  const detalleShell = document.querySelector(estacion.shellSelector);
  const railEstacionEl = document.getElementById(estacion.railId);

  // -------------------------------------------------------------
  // NIVEL ESTACIÓN (MODO QUIRÚRGICO)
  // -------------------------------------------------------------
  if (state.modoNivel === 'ESTACION') {
    vistas.forEach(v => {
      mostrar(shellDe(v), 'none');
      mostrar(document.getElementById(v.railId), 'none');
    });
    mostrar(document.getElementById('cmp-tabbar'), 'none');

    mostrar(detalleShell, 'block');
    mostrar(railEstacionEl, 'flex');
    if (estacion.actualizarRail) estacion.actualizarRail();

    estacion.render();
    actualizarIndicadorModo();
    return;
  }

  // -------------------------------------------------------------
  // NIVEL GENERAL (4 VISTAS PRINCIPALES)
  // -------------------------------------------------------------
  mostrar(detalleShell, 'none');
  mostrar(railEstacionEl, 'none');

  if (alRenderGeneral) alRenderGeneral();

  const vista = vistaActual();
  if (vista) {
    vistas.forEach(v => {
      const activo = (v.id === vista.id);
      mostrar(shellDe(v), activo ? v.display : 'none');
      mostrar(document.getElementById(v.railId), activo ? 'flex' : 'none');
    });
    vista.render();
  }
}

/* ---------- Redimensionado ---------- */

export function alRedimensionar() {
  if (state.modoNivel === 'GENERAL') {
    const vista = vistaActual();
    if (vista && vista.alRedimensionar) vista.alRedimensionar();
  }
  render();
}
