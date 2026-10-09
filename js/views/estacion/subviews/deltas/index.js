/* ==========================================================
   views/estacion/subviews/deltas/index.js
   ========================================================== */

import { renderEvolucionDiff } from './grafico.js';
import { railDiffHTML } from './rail.js';
import { acciones } from './acciones.js';

export const evolucionDiffSubView = {
  id: 'EVOLUCION_DIFF',
  render: renderEvolucionDiff,
  railHTML: railDiffHTML,
  acciones
};