/* ==========================================================
   views/estacion/subviews/margen/acciones.js
   ========================================================== */
import { render } from '../../../../core/router.js';
import { valorDe, alternarDesplegable } from '../../../../shared/dom.js';
import { estacionState } from '../../state.js';

export const acciones = {
  cambiarProductoMargen() {
    const v = valorDe('sel-margen-prod');
    if (v) estacionState.margen.producto = v;
    render();
  },

  cambiarF1Margen(el) {
    if (el.value) estacionState.margen.fechaInicio = el.value;
    render();
  },

  cambiarF2Margen(el) {
    if (el.value) estacionState.margen.fechaFin = el.value;
    render();
  },

  toggleDropdownMargenRivales() {
    alternarDesplegable('dropdown-margen-rivales');
  },

  marcarTodasRivalesMargen(el) {
    const todos = el.dataset.arg === 'true';
    const est = estacionState.dataActiva;
    const comps = (est?.actores || []).filter(a => a.tipo_actor !== 'PROPIO');
    estacionState.margen.competidoresSeleccionados = todos
      ? new Set(comps.map(c => c.site_id))
      : new Set();
    render();
  },

  onToggleRivalCheckMargen(el) {
    const id = el.value;
    const set = estacionState.margen.competidoresSeleccionados;
    if (el.checked) {
      set.add(id);
    } else {
      set.delete(id);
    }
    render();
  }
};