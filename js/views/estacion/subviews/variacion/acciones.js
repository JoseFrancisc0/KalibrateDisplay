/* ==========================================================
   views/estacion/subviews/variacion/acciones.js
   ========================================================== */
import { render, refrescarViewBar } from '../../../../core/router.js';
import { valorDe } from '../../../../shared/dom.js';
import { variacionState } from './state.js';

export const acciones = {
  cambiarProductoVariacionEstacion(el) {
    // Tomar directamente del elemento que disparó el evento o por el nuevo ID único
    const v = el?.value || valorDe('sel-est-var-prod');
    if (v) {
      variacionState.producto = v;
      refrescarViewBar();
      render();
    }
  },

  cambiarF1VariacionEstacion(el) {
    if (el.value) {
      variacionState.fechaInicio = el.value;
      render();
    }
  },

  cambiarF2VariacionEstacion(el) {
    if (el.value) {
      variacionState.fechaFin = el.value;
      render();
    }
  }
};