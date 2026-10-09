/* ==========================================================
   views/variacion/acciones.js — carga del histórico y respuesta
   a los controles de Variación Histórica.
   ========================================================== */

import { render, actualizarIndicadorModo } from '../../core/router.js';
import { state } from '../../core/state.js';
import { cargarHistoricoMarcas } from '../../core/data.js';
import { valorDe, alternarDesplegable, cerrarAlClicFuera, repoblarSelect } from '../../shared/dom.js';
import { poblarSelectsSegmentacion, valoresUnicos } from '../../shared/segmentacion.js';
import { variacionState } from './state.js';

/* ---------- Entrada a la vista ---------- */

export async function entrarVariacion() {
  if (!variacionState.historicoMarcasData && !variacionState.cargandoHistorico) {
    variacionState.cargandoHistorico = true;
    render();
    variacionState.historicoMarcasData = await cargarHistoricoMarcas();
    variacionState.cargandoHistorico = false;
  }

  poblarFiltrosVariacion();
  sincronizarInputsFecha();
}

/* ---------- Cascada Geográfica Dinámica ---------- */
function sincronizarCascadaGeografica(estaciones) {
  const estacionesDepto = estaciones.filter(e => {
    if (variacionState.departamento === 'TODOS') return true;
    const d = (e.departamento || '').trim().toUpperCase();
    return d === variacionState.departamento;
  });

  variacionState.provincia = repoblarSelect(
    'sel-var-provincia',
    () => valoresUnicos(estacionesDepto, 'provincia'),
    variacionState.provincia
  );

  const estacionesProv = estacionesDepto.filter(e => {
    if (variacionState.provincia === 'TODOS') return true;
    const p = (e.provincia || '').trim().toUpperCase();
    return p === variacionState.provincia;
  });

  variacionState.distrito = repoblarSelect(
    'sel-var-distrito',
    () => valoresUnicos(estacionesProv, 'distrito'),
    variacionState.distrito
  );
}

function poblarFiltrosVariacion() {
  if (!state.rawData?.estaciones) return;
  const estaciones = state.rawData.estaciones;

  poblarSelectsSegmentacion(estaciones, {
    gpc: 'sel-var-gpc',
    corredor: 'sel-var-corredor',
    zona: 'sel-var-zona',
    departamento: 'sel-var-depto'
  });

  sincronizarCascadaGeografica(estaciones);

  const selProd = document.getElementById('sel-var-prod');
  if (selProd) selProd.value = variacionState.producto || 'Diesel';

  construirChecklistMarcasDOM();
}

function sincronizarInputsFecha() {
  const inF1 = document.getElementById('txt-var-f1');
  const inF2 = document.getElementById('txt-var-f2');
  if (inF1) inF1.value = variacionState.fechaInicio;
  if (inF2) inF2.value = variacionState.fechaFin;
}

function construirChecklistMarcasDOM() {
  const container = document.getElementById('checklist-var-marcas-items');
  if (!container || !variacionState.marcasDisponibles) return;

  container.innerHTML = '';
  variacionState.marcasDisponibles.forEach(marca => {
    const isChecked = variacionState.marcasSeleccionadas ? variacionState.marcasSeleccionadas.has(marca) : true;
    const labelDisplay = (marca === 'PRIMAX') ? 'COESTI (PRIMAX)' : (marca === 'WP' ? 'WHITE PRODUCTS' : marca);

    const row = document.createElement('label');
    row.className = 'multiselect-item';
    row.innerHTML = `
      <input type="checkbox" value="${marca}" ${isChecked ? 'checked' : ''} data-change="onToggleVarMarcaCheck">
      <span>${labelDisplay}</span>
    `;
    container.appendChild(row);
  });
}

export function iniciarListenersVariacion() {
  cerrarAlClicFuera('section-var-marcas', 'dropdown-var-marcas-content');
}

/* ---------- Acciones ---------- */

export const acciones = {
  cambiarFechaF1(el) {
    if (!el.value) return;
    variacionState.fechaInicio = el.value;
    render();
  },

  cambiarFechaF2(el) {
    if (!el.value) return;
    variacionState.fechaFin = el.value;
    render();
  },

  cambiarProductoVariacion() {
    const v = valorDe('sel-var-prod');
    if (v !== undefined) variacionState.producto = v;
    actualizarIndicadorModo();
    render();
  },

  cambiarGpcVariacion() {
    const v = valorDe('sel-var-gpc');
    if (v !== undefined) variacionState.gpcGroup = v;
    render();
  },

  cambiarCorredorVariacion() {
    const v = valorDe('sel-var-corredor');
    if (v !== undefined) variacionState.corredor = v;
    render();
  },

  cambiarZonaVariacion() {
    const v = valorDe('sel-var-zona');
    if (v !== undefined) variacionState.zona = v;
    render();
  },
  
  cambiarDeptoVariacion() {
    const v = valorDe('sel-var-depto');
    if (v !== undefined) {
      variacionState.departamento = v;
      sincronizarCascadaGeografica(state.rawData.estaciones);
    } 
    render();
  },

  cambiarProvinciaVariacion() {
    const v = valorDe('sel-var-provincia');
    if (v !== undefined) {
      variacionState.provincia = v;
      sincronizarCascadaGeografica(state.rawData.estaciones);
    } 
    render();
  },

  cambiarDistritoVariacion() {
    const v = valorDe('sel-var-distrito');
    if (v !== undefined) variacionState.distrito = v;
    render();
  },

  toggleDropdownVarMarcas() {
    alternarDesplegable('dropdown-var-marcas-content');
  },

  marcarTodasVarMarcas(el) {
    if (el.dataset.arg === 'true') {
      variacionState.marcasSeleccionadas = new Set(variacionState.marcasDisponibles);
    } else {
      variacionState.marcasSeleccionadas = new Set();
    }
    construirChecklistMarcasDOM();
    render();
  },

  onToggleVarMarcaCheck(el) {
    const marca = el.value;
    if (!variacionState.marcasSeleccionadas) {
      variacionState.marcasSeleccionadas = new Set(variacionState.marcasDisponibles);
    }
    if (el.checked) {
      variacionState.marcasSeleccionadas.add(marca);
    } else {
      variacionState.marcasSeleccionadas.delete(marca);
    }
    render();
  },
};