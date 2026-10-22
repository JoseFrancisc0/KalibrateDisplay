/* ==========================================================
   views/variacion/acciones.js — carga del histórico y respuesta
   a los controles de Variación Histórica.
   ========================================================== */

import { render, actualizarIndicadorModo } from '../../core/router.js';
import { state } from '../../core/state.js';
import { cargarHistoricoMarcas } from '../../core/data.js';
import { valorDe, alternarDesplegable, cerrarAlClicFuera, repoblarSelect } from '../../shared/dom.js';
import { inicializarSearchableSelect } from '../../shared/combobox.js';
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
    gop: 'sel-var-gop',
    jop: 'sel-var-jop',
    corredor: 'sel-var-corredor',
    departamento: 'sel-var-depto'
  });

  sincronizarCascadaGeografica(estaciones);

  [
    'sel-var-gpc',
    'sel-var-gop',
    'sel-var-jop',
    'sel-var-corredor',
    'sel-var-depto',
    'sel-var-provincia',
    'sel-var-distrito'
  ].forEach(id => {
    inicializarSearchableSelect(id);
  });

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
  toggleDrawerVariacion() {
    variacionState.drawerAbierto = !variacionState.drawerAbierto;
    const panel = document.getElementById('drawer-panel-var');
    const badge = document.getElementById('badge-var-filtros');
    if (panel) panel.style.display = variacionState.drawerAbierto ? 'block' : 'none';
    if (badge) badge.textContent = variacionState.drawerAbierto ? '▲ Ocultar' : '▼ Configurar';
  },

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

  cambiarGPCVariacion() {
    const v = valorDe('sel-var-gpc');
    if (v !== undefined) variacionState.gpc = v;
    render();
  },

  cambiarGOPVariacion() {
    const v = valorDe('sel-var-gop');
    if (v !== undefined) variacionState.gop = v;
    render();
  },

  cambiarJOPVariacion() {
    const v = valorDe('sel-var-jop');
    if (v !== undefined) variacionState.jop = v;
    render();
  },

  cambiarCorredorVariacion() {
    const v = valorDe('sel-var-corredor');
    if (v !== undefined) variacionState.corredor = v;
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

  limpiarFiltrosVariacion() {
    const ids = [
      'sel-var-gpc', 'sel-var-gop', 'sel-var-jop',
      'sel-var-corredor', 'sel-var-depto',
      'sel-var-provincia', 'sel-var-distrito'
    ];

    variacionState.gpc = 'TODOS';
    variacionState.gop = 'TODOS';
    variacionState.jop = 'TODOS';
    variacionState.corredor = 'TODOS';
    variacionState.departamento = 'TODOS';
    variacionState.provincia = 'TODOS';
    variacionState.distrito = 'TODOS';

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

  toggleDropdownVarMarcas(el) {
    alternarDesplegable(el, 'dropdown-var-marcas-content');
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