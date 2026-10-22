/* ==========================================================
   views/analisis/acciones.js — respuesta a los controles del
   Análisis Ponderado.
   ========================================================== */

import { render, actualizarIndicadorModo } from '../../core/router.js';
import { state } from '../../core/state.js';
import { valorDe, activar, cerrarAlClicFuera, repoblarSelect } from '../../shared/dom.js';
import { inicializarSearchableSelect } from '../../shared/combobox.js';
import { marcasCompetencia, etiquetaMarca } from '../../shared/marcas.js';
import { poblarSelectsSegmentacion, valoresUnicos } from '../../shared/segmentacion.js';
import { analisisState } from './state.js';

/* ---------- Cascada Geográfica Dinámica ---------- */
function sincronizarCascadaGeografica(estaciones) {
  const estacionesDepto = estaciones.filter(e => {
    if (analisisState.departamento === 'TODOS') return true;
    const d = (e.departamento || '').trim().toUpperCase();
    return d === analisisState.departamento;
  });

  analisisState.provincia = repoblarSelect(
    'sel-analisis-provincia',
    () => valoresUnicos(estacionesDepto, 'provincia'),
    analisisState.provincia
  );

  const estacionesProv = estacionesDepto.filter(e => {
    if (analisisState.provincia === 'TODOS') return true;
    const p = (e.provincia || '').trim().toUpperCase();
    return p === analisisState.provincia;
  });

  analisisState.distrito = repoblarSelect(
    'sel-analisis-distrito',
    () => valoresUnicos(estacionesProv, 'distrito'),
    analisisState.distrito
  );
}

/* ---------- Poblado de filtros ---------- */
export function poblarFiltrosAnalisis() {
  if (!state.rawData?.estaciones) return;
  const estaciones = state.rawData.estaciones;

  poblarSelectsSegmentacion(estaciones, {
    gpc: 'sel-analisis-gpc',
    gop: 'sel-analisis-gop',
    jop: 'sel-analisis-jop',
    corredor: 'sel-analisis-corredor',
    departamento: 'sel-analisis-depto',
  });

  sincronizarCascadaGeografica(estaciones);

  [
    'sel-analisis-gpc',
    'sel-analisis-gop',
    'sel-analisis-jop',
    'sel-analisis-corredor',
    'sel-analisis-depto',
    'sel-analisis-provincia',
    'sel-analisis-distrito'
  ].forEach(id => {
    inicializarSearchableSelect(id);
  });

  if (!analisisState.marcasDisponibles || analisisState.marcasDisponibles.length === 0) {
    analisisState.marcasDisponibles = marcasCompetencia(estaciones);
    if (!analisisState.marcasSeleccionadas) {
      analisisState.marcasSeleccionadas = new Set(analisisState.marcasDisponibles);
    }
  }

  construirChecklistMarcasDOM();
}

function construirChecklistMarcasDOM() {
  const container = document.getElementById('checklist-marcas-items');
  if (!container) return;

  container.innerHTML = '';
  analisisState.marcasDisponibles.forEach(marca => {
    const isChecked = analisisState.marcasSeleccionadas.has(marca);

    const row = document.createElement('label');
    row.className = 'multiselect-item';
    row.innerHTML = `
      <input type="checkbox" value="${marca}" ${isChecked ? 'checked' : ''} data-change="onToggleMarcaCheck">
      <span>${etiquetaMarca(marca)}</span>
    `;
    container.appendChild(row);
  });

  actualizarBotonMarcasLabel();
}

function actualizarBotonMarcasLabel() {
  const lbl = document.getElementById('label-marcas-count');
  if (lbl) lbl.textContent = 'BRANDS';
}

/** Listeners de documento propios de la vista (clic fuera). */
export function iniciarListenersAnalisis() {
  cerrarAlClicFuera('section-filtro-marcas', 'dropdown-marcas-content');
}

/* ---------- Acciones ---------- */
export const acciones = {
  toggleDrawerAnalisis() {
    analisisState.drawerAbierto = !analisisState.drawerAbierto;
    const panel = document.getElementById('drawer-panel-analisis');
    const badge = document.getElementById('badge-analisis-filtros');
    if (panel) panel.style.display = analisisState.drawerAbierto ? 'block' : 'none';
    if (badge) badge.textContent = analisisState.drawerAbierto ? '▲ Ocultar' : '▼ Configurar';
  },

  cambiarGPCAnalisis() {
    const v = valorDe('sel-analisis-gpc');
    if (v !== undefined) analisisState.gpc = v;
    render();
  },

  cambiarGOPAnalisis() {
    const v = valorDe('sel-analisis-gop');
    if (v !== undefined) analisisState.gop = v;
    render();
  },

  cambiarJOPAnalisis() {
    const v = valorDe('sel-analisis-jop');
    if (v !== undefined) analisisState.jop = v;
    render();
  },

  cambiarCorredorAnalisis() {
    const v = valorDe('sel-analisis-corredor');
    if (v !== undefined) analisisState.corredor = v;
    render();
  },

  cambiarDeptoAnalisis() {
    const v = valorDe('sel-analisis-depto');
    if (v !== undefined) {
      analisisState.departamento = v;
      sincronizarCascadaGeografica(state.rawData.estaciones);
    }
    render();
  },

  cambiarProvinciaAnalisis() {
    const v = valorDe('sel-analisis-provincia');
    if (v !== undefined) {
      analisisState.provincia = v;
      sincronizarCascadaGeografica(state.rawData.estaciones);
    }
    render();
  },

  cambiarDistritoAnalisis() {
    const v = valorDe('sel-analisis-distrito');
    if (v !== undefined) analisisState.distrito = v;
    render();
  },

  limpiarFiltrosAnalisis() {
    const ids = [
      'sel-analisis-gpc', 'sel-analisis-gop', 'sel-analisis-jop',
      'sel-analisis-corredor', 'sel-analisis-depto',
      'sel-analisis-provincia', 'sel-analisis-distrito'
    ];

    analisisState.gpc = 'TODOS';
    analisisState.gop = 'TODOS';
    analisisState.jop = 'TODOS';
    analisisState.corredor = 'TODOS';
    analisisState.departamento = 'TODOS';
    analisisState.provincia = 'TODOS';
    analisisState.distrito = 'TODOS';

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

  cambiarProductoAnalisis() {
    const v = valorDe('sel-analisis-prod');
    if (v !== undefined) analisisState.producto = v;
    actualizarIndicadorModo();
    render();
  },

  cambiarModoAnalisis(el) {
    const modo = el.dataset.arg;
    analisisState.modo = modo;
    activar('btn-scope-dist', modo === 'DISTRIBUCION');
    activar('btn-scope-marca', modo === 'MARCA');
    const secMarcas = document.getElementById('section-filtro-marcas');
    if (secMarcas) secMarcas.style.display = (modo === 'MARCA') ? 'block' : 'none';
    render();
  },

  toggleDropdownMarcas(el) {
    const drop = document.getElementById('dropdown-marcas-content');
    if (drop) drop.style.display = (drop.style.display === 'block') ? 'none' : 'block';
  },

  marcarTodasMarcas(el) {
    const todos = el.dataset.arg === 'true';
    analisisState.marcasSeleccionadas = todos ? new Set(analisisState.marcasDisponibles) : new Set();
    construirChecklistMarcasDOM();
    render();
  },

  onToggleMarcaCheck(el) {
    const marca = el.value;
    if (el.checked) {
      analisisState.marcasSeleccionadas.add(marca);
    } else {
      analisisState.marcasSeleccionadas.delete(marca);
    }
    actualizarBotonMarcasLabel();
    render();
  }
};