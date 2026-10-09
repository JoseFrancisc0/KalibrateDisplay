/* ==========================================================
   views/margen/index.js — Contrato de la vista
   ========================================================== */
import { renderMargenMercado } from './grafico.js';
import { railMargenMercadoHTML } from './rail.js';
import { acciones, entrarMargenMercado, iniciarListenersMargenMercado } from './acciones.js';
import { margenMercadoState } from './state.js';

export const margenMercado = {
  id: 'MARGEN_MERCADO',
  label: 'MARGEN MERCADO',
  tabId: 'tab-view-margen-mercado',
  shellSelector: '#margen-mercado-shell',
  display: 'flex',
  railId: 'rail-panel-margen-mercado',
  usaTabbar: false,
  railHTML: railMargenMercadoHTML,
  mainHTML: () => `
    <div id="margen-mercado-shell" style="display:none; flex:1; min-height:0; height:100%; padding:8px 10px 6px; box-sizing:border-box;"></div>
  `,
  alEntrar: entrarMargenMercado,
  render: () => {
    const shell = document.getElementById('margen-mercado-shell');
    if (shell) renderMargenMercado(shell);
  },
  etiquetaModo: () => `PRODUCTO: ${(margenMercadoState.producto || 'DIESEL').toUpperCase()} (MARGEN MERCADO)`,
  acciones,
  iniciarListeners: iniciarListenersMargenMercado
};