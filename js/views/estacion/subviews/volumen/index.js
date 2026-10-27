/* ==========================================================
   views/estacion/subviews/volumen/index.js
   ========================================================== */
import { render } from '../../../../core/router.js';
import { renderVolumenSubView } from './vista.js';
import { railVolumenHTML } from './rail.js';
import { volumenSubViewState } from './state.js';

export const volumenSubView = {
  id: 'VOLUMEN',
  render: renderVolumenSubView,
  railHTML: railVolumenHTML,
  acciones: {
    cambiarTabInternaVolumen(el) {
      volumenSubViewState.tabInterna = el.dataset.arg;
      render();
    },
    cambiarMetricaSemanalVolumen(el) {
      volumenSubViewState.metricaSemanal = el.dataset.arg;
      render();
    },
    cambiarProductoEvolutivoVolumen(el) {
      volumenSubViewState.productoEvolutivo = el.value;
      render();
    }
  }
};