/* ==========================================================
   views/estacion/acciones.js — entrada/salida del nivel
   ESTACIÓN y cambio de sub-vista.
   ========================================================== */

import { render, refrescarViewBar } from '../../core/router.js';
import { detenerPropagacion } from '../../core/events.js';
import { state } from '../../core/state.js';
import { cargarDetalleEstacion } from '../../core/data.js';
import { estacionState } from './state.js';

export const acciones = {
  async abrirDetalleEstacion(el, ev) {
    detenerPropagacion(ev);
    const siteId = el.dataset.arg;

    state.modoNivel = 'ESTACION';
    estacionState.seleccionadaId = siteId;
    estacionState.subVista = 'ESTADO';

    refrescarViewBar();
    render();

    if (estacionState.cache[siteId]) {
      estacionState.dataActiva = estacionState.cache[siteId];
    } else {
      estacionState.cargando = true;
      render();
      const data = await cargarDetalleEstacion(siteId);
      estacionState.dataActiva = data;
      estacionState.cache[siteId] = data;
      estacionState.cargando = false;
    }

    refrescarViewBar();
    render();
  },

  volverAMacro() {
    state.modoNivel = 'GENERAL';
    estacionState.seleccionadaId = null;
    estacionState.dataActiva = null;

    refrescarViewBar();
    render();
  },

  setSubVistaEstacion(el) {
    estacionState.subVista = el.dataset.arg;
    refrescarViewBar();
    render();
  },
};
