/* ==========================================================
 views/cockpit/acciones.js — Eventos y hooks de Cockpit
 ========================================================== */

import { render, actualizarIndicadorModo } from '../../core/router.js';
import { state } from '../../core/state.js';
import { repoblarSelect, valorDe } from '../../shared/dom.js';
import { CAMBIOS_SEMANALES_URL } from '../../config/datos.js';
import { cockpitState } from './state.js';

export async function entrarCockpit() {
  poblarDeptosCockpit();
  const selP = document.getElementById('sel-cockpit-prod');
  if (selP) selP.value = cockpitState.producto;

  // Cargar datos semanales si aún no están en memoria
  if (!cockpitState.datosCambiosSemanales && !cockpitState.cargando) {
    cockpitState.cargando = true;
    try {
      const resp = await fetch(CAMBIOS_SEMANALES_URL);
      if (resp.ok) {
        const json = await resp.json();
        cockpitState.datosCambiosSemanales = json.datos || [];
      }
    } catch (e) {
      console.warn("No se pudieron cargar cambios semanales para Cockpit:", e);
    }
    cockpitState.cargando = false;
    render();
  }
}

export function poblarDeptosCockpit() {
  if (!state.rawData?.estaciones) return;
  const deptosSet = new Set();
  state.rawData.estaciones.forEach(e => {
    const d = (e.departamento || '').trim().toUpperCase();
    if (d) deptosSet.add(d);
  });
  
  cockpitState.departamento = repoblarSelect(
    'sel-cockpit-depto',
    Array.from(deptosSet).sort(),
    cockpitState.departamento
  );
}

export const acciones = {
  cambiarProductoCockpit(el) {
    const val = el?.value || valorDe('sel-cockpit-prod');
    if (val) {
      cockpitState.producto = val;
      actualizarIndicadorModo();
      render();
    }
  },
  cambiarDeptoCockpit(el) {
    const val = el?.value || valorDe('sel-cockpit-depto');
    if (val) {
      cockpitState.departamento = val;
      render();
    }
  }
};