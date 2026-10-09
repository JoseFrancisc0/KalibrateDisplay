/* ==========================================================
   views/estacion/subviews/variacion/index.js
   ========================================================== */
import { renderVariacion } from './grafico.js';
import { railVariacionHTML } from './rail.js';
import { acciones } from './acciones.js';

export const variacionSubView = {
  id: 'VARIACION',
  render: renderVariacion,
  railHTML: railVariacionHTML,
  acciones
};