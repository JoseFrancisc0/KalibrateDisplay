/* ==========================================================
   views/estacion/subviews/precios/acciones.js
   ========================================================== */
import { render } from '../../../../core/router.js';
import { valorDe, alternarDesplegable } from '../../../../shared/dom.js';
import { estacionState } from '../../state.js';
import { evolucionState } from './state.js';

export const acciones = {
  cambiarProductoEvolucion() {
    const v = valorDe('sel-evo-prod');
    if (v) evolucionState.producto = v;
    render();
  },

  cambiarF1Evolucion(el) {
    if (el.value) evolucionState.fechaInicio = el.value;
    render();
  },

  cambiarF2Evolucion(el) {
    if (el.value) evolucionState.fechaFin = el.value;
    render();
  },

  toggleDropdownEvoRivales() {
    alternarDesplegable('dropdown-evo-rivales');
  },

  marcarTodasRivalesEvo(el) {
    const todos = el.dataset.arg === 'true';
    const est = estacionState.dataActiva;
    const comps = (est?.actores || []).filter(a => a.tipo_actor !== 'PROPIO');
    evolucionState.competidoresSeleccionados = todos
      ? new Set(comps.map(c => c.site_id))
      : new Set();
    render();
  },

  onToggleRivalCheckEvo(el) {
    const id = el.value;
    const set = evolucionState.competidoresSeleccionados;
    if (el.checked) {
      set.add(id);
    } else {
      set.delete(id);
    }
    render();
  }
};