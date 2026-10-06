/* ==========================================================
   views/analisis/index.js — definición de la vista
   "Análisis Ponderado" (contrato en core/router.js).
   ========================================================== */

import { state } from '../../core/state.js';
import { analisisState } from './state.js';
import { railHTML } from './rail.js';
import { analyticsHTML, renderAnalisis } from './grafico.js';
import { acciones, poblarFiltrosAnalisis, iniciarListenersAnalisis } from './acciones.js';

export const analisis = {
  id: 'ANALISIS',
  label: 'ANÁLISIS PONDERADO',
  tabId: 'tab-view-analisis',
  shellSelector: '#analytics-shell',
  display: 'flex',
  railId: 'rail-panel-analisis',
  usaTabbar: false,

  railHTML,
  mainHTML: analyticsHTML,

  alEntrar: poblarFiltrosAnalisis,
  render: () => renderAnalisis(state.rawData.estaciones),
  etiquetaModo: () => `PRODUCTO: ${(analisisState.producto || 'DIESEL').toUpperCase()}`,

  acciones,
  iniciarListeners: iniciarListenersAnalisis,
};
