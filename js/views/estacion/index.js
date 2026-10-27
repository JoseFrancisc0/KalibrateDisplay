/* ==========================================================
   views/estacion/index.js — Orquestador con soporte de Volumen
   ========================================================== */
import { estacionState, SUBVISTAS } from './state.js';
import { barraEstacionHTML } from './barra.js';
import { fichaEstacionHTML } from './rail_base.js';
import { render, refrescarViewBar } from '../../core/router.js';
import { detenerPropagacion } from '../../core/events.js';
import { state } from '../../core/state.js';
import { cargarDetalleEstacion, cargarVolumenEstacion } from '../../core/data.js';

import { estadoSubView } from './subviews/estado/index.js';
import { evolucionDiffSubView } from './subviews/deltas/index.js';
import { margenSubView } from './subviews/margen/index.js';
import { variacionSubView } from './subviews/variacion/index.js';
import { volumenSubView } from './subviews/volumen/index.js';

const SUBVIEWS = {
  'ESTADO': estadoSubView,
  'EVOLUCION_DIFF': evolucionDiffSubView,
  'MARGEN': margenSubView,
  'VARIACION': variacionSubView,
  'VOLUMEN': volumenSubView
};

const accionesBase = {
  async abrirDetalleEstacion(el, ev) {
    detenerPropagacion(ev);
    const siteId = el.dataset.arg;
    state.modoNivel = 'ESTACION';
    estacionState.seleccionadaId = siteId;
    estacionState.subVista = 'ESTADO';
    refrescarViewBar();
    render();

    if (estacionState.cache[siteId]) {
      estacionState.dataActiva = estacionState.cache[siteId];
    } else {
      estacionState.cargando = true;
      render();
      
      const data = await cargarDetalleEstacion(siteId);
      if (data) {
        data.volumen_historico = await cargarVolumenEstacion(siteId);
      }

      estacionState.dataActiva = data;
      estacionState.cache[siteId] = data;
      estacionState.cargando = false;
    }
    refrescarViewBar();
    render();
  },

  volverAMacro() {
    state.modoNivel = 'GENERAL';
    estacionState.seleccionadaId = null;
    estacionState.dataActiva = null;
    refrescarViewBar();
    render();
  },

  async setSubVistaEstacion(el) {
    const sub = el.dataset.arg;
    estacionState.subVista = sub;

    // Si se pulsa VOLUMEN y la estación no tenía cargado el arreglo aún
    if (sub === 'VOLUMEN' && estacionState.dataActiva && !estacionState.dataActiva.volumen_historico) {
      estacionState.dataActiva.volumen_historico = await cargarVolumenEstacion(estacionState.seleccionadaId);
    }

    refrescarViewBar();
    render();
  }
};

function detalleEstacionHTML() {
  return `
  <div id="detalle-estacion-shell" class="estacion-shell" style="display: none;">
    <div id="estacion-subview-content" style="flex: 1 1 auto; display: flex; flex-direction: column; min-height: 0; height: 100%; overflow: hidden;"></div>
  </div>
  `;
}

function renderDetalleEstacion() {
  const contentBox = document.getElementById('estacion-subview-content');
  if (!contentBox) return;

  if (estacionState.cargando) {
    contentBox.innerHTML = `<div class="empty-state">Descargando datos de la estación...</div>`;
    return;
  }

  const est = estacionState.dataActiva;
  if (!est) {
    contentBox.innerHTML = `<div class="empty-state">No se pudo cargar la información de la estación.</div>`;
    return;
  }

  const sub = SUBVIEWS[estacionState.subVista];
  if (sub && sub.render) {
    sub.render(contentBox, est);
  }
}

function railEstacionHTML() {
  return `<div id="rail-panel-estacion" class="rail-panel" style="display:none;"></div>`;
}

function actualizarRailEstacion() {
  const panel = document.getElementById('rail-panel-estacion');
  if (!panel) return;

  const ficha = fichaEstacionHTML();
  const sub = SUBVIEWS[estacionState.subVista];
  const controlesSub = (sub && sub.railHTML) ? sub.railHTML() : '';

  panel.innerHTML = ficha + controlesSub;
}

export const estacion = {
  shellSelector: '#detalle-estacion-shell',
  mainHTML: detalleEstacionHTML,
  barraHTML: barraEstacionHTML,
  railHTML: railEstacionHTML,
  actualizarRail: actualizarRailEstacion,
  railId: 'rail-panel-estacion',
  render: renderDetalleEstacion,
  etiquetaModo: () => `SUB-VISTA: ${SUBVISTAS[estacionState.subVista] || 'DETALLE'}`,
  acciones: {
    ...accionesBase,
    ...Object.values(SUBVIEWS).reduce((acc, s) => Object.assign(acc, s.acciones || {}), {})
  }
};