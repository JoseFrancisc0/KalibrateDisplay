/* ==========================================================
   views/margen/acciones.js — Controladores y Poblado de Filtros
   ========================================================== */
import { render, refrescarViewBar } from '../../core/router.js';
import { state } from '../../core/state.js';
import { cargarHistoricoMarcas } from '../../core/data.js';
import { valorDe, alternarDesplegable, cerrarAlClicFuera, repoblarSelect } from '../../shared/dom.js';
import { poblarSelectsSegmentacion, valoresUnicos } from '../../shared/segmentacion.js';
import { margenMercadoState } from './state.js';

/* ---------- Entrada a la vista (alEntrar) ---------- */
export async function entrarMargenMercado() {
  if (!margenMercadoState.historicoMarcasData && !margenMercadoState.cargandoHistorico) {
    margenMercadoState.cargandoHistorico = true;
    render();
    margenMercadoState.historicoMarcasData = await cargarHistoricoMarcas();
    margenMercadoState.cargandoHistorico = false;
  }
  poblarFiltrosMargenMercado();
  sincronizarInputsFechaMM();
}

function sincronizarInputsFechaMM() {
  const inF1 = document.getElementById('txt-mm-f1');
  const inF2 = document.getElementById('txt-mm-f2');
  if (inF1) inF1.value = margenMercadoState.fechaInicio;
  if (inF2) inF2.value = margenMercadoState.fechaFin;
  const inP = document.getElementById('sel-mm-prod');
  if (inP) inP.value = margenMercadoState.producto;
}

/* ---------- Cascada Geográfica Dinámica ---------- */
function sincronizarCascadaGeograficaMM(estaciones) {
  const estacionesDepto = estaciones.filter(e => {
    if (margenMercadoState.departamento === 'TODOS') return true;
    const d = (e.departamento || '').trim().toUpperCase();
    return d === margenMercadoState.departamento;
  });

  margenMercadoState.provincia = repoblarSelect(
    'sel-mm-provincia',
    () => valoresUnicos(estacionesDepto, 'provincia'),
    margenMercadoState.provincia
  );

  const estacionesProv = estacionesDepto.filter(e => {
    if (margenMercadoState.provincia === 'TODOS') return true;
    const p = (e.provincia || '').trim().toUpperCase();
    return p === margenMercadoState.provincia;
  });

  margenMercadoState.distrito = repoblarSelect(
    'sel-mm-distrito',
    () => valoresUnicos(estacionesProv, 'distrito'),
    margenMercadoState.distrito
  );
}

export function poblarFiltrosMargenMercado() {
  if (!state.rawData?.estaciones) return;
  const estaciones = state.rawData.estaciones;

  poblarSelectsSegmentacion(estaciones, {
    gpc: 'sel-mm-gpc',
    corredor: 'sel-mm-corredor',
    zona: 'sel-mm-zona',
    departamento: 'sel-mm-depto'
  });

  sincronizarCascadaGeograficaMM(estaciones);

  // Extraer marcas detectadas en los datos históricos
  if (margenMercadoState.historicoMarcasData?.datos) {
    const setM = new Set();
    margenMercadoState.historicoMarcasData.datos.forEach(d => {
      let m = (d.m || '').trim().toUpperCase();
      if (m === 'PRIMAX') m = 'COESTI';
      if (m) setM.add(m);
    });
    margenMercadoState.marcasDisponibles = Array.from(setM).sort();
    if (!margenMercadoState.marcasSeleccionadas) {
      margenMercadoState.marcasSeleccionadas = new Set(margenMercadoState.marcasDisponibles);
    }
  }

  construirChecklistMarcasMM();
}

function construirChecklistMarcasMM() {
  const container = document.getElementById('checklist-mm-marcas-items');
  if (!container || !margenMercadoState.marcasDisponibles) return;
  container.innerHTML = '';

  margenMercadoState.marcasDisponibles.forEach(marca => {
    const isChecked = margenMercadoState.marcasSeleccionadas
      ? margenMercadoState.marcasSeleccionadas.has(marca)
      : true;
    const labelDisplay = (marca === 'COESTI') ? 'COESTI (PRIMAX)' : (marca === 'WP' ? 'WHITE PRODUCTS' : marca);
    const row = document.createElement('label');
    row.className = 'multiselect-item';
    row.innerHTML = `
      <input type="checkbox" value="${marca}" ${isChecked ? 'checked' : ''} data-change="onToggleMarcaCheckMargenMercado">
      <span>${labelDisplay}</span>
    `;
    container.appendChild(row);
  });
}

export function iniciarListenersMargenMercado() {
  cerrarAlClicFuera('section-mm-marcas', 'dropdown-mm-marcas');
}

export const acciones = {
  cambiarProductoMargenMercado(el) {
    const v = el?.value || valorDe('sel-mm-prod');
    if (v) {
      margenMercadoState.producto = v;
      refrescarViewBar();
      render();
    }
  },

  cambiarF1MargenMercado(el) {
    if (el.value) {
      margenMercadoState.fechaInicio = el.value;
      render();
    }
  },

  cambiarF2MargenMercado(el) {
    if (el.value) {
      margenMercadoState.fechaFin = el.value;
      render();
    }
  },

  cambiarGpcMargenMercado(el) {
    margenMercadoState.gpcGroup = el.value;
    render();
  },

  cambiarCorredorMargenMercado(el) {
    margenMercadoState.corredor = el.value;
    render();
  },

  cambiarZonaMargenMercado(el) {
    margenMercadoState.zona = el.value;
    render();
  },

  cambiarDeptoMargenMercado(el) {
    margenMercadoState.departamento = el.value;
    sincronizarCascadaGeograficaMM(state.rawData.estaciones);
    render();
  },

  cambiarProvinciaMargenMercado(el) {
    margenMercadoState.provincia = el.value;
    sincronizarCascadaGeograficaMM(state.rawData.estaciones);
    render();
  },

  cambiarDistritoMargenMercado(el) {
    margenMercadoState.distrito = el.value;
    render();
  },

  toggleDropdownMarcasMargenMercado() {
    alternarDesplegable('dropdown-mm-marcas');
  },

  marcarTodasMarcasMargenMercado(el) {
    const todas = el.dataset.arg === 'true';
    margenMercadoState.marcasSeleccionadas = todas
      ? new Set(margenMercadoState.marcasDisponibles)
      : new Set();
    construirChecklistMarcasMM();
    render();
  },

  onToggleMarcaCheckMargenMercado(el) {
    const m = el.value;
    if (!margenMercadoState.marcasSeleccionadas) {
      margenMercadoState.marcasSeleccionadas = new Set(margenMercadoState.marcasDisponibles);
    }
    if (el.checked) {
      margenMercadoState.marcasSeleccionadas.add(m);
    } else {
      margenMercadoState.marcasSeleccionadas.delete(m);
    }
    render();
  }
};