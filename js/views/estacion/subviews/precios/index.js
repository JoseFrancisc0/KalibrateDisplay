/* ==========================================================
   views/estacion/subviews/precios/index.js
   ========================================================== */
import { renderEvolucionPrecios } from './grafico.js';
import { railEvolucionHTML } from './rail.js';
import { acciones } from './acciones.js';

export const evolucionPreciosSubView = {
  id: 'EVOLUCION_PRECIOS',
  render: renderEvolucionPrecios,
  railHTML: railEvolucionHTML,
  acciones
};