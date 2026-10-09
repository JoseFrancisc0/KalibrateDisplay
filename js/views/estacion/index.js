/* ==========================================================
   views/estacion/index.js — definición del nivel "Detalle de Estación".
   ========================================================== */
import { estacionState, SUBVISTAS } from './state.js';
import { detalleEstacionHTML, renderDetalleEstacion } from './vista.js';
import { barraEstacionHTML } from './barra.js';
import { railEstacionHTML, actualizarRailEstacion } from './rail.js';
import { acciones } from './acciones.js';

export const estacion = {
  shellSelector: '#detalle-estacion-shell',
  mainHTML: detalleEstacionHTML,
  barraHTML: barraEstacionHTML,
  railHTML: railEstacionHTML,
  actualizarRail: actualizarRailEstacion,
  railId: 'rail-panel-estacion',
  render: renderDetalleEstacion,
  etiquetaModo: () => `SUB-VISTA: ${SUBVISTAS[estacionState.subVista] || 'DETALLE'}`,
  acciones,
};