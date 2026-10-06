/* ==========================================================
   views/variacion/index.js — definición de la vista
   "Variación Histórica" (contrato en core/router.js).
   ========================================================== */

import { variacionState } from './state.js';
import { railHTML } from './rail.js';
import { variacionHTML, renderVariacionHistorica } from './vista.js';
import { acciones, entrarVariacion, iniciarListenersVariacion } from './acciones.js';

export const variacion = {
  id: 'VARIACION',
  label: 'VARIACIÓN HISTÓRICA',
  tabId: 'tab-view-variacion',
  shellSelector: '#variacion-shell',
  display: 'block',
  railId: 'rail-panel-variacion',
  usaTabbar: false,

  railHTML,
  mainHTML: variacionHTML,

  alEntrar: entrarVariacion,
  render: renderVariacionHistorica,
  etiquetaModo: () => `PRODUCTO: ${(variacionState.producto || 'DIESEL').toUpperCase()} (VARIACIÓN)`,

  acciones,
  iniciarListeners: iniciarListenersVariacion,
};
