/* ==========================================================
   views/mapa/index.js — Definición del contrato de la vista
   Cobertura Nacional para core/router.js
   ========================================================== */

import { state } from '../../core/state.js';
import { mapaState } from './state.js';
import { railHTML } from './rail.js';
import { mapaHTML, renderMapa } from './vista.js';
import { acciones, poblarFiltrosMapa } from './acciones.js';
import { precargarMapaPeruSVG } from './perumap.js';

export const mapa = {
  id: 'MAPA',
  label: 'COBERTURA',
  tabId: 'tab-view-mapa',
  shellSelector: '#mapa-shell',
  display: 'flex',
  railId: 'rail-panel-mapa',
  usaTabbar: false,

  railHTML,
  mainHTML: mapaHTML,

  alEntrar: async () => {
    poblarFiltrosMapa();
    await precargarMapaPeruSVG();
  },
  render: () => renderMapa(state.rawData.estaciones),
  etiquetaModo: () => `PRODUCTO: ${(mapaState.producto || 'DIESEL').toUpperCase()}`,

  acciones,
  iniciarListeners: () => {}
};