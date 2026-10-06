/* ==========================================================
   views/estacion/index.js — definición del nivel
   "Detalle de Estación" (se abre desde la Matriz).
   Las sub-vistas (Estado, Evolución precios, Evolución
   diferenciales, Variación) se irán agregando aquí.
   ========================================================== */

import { estacionState, SUBVISTAS } from './state.js';
import { detalleEstacionHTML, renderDetalleEstacion } from './vista.js';
import { barraEstacionHTML } from './barra.js';
import { acciones } from './acciones.js';

export const estacion = {
  shellSelector: '#detalle-estacion-shell',
  mainHTML: detalleEstacionHTML,
  barraHTML: barraEstacionHTML,
  render: renderDetalleEstacion,
  etiquetaModo: () => `SUB-VISTA: ${SUBVISTAS[estacionState.subVista] || 'DETALLE'}`,
  acciones,
};
