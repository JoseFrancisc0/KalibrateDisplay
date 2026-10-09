import { render } from '../../../../core/router.js';
import { valorDe } from '../../../../shared/dom.js';
import { estacionState } from '../../state.js';

export const acciones = {
  cambiarProductoMargen() {
    const v = valorDe('sel-margen-prod');
    if (v) estacionState.margen.producto = v;
    render();
  },
  cambiarRivalMargen() {
    const v = valorDe('sel-margen-rival');
    if (v) estacionState.margen.competidorId = v;
    render();
  },
  cambiarF1Margen(el) {
    if (el.value) estacionState.margen.fechaInicio = el.value;
    render();
  },
  cambiarF2Margen(el) {
    if (el.value) estacionState.margen.fechaFin = el.value;
    render();
  }
};