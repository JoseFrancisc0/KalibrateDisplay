/* ==========================================================
   views/heatmap/index.js — Definición del contrato para Router
   ========================================================== */

import { state } from '../../core/state.js';
import { heatmapState } from './state.js';
import { railHTML } from './rail.js';
import { heatmapHTML, renderHeatmap } from './vista.js';
import { acciones, poblarFiltrosHeatmap } from './acciones.js';

export const heatmap = {
  id: 'HEATMAP',
  label: 'HEATMAP',
  tabId: 'tab-view-heatmap',
  shellSelector: '#heatmap-shell',
  display: 'flex',
  railId: 'rail-panel-heatmap',
  usaTabbar: false,

  railHTML,
  mainHTML: heatmapHTML,

  alEntrar: poblarFiltrosHeatmap,
  render: () => renderHeatmap(state.rawData.estaciones),
  etiquetaModo: () => `HEATMAP: ${heatmapState.departamento.toUpperCase()}`,

  acciones,
  iniciarListeners: () => {}
};