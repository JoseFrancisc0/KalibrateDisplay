/* ==========================================================
   views/alineacion/acciones.js — respuesta a los controles de
   Alineación Competitiva.
   ========================================================== */

import { render, actualizarIndicadorModo } from '../../core/router.js';
import { state } from '../../core/state.js';
import { valorDe, activar, poblarSelect, repoblarSelect } from '../../shared/dom.js';
import { marcasCompetencia, etiquetaMarca } from '../../shared/marcas.js';
import { poblarSelectsSegmentacion, valoresUnicos } from '../../shared/segmentacion.js';
import { alineacionState } from './state.js';

/* ---------- Cascada Geográfica Dinámica ---------- */
function sincronizarCascadaGeografica(estaciones) {
  // 1. Filtrar estaciones según el Departamento elegido
  const estacionesDepto = estaciones.filter(e => {
    if (alineacionState.departamento === 'TODOS') return true;
    const d = (e.departamento || '').trim().toUpperCase();
    return d === alineacionState.departamento;
  });

  // Repoblar Provincias con las del departamento actual
  alineacionState.provincia = repoblarSelect(
    'sel-alineacion-provincia',
    () => valoresUnicos(estacionesDepto, 'provincia'),
    alineacionState.provincia
  );

  // 2. Filtrar estaciones según Departamento Y Provincia elegidos
  const estacionesProv = estacionesDepto.filter(e => {
    if (alineacionState.provincia === 'TODOS') return true;
    const p = (e.provincia || '').trim().toUpperCase();
    return p === alineacionState.provincia;
  });

  // Repoblar Distritos con los de la provincia actual
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
    corredor: 'sel-alineacion-corredor',
    zona: 'sel-alineacion-zona',
    departamento: 'sel-alineacion-depto',
  });

  sincronizarCascadaGeografica(estaciones);
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

  cambiarGpcAlineacion() {
    const v = valorDe('sel-alineacion-gpc');
    if (v !== undefined) alineacionState.gpcGroup = v;
    render();
  },

  cambiarCorredorAlineacion() {
    const v = valorDe('sel-alineacion-corredor');
    if (v !== undefined) alineacionState.corredor = v;
    render();
  },

  cambiarZonaAlineacion() {
    const v = valorDe('sel-alineacion-zona');
    if (v !== undefined) alineacionState.zona = v;
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
