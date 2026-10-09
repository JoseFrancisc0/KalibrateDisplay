/* ==========================================================
   views/estacion/subviews/deltas/acciones.js
   ========================================================== */
import { render } from '../../../../core/router.js';
import { valorDe } from '../../../../shared/dom.js';
import { diffState } from './state.js';

export const acciones = {
  cambiarProductoDiff() {
    const v = valorDe('sel-diff-prod');
    if (v) diffState.producto = v;
    render();
  },

  cambiarRivalDiff() {
    const v = valorDe('sel-diff-rival');
    if (v) diffState.competidorId = v;
    render();
  },

  cambiarF1Diff(el) {
    if (el.value) diffState.fechaInicio = el.value;
    render();
  },

  cambiarF2Diff(el) {
    if (el.value) diffState.fechaFin = el.value;
    render();
  }
};