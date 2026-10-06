/* ==========================================================
   views/matriz/paginacion.js — reparto de estaciones en las
   pestañas inferiores.

   La dimensión que divide las pestañas (corredor, departamento,
   GPC group...) la decide matrizState.agrupacionTabs; el catálogo
   de dimensiones está en AGRUPACIONES (config.js).
   ========================================================== */

import { matrizState as state } from './state.js';
import { ROW_H, THEAD_H, getAgrupacion } from './config.js';

export function recalcularCapacidad() {
  const shell = document.getElementById('table-scroll');
  const h = shell ? shell.clientHeight : 600;
  const n = Math.floor((h - THEAD_H - 2) / ROW_H);
  state.filasPorPagina = Math.max(5, n);
}

/* Limpia el prefijo repetitivo de la etiqueta ("CORREDOR AREQUIPA" → "AREQUIPA") */
export function formatearNombreGrupo(valor, agrupacion) {
  const v = (valor || '').trim().toUpperCase();
  const pref = (agrupacion && agrupacion.prefijo) ? agrupacion.prefijo : '';
  if (pref && v.startsWith(pref)) {
    return v.slice(pref.length).trim() || v;
  }
  return v;
}

export function construirTabs(lista, onSelect) {
  const agr = getAgrupacion(state.agrupacionTabs);

  const grupos = {};
  lista.forEach(est => {
    const bruto = est[agr.campo];
    const clave = (bruto && String(bruto).trim())
      ? String(bruto).trim().toUpperCase()
      : agr.sinValor;
    if (!grupos[clave]) grupos[clave] = [];
    grupos[clave].push(est);
  });

  state.gruposMap = grupos;
  state.grupos = Object.keys(grupos).sort((a, b) => {
    if (a === agr.sinValor) return 1;
    if (b === agr.sinValor) return -1;
    return a.localeCompare(b);
  });

  /* Si el grupo activo ya no existe (cambio de dimensión o de búsqueda),
     se recupera el último elegido en esta dimensión; si tampoco está,
     cae al primero. */
  if (!state.grupos.includes(state.grupoActivo)) {
    const recordado = state.grupoActivoPorAgrupacion[agr.id];
    state.grupoActivo = state.grupos.includes(recordado)
      ? recordado
      : (state.grupos[0] || '');
    state.subPaginaGrupo = 0;
  }
  state.grupoActivoPorAgrupacion[agr.id] = state.grupoActivo;

  const cont = document.getElementById('tabs');
  if (!cont) return;

  cont.innerHTML = '';
  state.grupos.forEach((grupo) => {
    const count = grupos[grupo].length;
    const btn = document.createElement('button');
    btn.className = 'tab' + (grupo === state.grupoActivo ? ' active' : '');

    // Etiqueta limpia + Badge de cantidad
    btn.innerHTML = `
      <span>${formatearNombreGrupo(grupo, agr)}</span>
      <span class="tab-badge">${count}</span>
    `;
    btn.title = `${grupo} (${count} estación${count === 1 ? '' : 'es'})`;

    btn.onclick = () => {
      if (state.grupoActivo === grupo) return;
      state.grupoActivo = grupo;
      state.grupoActivoPorAgrupacion[agr.id] = grupo;
      state.subPaginaGrupo = 0;
      onSelect();
    };
    cont.appendChild(btn);
  });

  const tabCountEl = document.getElementById('tab-count');
  if (tabCountEl) {
    tabCountEl.innerText = `${lista.length} · ${state.grupos.length} ${agr.plural}`;
  }

  const labelEl = document.getElementById('tabbar-group-label');
  if (labelEl) labelEl.innerText = agr.label;

  document.querySelectorAll('#dropup-agrupacion .dropup-item').forEach(el => {
    el.classList.toggle('active', el.dataset.agr === agr.id);
  });
}

export function obtenerEstacionesVisibles() {
  const ests = state.gruposMap[state.grupoActivo] || [];
  const totalSubpaginas = Math.ceil(ests.length / state.filasPorPagina) || 1;

  if (state.subPaginaGrupo >= totalSubpaginas) {
    state.subPaginaGrupo = totalSubpaginas - 1;
  }
  if (state.subPaginaGrupo < 0) {
    state.subPaginaGrupo = 0;
  }

  const inicio = state.subPaginaGrupo * state.filasPorPagina;
  const fin = inicio + state.filasPorPagina;

  return {
    estaciones: ests.slice(inicio, fin),
    totalEstacionesGrupo: ests.length,
    subPaginaActual: state.subPaginaGrupo + 1,
    totalSubpaginas: totalSubpaginas,
    tieneAnterior: state.subPaginaGrupo > 0,
    tieneSiguiente: state.subPaginaGrupo < totalSubpaginas - 1
  };
}
