/* ==========================================================
   views/heatmap/acciones.js — Controladores reactivos Heatmap
   ========================================================== */

import { render } from '../../core/router.js';
import { state } from '../../core/state.js';
import { valorDe, repoblarSelect } from '../../shared/dom.js';
import { inicializarSearchableSelect } from '../../shared/combobox.js';
import { poblarSelectsSegmentacion, valoresUnicos } from '../../shared/segmentacion.js';
import { heatmapState } from './state.js';

function sincronizarCascadaGeografica(estaciones) {
  const estacionesDepto = estaciones.filter(e => {
    if (heatmapState.departamento === 'TODOS') return true;
    const d = (e.departamento || '').trim().toUpperCase();
    return d === heatmapState.departamento;
  });

  heatmapState.provincia = repoblarSelect(
    'sel-heatmap-provincia',
    () => valoresUnicos(estacionesDepto, 'provincia'),
    heatmapState.provincia
  );

  const estacionesProv = estacionesDepto.filter(e => {
    if (heatmapState.provincia === 'TODOS') return true;
    const p = (e.provincia || '').trim().toUpperCase();
    return p === heatmapState.provincia;
  });

  heatmapState.distrito = repoblarSelect(
    'sel-heatmap-distrito',
    () => valoresUnicos(estacionesProv, 'distrito'),
    heatmapState.distrito
  );
}

export function poblarFiltrosHeatmap() {
  if (!state.rawData?.estaciones) return;
  const estaciones = state.rawData.estaciones;

  poblarSelectsSegmentacion(estaciones, {
    gpc: 'sel-heatmap-gpc',
    gop: 'sel-heatmap-gop',
    jop: 'sel-heatmap-jop',
    corredor: 'sel-heatmap-corredor',
    departamento: 'sel-heatmap-depto'
  });

  sincronizarCascadaGeografica(estaciones);

  [
    'sel-heatmap-gpc',
    'sel-heatmap-gop',
    'sel-heatmap-jop',
    'sel-heatmap-corredor',
    'sel-heatmap-depto',
    'sel-heatmap-provincia',
    'sel-heatmap-distrito'
  ].forEach(id => {
    inicializarSearchableSelect(id);
  });

  const selDepto = document.getElementById('sel-heatmap-depto');
  if (selDepto) selDepto.value = heatmapState.departamento || 'LIMA';
}

export const acciones = {
  toggleDrawerHeatmap() {
    heatmapState.drawerAbierto = !heatmapState.drawerAbierto;
    const panel = document.getElementById('drawer-panel-heatmap');
    const badge = document.getElementById('badge-heatmap-filtros');
    if (panel) panel.style.display = heatmapState.drawerAbierto ? 'block' : 'none';
    if (badge) badge.textContent = heatmapState.drawerAbierto ? '▲ Ocultar' : '▼ Configurar';
  },

  cambiarDeptoHeatmap() {
    const v = valorDe('sel-heatmap-depto');
    if (v !== undefined) {
      heatmapState.departamento = v;
      sincronizarCascadaGeografica(state.rawData.estaciones);
    }
    render();
  },

  cambiarProvinciaHeatmap() {
    const v = valorDe('sel-heatmap-provincia');
    if (v !== undefined) {
      heatmapState.provincia = v;
      sincronizarCascadaGeografica(state.rawData.estaciones);
    }
    render();
  },

  cambiarDistritoHeatmap() {
    const v = valorDe('sel-heatmap-distrito');
    if (v !== undefined) heatmapState.distrito = v;
    render();
  },

  cambiarGPCHeatmap() {
    const v = valorDe('sel-heatmap-gpc');
    if (v !== undefined) heatmapState.gpc = v;
    render();
  },

  cambiarGOPHeatmap() {
    const v = valorDe('sel-heatmap-gop');
    if (v !== undefined) heatmapState.gop = v;
    render();
  },

  cambiarJOPHeatmap() {
    const v = valorDe('sel-heatmap-jop');
    if (v !== undefined) heatmapState.jop = v;
    render();
  },

  cambiarCorredorHeatmap() {
    const v = valorDe('sel-heatmap-corredor');
    if (v !== undefined) heatmapState.corredor = v;
    render();
  },

  limpiarFiltrosHeatmap() {
    heatmapState.gpc = 'TODOS';
    heatmapState.gop = 'TODOS';
    heatmapState.jop = 'TODOS';
    heatmapState.corredor = 'TODOS';
    heatmapState.provincia = 'TODOS';
    heatmapState.distrito = 'TODOS';

    ['sel-heatmap-gpc', 'sel-heatmap-gop', 'sel-heatmap-jop', 'sel-heatmap-corredor'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.value = 'TODOS';
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    sincronizarCascadaGeografica(state.rawData.estaciones);
    render();
  },

  ordenarHeatmap(el) {
    const col = el.dataset.arg;
    if (heatmapState.columnaOrden === col) {
      heatmapState.ordenAscendente = !heatmapState.ordenAscendente;
    } else {
      heatmapState.columnaOrden = col;
      heatmapState.ordenAscendente = (col === 'nombre'); // Nombre inicia asc (A-Z), números inician desc
    }
    render();
  }
};