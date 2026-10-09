/* ==========================================================
   views/estacion/index.js — Orquestador del nivel "Detalle de Estación".
   ========================================================== */
import { estacionState, SUBVISTAS } from './state.js';
import { barraEstacionHTML } from './barra.js';
import { fichaEstacionHTML } from './rail_base.js';
import { render, refrescarViewBar } from '../../core/router.js';
import { detenerPropagacion } from '../../core/events.js';
import { state } from '../../core/state.js';
import { cargarDetalleEstacion } from '../../core/data.js';

import { estadoSubView } from './subviews/estado/index.js';
import { evolucionPreciosSubView } from './subviews/precios/index.js';
import { evolucionDiffSubView } from './subviews/deltas/index.js';

// Registro de sub-vistas del nivel estación
const SUBVIEWS = {
  'ESTADO': estadoSubView,
  'EVOLUCION_PRECIOS': evolucionPreciosSubView,
  'EVOLUCION_DIFF': evolucionDiffSubView
};

// Acciones base de navegación dentro del nivel
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

  setSubVistaEstacion(el) {
    estacionState.subVista = el.dataset.arg;
    refrescarViewBar();
    render();
  }
};

// Renderizado del main shell
function detalleEstacionHTML() {
  return `
    <div id="detalle-estacion-shell" class="estacion-shell" style="display: none;">
      <div id="estacion-subview-content" style="flex: 1 1 auto; display: flex; flex-direction: column; min-height: 0; height: 100%; overflow: hidden;"></div>
    </div>
  `;
}

// Despacho del render a la sub-vista activa
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
  } else {
    contentBox.innerHTML = `
      <div class="empty-state">
        <h3>${SUBVISTAS[estacionState.subVista] || estacionState.subVista}</h3>
        <p>Próximamente disponible.</p>
      </div>
    `;
  }
}

// Despacho del rail: Ficha técnica base + Controles específicos de la sub-vista
function railEstacionHTML() {
  return `
    <div id="rail-panel-estacion" class="rail-panel" style="display:none;"></div>
  `;
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