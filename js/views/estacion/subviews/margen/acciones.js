/* ==========================================================
   views/estacion/subviews/margen/acciones.js
   ========================================================== */
import { render } from '../../../../core/router.js';
import { alternarDesplegable } from '../../../../shared/dom.js';
import { estacionState } from '../../state.js';

export const acciones = {
  togglePillMargen(el) {
    const metrica = el.dataset.arg;
    if (!metrica) return;
    const m = estacionState.metricasMargen;
    if (m.has(metrica)) {
      if (m.size > 1) m.delete(metrica);
    } else {
      m.add(metrica);
    }
    render();
  },

  toggleDropdownRivalCheck(el) {
    alternarDesplegable(el, 'dropdown-sub-rivales');
  },

  marcarTodasRivalesComun(el) {
    const todos = el.dataset.arg === 'true';
    const est = estacionState.dataActiva;
    const comps = (est?.actores || []).filter(a => a.tipo_actor !== 'PROPIO');
    estacionState.filtros.competidoresSeleccionados = todos
      ? new Set(comps.map(c => c.site_id))
      : new Set();
    render();
  },

  onToggleRivalCheckComun(el) {
    const id = el.value;
    const set = estacionState.filtros.competidoresSeleccionados;
    if (el.checked) {
      set.add(id);
    } else {
      set.delete(id);
    }
    render();
  },

  cambiarProductoComun(el) {
    if (el.value) estacionState.filtros.producto = el.value;
    render();
  },

  cambiarF1Comun(el) {
    if (el.value) estacionState.filtros.fechaInicio = el.value;
    render();
  },

  cambiarF2Comun(el) {
    if (el.value) estacionState.filtros.fechaFin = el.value;
    render();
  }
};