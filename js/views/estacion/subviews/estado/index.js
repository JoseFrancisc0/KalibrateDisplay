/* ==========================================================
   views/estacion/subviews/estado/index.js
   ========================================================== */
import { renderEstadoActual } from './vista.js';

export const estadoSubView = {
  id: 'ESTADO',
  render: renderEstadoActual,
  // Sin controles en el rail para esta subvista
  railHTML: () => '',
  acciones: {}
};