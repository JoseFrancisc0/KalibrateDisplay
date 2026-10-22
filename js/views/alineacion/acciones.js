/* ==========================================================
   views/alineacion/acciones.js — respuesta a los controles de
   Alineación Competitiva.
   ========================================================== */

import { render, actualizarIndicadorModo } from '../../core/router.js';
import { state } from '../../core/state.js';
import { valorDe, activar, poblarSelect, repoblarSelect } from '../../shared/dom.js';
import { inicializarSearchableSelect } from '../../shared/combobox.js';
import { marcasCompetencia, etiquetaMarca } from '../../shared/marcas.js';
import { poblarSelectsSegmentacion, valoresUnicos } from '../../shared/segmentacion.js';
import { alineacionState } from './state.js';

/* ---------- Cascada Geográfica Dinámica ---------- */
function sincronizarCascadaGeografica(estaciones) {
  const estacionesDepto = estaciones.filter(e => {
    if (alineacionState.departamento === 'TODOS') return true;
    const d = (e.departamento || '').trim().toUpperCase();
    return d === alineacionState.departamento;
  });

  alineacionState.provincia = repoblarSelect(
    'sel-alineacion-provincia',
    () => valoresUnicos(estacionesDepto, 'provincia'),
    alineacionState.provincia
  );

  const estacionesProv = estacionesDepto.filter(e => {
    if (alineacionState.provincia === 'TODOS') return true;
    const p = (e.provincia || '').trim().toUpperCase();
    return p === alineacionState.provincia;
  });

  alineacionState.distrito = repoblarSelect(
    'sel-alineacion-distrito',
    () => valoresUnicos(estacionesProv, 'distrito'),
    alineacionState.distrito
  );
}

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
    gpc: 'sel-alineacion-gpc',
    gop: 'sel-alineacion-gop',
    jop: 'sel-alineacion-jop',
    corredor: 'sel-alineacion-corredor',
    departamento: 'sel-alineacion-depto',
  });

  sincronizarCascadaGeografica(estaciones);

  [
    'sel-alineacion-gpc',
    'sel-alineacion-gop',
    'sel-alineacion-jop',
    'sel-alineacion-corredor',
    'sel-alineacion-depto',
    'sel-alineacion-provincia',
    'sel-alineacion-distrito'
  ].forEach(id => {
    inicializarSearchableSelect(id);
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
  toggleDrawerAlineacion() {
    alineacionState.drawerAbierto = !alineacionState.drawerAbierto;
    const panel = document.getElementById('drawer-panel-alineacion');
    const badge = document.getElementById('badge-alineacion-filtros');
    if (panel) panel.style.display = alineacionState.drawerAbierto ? 'block' : 'none';
    if (badge) badge.textContent = alineacionState.drawerAbierto ? '▲ Ocultar' : '▼ Configurar';
  },

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

  cambiarGPCAlineacion() {
    const v = valorDe('sel-alineacion-gpc');
    if (v !== undefined) alineacionState.gpc = v;
    render();
  },

  cambiarGOPAlineacion() {
    const v = valorDe('sel-alineacion-gop');
    if (v !== undefined) alineacionState.gop = v;
    render();
  },

  cambiarJOPAlineacion() {
    const v = valorDe('sel-alineacion-jop');
    if (v !== undefined) alineacionState.jop = v;
    render();
  },

  cambiarCorredorAlineacion() {
    const v = valorDe('sel-alineacion-corredor');
    if (v !== undefined) alineacionState.corredor = v;
    render();
  },

  cambiarDeptoAlineacion() {
    const v = valorDe('sel-alineacion-depto');
    if (v !== undefined) {
      alineacionState.departamento = v;
      sincronizarCascadaGeografica(state.rawData.estaciones);
    } 
    render();
  },

  cambiarProvinciaAlineacion() {
    const v = valorDe('sel-alineacion-provincia');
    if (v !== undefined) {
      alineacionState.provincia = v;
      sincronizarCascadaGeografica(state.rawData.estaciones);
    } 
    render();
  },

  cambiarDistritoAlineacion() {
    const v = valorDe('sel-alineacion-distrito');
    if (v !== undefined) alineacionState.distrito = v;
    render();
  },

  limpiarFiltrosAlineacion() {
    const ids = [
      'sel-alineacion-gpc', 'sel-alineacion-gop', 'sel-alineacion-jop',
      'sel-alineacion-corredor', 'sel-alineacion-depto',
      'sel-alineacion-provincia', 'sel-alineacion-distrito'
    ];

    alineacionState.gpc = 'TODOS';
    alineacionState.gop = 'TODOS';
    alineacionState.jop = 'TODOS';
    alineacionState.corredor = 'TODOS';
    alineacionState.departamento = 'TODOS';
    alineacionState.provincia = 'TODOS';
    alineacionState.distrito = 'TODOS';

    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.value = 'TODOS';
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    sincronizarCascadaGeografica(state.rawData.estaciones);
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
