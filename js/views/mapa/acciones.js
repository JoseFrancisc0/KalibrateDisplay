/* ==========================================================
   views/mapa/acciones.js — Controladores reactivos de Mapa
   ========================================================== */

import { render, actualizarIndicadorModo } from '../../core/router.js';
import { state } from '../../core/state.js';
import { valorDe } from '../../shared/dom.js';
import { inicializarSearchableSelect } from '../../shared/combobox.js';
import { poblarSelectsSegmentacion } from '../../shared/segmentacion.js';
import { mapaState } from './state.js';

export function poblarFiltrosMapa() {
  if (!state.rawData?.estaciones) return;
  const estaciones = state.rawData.estaciones;

  poblarSelectsSegmentacion(estaciones, {
    gpc: 'sel-mapa-gpc',
    gop: 'sel-mapa-gop',
    jop: 'sel-mapa-jop',
    corredor: 'sel-mapa-corredor'
  });

  ['sel-mapa-gpc', 'sel-mapa-gop', 'sel-mapa-jop', 'sel-mapa-corredor'].forEach(id => {
    inicializarSearchableSelect(id);
  });

  const selProd = document.getElementById('sel-mapa-prod');
  if (selProd) selProd.value = mapaState.producto || 'Diesel';
}

export const acciones = {
  toggleDrawerMapa() {
    mapaState.drawerAbierto = !mapaState.drawerAbierto;
    const panel = document.getElementById('drawer-panel-mapa');
    const badge = document.getElementById('badge-mapa-filtros');
    if (panel) panel.style.display = mapaState.drawerAbierto ? 'block' : 'none';
    if (badge) badge.textContent = mapaState.drawerAbierto ? '▲ Ocultar' : '▼ Configurar';
  },

  cambiarProductoMapa() {
    const v = valorDe('sel-mapa-prod');
    if (v !== undefined) mapaState.producto = v;
    actualizarIndicadorModo();
    render();
  },

  cambiarGPCMapa() {
    const v = valorDe('sel-mapa-gpc');
    if (v !== undefined) mapaState.gpc = v;
    render();
  },

  cambiarGOPMapa() {
    const v = valorDe('sel-mapa-gop');
    if (v !== undefined) mapaState.gop = v;
    render();
  },

  cambiarJOPMapa() {
    const v = valorDe('sel-mapa-jop');
    if (v !== undefined) mapaState.jop = v;
    render();
  },

  cambiarCorredorMapa() {
    const v = valorDe('sel-mapa-corredor');
    if (v !== undefined) mapaState.corredor = v;
    render();
  },

  limpiarFiltrosMapa() {
    mapaState.gpc = 'TODOS';
    mapaState.gop = 'TODOS';
    mapaState.jop = 'TODOS';
    mapaState.corredor = 'TODOS';

    ['sel-mapa-gpc', 'sel-mapa-gop', 'sel-mapa-jop', 'sel-mapa-corredor'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.value = 'TODOS';
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    render();
  },

  seleccionarDepartamentoMapa(el) {
    const depto = el.dataset.arg;
    if (depto) {
      mapaState.deptoSeleccionado = depto;
      render();
    }
  },

  deseleccionarDeptoMapa() {
    mapaState.deptoSeleccionado = null;
    render();
  }
};