/* ==========================================================
   views/variacion/acciones.js — carga del histórico y respuesta
   a los controles de Variación Histórica.
   ========================================================== */

import { render, actualizarIndicadorModo } from '../../core/router.js';
import { state } from '../../core/state.js';
import { cargarHistoricoMarcas } from '../../core/data.js';
import { valorDe, activar, alternarDesplegable, cerrarAlClicFuera } from '../../shared/dom.js';
import { poblarSelectsSegmentacion } from '../../shared/segmentacion.js';
import { variacionState } from './state.js';
import { cargarSeriesLM } from './localMarket.js';

/* ---------- Entrada a la vista ---------- */

/** Descarga el histórico la primera vez y prepara los filtros. */
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

function poblarFiltrosVariacion() {
  if (!state.rawData?.estaciones) return;
  const estaciones = state.rawData.estaciones;

  poblarSelectsSegmentacion(estaciones, {
    corredor: 'sel-var-corredor',
    departamento: 'sel-var-depto',
    gpc: 'sel-var-gpc'
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

/** Listeners de documento propios de la vista (clic fuera). */
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

  async cambiarAlcanceVariacion(el) {
    const alcance = el.dataset.arg;
    variacionState.alcance = alcance;
    activar('btn-var-area', alcance === 'AREA');
    activar('btn-var-lm', alcance === 'LM');

    // Primera vez en Local Market: descargar las series de las competidoras LM
    if (alcance === 'LM' && !variacionState.seriesLM && !variacionState.cargandoLM) {
      variacionState.cargandoLM = true;
      render();
      variacionState.seriesLM = await cargarSeriesLM((hechos, total) => {
        const prog = document.getElementById('var-lm-progreso');
        if (prog) prog.innerText = `${hechos} / ${total}`;
      });
      variacionState.cargandoLM = false;
    }

    render();
    // La lista de marcas cambia según el alcance: refrescar el checklist
    construirChecklistMarcasDOM();
  },

  cambiarCorredorVariacion() {
    const v = valorDe('sel-var-corredor');
    if (v !== undefined) variacionState.corredor = v;
    render();
  },

  cambiarDeptoVariacion() {
    const v = valorDe('sel-var-depto');
    if (v !== undefined) variacionState.departamento = v;
    render();
  },

  cambiarGpcVariacion() {
    const v = valorDe('sel-var-gpc');
    if (v !== undefined) variacionState.gpcGroup = v;
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
