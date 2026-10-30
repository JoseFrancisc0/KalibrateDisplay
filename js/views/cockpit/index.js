/* ==========================================================
 views/cockpit/index.js — Definición del Cockpit para el router
 ========================================================== */

import { cockpitState } from './state.js';
import { railCockpitHTML } from './rail.js';
import { cockpitHTML, renderCockpit } from './vista.js';
import { acciones, entrarCockpit } from './acciones.js';
import { state } from '../../core/state.js';

export const cockpit = {
  id: 'COCKPIT',
  label: 'CONTROL ROOM',
  tabId: 'tab-view-cockpit',
  shellSelector: '#cockpit-shell',
  display: 'flex',
  railId: 'rail-panel-cockpit',
  usaTabbar: false,

  railHTML: railCockpitHTML,
  mainHTML: cockpitHTML,

  alEntrar: entrarCockpit,
  render: () => renderCockpit(state.rawData?.estaciones || []),
  etiquetaModo: () => `COCKPIT: ${(cockpitState.producto || 'DIESEL').toUpperCase()}`,

  acciones
};