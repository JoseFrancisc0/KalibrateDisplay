/* ==========================================================
   views/estacion/subviews/deltas/acciones.js
   ========================================================== */
import { render } from '../../../../core/router.js';
import { estacionState } from '../../state.js';

export const acciones = {
  togglePillDeltas(el) {
    const metrica = el.dataset.arg;
    if (!metrica) return;
    const m = estacionState.metricasDeltas;
    if (m.has(metrica)) {
      if (m.size > 1) m.delete(metrica);
    } else {
      m.add(metrica);
    }
    render();
  }
};