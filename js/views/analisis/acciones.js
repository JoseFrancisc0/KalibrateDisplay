/* ==========================================================
   views/analisis/acciones.js — respuesta a los controles del
   Análisis Ponderado.
   ========================================================== */

import { render, actualizarIndicadorModo } from '../../core/router.js';
import { state } from '../../core/state.js';
import { valorDe, activar, alternarDesplegable, cerrarAlClicFuera, repoblarSelect } from '../../shared/dom.js';
import { marcasCompetencia, etiquetaMarca } from '../../shared/marcas.js';
import { poblarSelectsSegmentacion, valoresUnicos } from '../../shared/segmentacion.js';
import { analisisState } from './state.js';

/* ---------- Cascada Geográfica Dinámica ---------- */
function sincronizarCascadaGeografica(estaciones) {
  // 1. Filtrar estaciones según el Departamento elegido
  const estacionesDepto = estaciones.filter(e => {
    if (analisisState.departamento === 'TODOS') return true;
    const d = (e.departamento || '').trim().toUpperCase();
    return d === analisisState.departamento;
  });

  // Repoblar Provincias con las del departamento actual
  analisisState.provincia = repoblarSelect(
    'sel-analisis-provincia',
    () => valoresUnicos(estacionesDepto, 'provincia'),
    analisisState.provincia
  );

  // 2. Filtrar estaciones según Departamento Y Provincia elegidos
  const estacionesProv = estacionesDepto.filter(e => {
    if (analisisState.provincia === 'TODOS') return true;
    const p = (e.provincia || '').trim().toUpperCase();
    return p === analisisState.provincia;
  });

  // Repoblar Distritos con los de la provincia actual
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
    corredor: 'sel-analisis-corredor',
    zona: 'sel-analisis-zona',
    departamento: 'sel-analisis-depto',
  });

  sincronizarCascadaGeografica(estaciones);

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
  cambiarProductoAnalisis() {
    const v = valorDe('sel-analisis-prod');
    if (v !== undefined) analisisState.producto = v;
    actualizarIndicadorModo();
    render();
  },
  cambiarGpcAnalisis() {
    const v = valorDe('sel-analisis-gpc');
    if (v !== undefined) analisisState.gpcGroup = v;
    render();
  },
  cambiarCorredorAnalisis() {
    const v = valorDe('sel-analisis-corredor');
    if (v !== undefined) analisisState.corredor = v;
    render();
  },
  cambiarZonaAnalisis() {
    const v = valorDe('sel-analisis-zona');
    if (v !== undefined) analisisState.zona = v;
    render();
  },
  cambiarDeptoAnalisis() {
    const v = valorDe('sel-analisis-depto');
    if (v !== undefined) { 
      analisisState.departamento = v;
      sincronizarCascadaGeografica(state.rawData.estaciones);
    };
    render();
  },
  cambiarProvinciaAnalisis() {
    const v = valorDe('sel-analisis-provincia');
    if (v !== undefined) { 
      analisisState.provincia = v;
      sincronizarCascadaGeografica(state.rawData.estaciones);
    };
    render();
  },
  cambiarDistritoAnalisis() {
    const v = valorDe('sel-analisis-distrito');
    if (v !== undefined) analisisState.distrito = v;
    render();
  },
  cambiarModoAnalisis(el) {
    const modo = el.dataset.arg;
    analisisState.modo = modo;
    activar('btn-scope-comp', modo === 'COMPETENCIA');
    activar('btn-scope-coesti', modo === 'COESTI');
    activar('btn-scope-marca', modo === 'MARCA');
    const secMarcas = document.getElementById('section-filtro-marcas');
    if (secMarcas) {
      secMarcas.style.opacity = (modo === 'MARCA') ? '1' : '0.45';
    }
    render();
  },
  toggleDropdownMarcas() {
    alternarDesplegable('dropdown-marcas-content');
  },
  marcarTodasMarcas(el) {
    if (el.dataset.arg === 'true') {
      analisisState.marcasSeleccionadas = new Set(analisisState.marcasDisponibles);
    } else {
      analisisState.marcasSeleccionadas = new Set();
    }
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
  },
};
