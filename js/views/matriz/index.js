/* ==========================================================
   views/matriz/index.js — definición de la vista
   "Matriz Competitiva" (contrato en core/router.js).
   ========================================================== */

import { matrizState } from './state.js';
import { railHTML } from './rail.js';
import { tablaHTML } from './tabla.js';
import { tabbarHTML } from './tabbar.js';
import { renderMatriz } from './vista.js';
import { recalcularCapacidad } from './paginacion.js';
import { acciones, poblarFiltroMarcas, iniciarListenersMatriz } from './acciones.js';

export { estacionesListadas } from './filtros.js';

export const matriz = {
  id: 'MATRIZ',
  label: 'MATRIZ COMPETITIVA',
  tabId: 'tab-view-matriz',
  shellSelector: '.table-shell',
  display: 'flex',
  railId: 'rail-panel-matriz',
  usaTabbar: true,

  railHTML,
  mainHTML: tablaHTML,
  tabbarHTML,

  alEntrar: poblarFiltroMarcas,
  render: renderMatriz,
  alRedimensionar: recalcularCapacidad,
  etiquetaModo: () => (matrizState.modoActual === 'PRECIOS')
    ? 'MÉTRICA ACTIVA: PRECIOS'
    : 'MÉTRICA ACTIVA: DIFERENCIALES',

  acciones,
  iniciarListeners: iniciarListenersMatriz,
};
