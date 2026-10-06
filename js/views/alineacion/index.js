/* ==========================================================
   views/alineacion/index.js — definición de la vista
   "Alineación Competitiva" (contrato en core/router.js).
   ========================================================== */

import { state } from '../../core/state.js';
import { alineacionState } from './state.js';
import { railHTML } from './rail.js';
import { alineacionHTML, renderAlineacion } from './vista.js';
import { acciones, poblarFiltrosAlineacion } from './acciones.js';

export const alineacion = {
  id: 'ALINEACION',
  label: 'ALINEACIÓN COMPETITIVA',
  tabId: 'tab-view-alineacion',
  shellSelector: '#alineacion-shell',
  display: 'flex',
  railId: 'rail-panel-alineacion',
  usaTabbar: false,

  railHTML,
  mainHTML: alineacionHTML,

  alEntrar: poblarFiltrosAlineacion,
  render: () => renderAlineacion(state.rawData.estaciones),
  etiquetaModo: () => `PRODUCTO: ${(alineacionState.productoSeleccionado || 'DIESEL').toUpperCase()}`,

  acciones,
};
