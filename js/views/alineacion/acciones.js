/* ==========================================================
   views/alineacion/acciones.js — respuesta a los controles de
   Alineación Competitiva.
   ========================================================== */

import { render, actualizarIndicadorModo } from '../../core/router.js';
import { state } from '../../core/state.js';
import { poblarSelect, valorDe, activar } from '../../shared/dom.js';
import { marcasCompetencia, etiquetaMarca } from '../../shared/marcas.js';
import { poblarSelectsSegmentacion } from '../../shared/segmentacion.js';
import { alineacionState } from './state.js';

/* ---------- Poblado de filtros ---------- */

export function poblarFiltrosAlineacion() {
  if (!state.rawData?.estaciones) return;
  const estaciones = state.rawData.estaciones;

  const selMarca = poblarSelect('sel-alineacion-marca', () => marcasCompetencia(estaciones), etiquetaMarca);
  if (selMarca && alineacionState.marcaCompetidora) {
    selMarca.value = alineacionState.marcaCompetidora;
  }
  actualizarVisibilidadCriterio();

  poblarSelectsSegmentacion(estaciones, {
    corredor: 'sel-alineacion-corredor',
    departamento: 'sel-alineacion-depto',
    gpc: 'sel-alineacion-gpc'
  });
}

/** El criterio de rival solo aplica cuando se elige una marca concreta. */
function actualizarVisibilidadCriterio() {
  const sec = document.getElementById('section-alineacion-criterio');
  if (!sec) return;
  const esMarca = alineacionState.marcaCompetidora && alineacionState.marcaCompetidora !== 'TODAS';
  sec.style.opacity = esMarca ? '1' : '0.45';
  sec.style.pointerEvents = esMarca ? 'auto' : 'none';
}

/* ---------- Acciones ---------- */

export const acciones = {
  cambiarMarcaAlineacion() {
    const v = valorDe('sel-alineacion-marca');
    if (v !== undefined) alineacionState.marcaCompetidora = v;
    actualizarVisibilidadCriterio();
    render();
  },

  cambiarCriterioAlineacion(el) {
    const criterio = el.dataset.arg;
    alineacionState.criterioRival = criterio;
    activar('btn-alineacion-cercano', criterio === 'CERCANO');
    activar('btn-alineacion-promedio', criterio === 'PROMEDIO');
    render();
  },

  cambiarCorredorAlineacion() {
    const v = valorDe('sel-alineacion-corredor');
    if (v !== undefined) alineacionState.corredor = v;
    render();
  },

  cambiarDeptoAlineacion() {
    const v = valorDe('sel-alineacion-depto');
    if (v !== undefined) alineacionState.departamento = v;
    render();
  },

  cambiarGpcAlineacion() {
    const v = valorDe('sel-alineacion-gpc');
    if (v !== undefined) alineacionState.gpcGroup = v;
    render();
  },

  seleccionarProductoAlineacion(el) {
    alineacionState.productoSeleccionado = el.dataset.arg;
    actualizarIndicadorModo();
    render();
  },

  cambiarFiltroAlineacionDetalle(el) {
    alineacionState.filtroDetalle = el.dataset.arg;
    render();
  },
};
